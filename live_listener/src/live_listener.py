"""
live_listener.py — QashqAI Live Listener main loop.

Privacy contract (enforced in this file):
  - NO audio written to disk, ever.
  - Raw audio exists only in memory for the minimum time needed for
    transcription (one 20-second chunk at a time).
  - The rolling transcript buffer holds at most 3 chunks (~60 seconds).
  - Both the audio chunk and the buffer are explicitly cleared on exit.

Usage:
    python src/live_listener.py

Requires:
    OPENAI_API_KEY, ANTHROPIC_API_KEY, ANTHROPIC_MODEL in environment
    (copy .env.example to .env and fill in your keys).
"""

import io
import os
import sys
import wave
import collections

import numpy as np
import sounddevice as sd
from dotenv import load_dotenv
from openai import OpenAI, AuthenticationError, APIConnectionError, APIStatusError

# Ensure imports work when run from any working directory
sys.path.insert(0, os.path.dirname(__file__))

from analyzer import get_anthropic_client, analyze_transcript, format_analysis_for_terminal

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SAMPLE_RATE = 16_000        # Hz — Whisper works well at 16 kHz
CHANNELS = 1                # Mono
CHUNK_SECONDS = 20          # Duration of each audio chunk
BUFFER_MAX_CHUNKS = 3       # Rolling transcript buffer size (~60 seconds)
DTYPE = "float32"           # sounddevice capture format

# ---------------------------------------------------------------------------
# Environment loading
# ---------------------------------------------------------------------------

def load_env() -> tuple[str, str, str]:
    """
    Load and validate required environment variables.

    Returns:
        Tuple of (openai_api_key, anthropic_api_key, anthropic_model).

    Raises:
        SystemExit: If any required variable is missing.
    """
    load_dotenv()

    openai_key = os.environ.get("OPENAI_API_KEY", "")
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "")
    model = os.environ.get("ANTHROPIC_MODEL", "")

    missing = [
        name for name, val in [
            ("OPENAI_API_KEY", openai_key),
            ("ANTHROPIC_API_KEY", anthropic_key),
            ("ANTHROPIC_MODEL", model),
        ]
        if not val
    ]

    if missing:
        print(f"\n❌ متغیرهای محیطی تنظیم نشده: {', '.join(missing)}")
        print("   فایل .env.example را به .env کپی کرده و کلیدها را پر کنید.\n")
        sys.exit(1)

    return openai_key, anthropic_key, model


# ---------------------------------------------------------------------------
# Consent gate
# ---------------------------------------------------------------------------

def request_consent() -> None:
    """
    Display the consent notice and require explicit confirmation.

    Exits immediately if consent is not given. This gate must run
    before any microphone access or audio capture begins.
    """
    print("\n" + "=" * 60)
    print("  QashqAI Live Listener — پروتکل رضایت لایه ۴")
    print("=" * 60)
    print()
    print("  این ابزار صدای پدر را برای تحلیل زبانی پردازش می‌کند.")
    print("  هیچ فایل صوتی ذخیره نمی‌شود.")
    print("  متن گفتار فقط در حافظه موقت نگه داشته می‌شود.")
    print()
    print("  ⚠️  قبل از شروع، رضایت صریح پدر باید تأیید شود.")
    print("      (پروتکل رضایت: docs/CONSENT_PROTOCOL.md)")
    print()

    try:
        answer = input("  آیا پدر رضایت صریح داده است؟ (y = بله / n = خیر): ").strip().lower()
    except (EOFError, KeyboardInterrupt):
        print("\n\n  خروج — رضایت دریافت نشد. هیچ داده‌ای ضبط نشد.\n")
        sys.exit(0)

    if answer != "y":
        print("\n  خروج — رضایت دریافت نشد. هیچ داده‌ای ضبط نشد.\n")
        sys.exit(0)

    print("\n  ✅ رضایت تأیید شد. جلسه شروع می‌شود...\n")


# ---------------------------------------------------------------------------
# In-memory audio → WAV bytes
# ---------------------------------------------------------------------------

def frames_to_wav_bytes(frames: np.ndarray, sample_rate: int) -> io.BytesIO:
    """
    Convert a numpy float32 audio array to a WAV-formatted BytesIO buffer.

    The buffer is created entirely in memory using the stdlib wave module.
    No temporary file is created or written to disk at any point.

    Args:
        frames: 1-D float32 numpy array of audio samples in [-1.0, 1.0].
        sample_rate: Sample rate in Hz.

    Returns:
        BytesIO positioned at offset 0, ready for reading.
    """
    # Convert float32 [-1, 1] to int16 [-32768, 32767]
    pcm = (frames * 32767).astype(np.int16)

    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(2)          # 16-bit = 2 bytes per sample
        wf.setframerate(sample_rate)
        wf.writeframes(pcm.tobytes())

    buffer.seek(0)
    return buffer


# ---------------------------------------------------------------------------
# Speech-to-text (in-memory only)
# ---------------------------------------------------------------------------

def transcribe_chunk(openai_client: OpenAI, frames: np.ndarray) -> str:
    """
    Transcribe a raw audio chunk using OpenAI Whisper via in-memory BytesIO.

    The WAV bytes are POSTed directly to the OpenAI API as multipart/form-data.
    No file is written to disk. The BytesIO buffer is garbage-collected after
    this function returns.

    Args:
        openai_client: Authenticated OpenAI client.
        frames: 1-D float32 numpy array from sounddevice capture.

    Returns:
        Transcribed text string. Empty string if transcription is empty.

    Raises:
        AuthenticationError: If OPENAI_API_KEY is invalid.
        APIConnectionError: On network failure.
        APIStatusError: On non-2xx response from OpenAI.
    """
    wav_buffer = frames_to_wav_bytes(frames, SAMPLE_RATE)
    wav_buffer.name = "audio.wav"   # Format hint for the API — not a file path

    response = openai_client.audio.transcriptions.create(
        model="whisper-1",
        file=wav_buffer,
        language=None,              # Auto-detect: Qashqai, Persian, Turkish
        prompt=(
            "این گفتار به زبان قشقایی، فارسی، یا ترکی است. "
            "لطفاً دقیق رونویسی کن."
        ),
    )

    # BytesIO is no longer referenced after this point — GC will reclaim it
    return response.text.strip()


# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------

def run_listener(openai_client: OpenAI, anthropic_client, model: str) -> None:
    """
    Main capture-transcribe-analyze loop.

    Captures audio in 20-second chunks using sounddevice, transcribes each
    chunk via Whisper (in-memory only), appends the transcript to a rolling
    3-chunk deque, then sends the buffer to Claude for Persian analysis.

    The loop runs until Ctrl+C. On exit, both the audio frames and the
    transcript buffer are explicitly cleared before the process ends.

    Args:
        openai_client: Authenticated OpenAI client.
        anthropic_client: Authenticated Anthropic client.
        model: Claude model ID string.
    """
    # Rolling transcript buffer — auto-evicts oldest chunk beyond maxlen
    transcript_buffer: collections.deque[str] = collections.deque(maxlen=BUFFER_MAX_CHUNKS)

    chunk_count = 0
    current_frames: np.ndarray | None = None

    print("  🎙️  در حال گوش دادن... (Ctrl+C برای توقف)\n")

    try:
        while True:
            # --- Capture one 20-second chunk ---
            print(f"  ⏺  بخش {chunk_count + 1} — در حال ضبط {CHUNK_SECONDS} ثانیه...")

            current_frames = sd.rec(
                frames=CHUNK_SECONDS * SAMPLE_RATE,
                samplerate=SAMPLE_RATE,
                channels=CHANNELS,
                dtype=DTYPE,
            )
            sd.wait()   # Block until recording is complete

            # Flatten to 1-D (sounddevice returns shape [frames, channels])
            audio_chunk = current_frames.flatten()

            # --- Transcribe (in-memory, no disk) ---
            print("  📝  در حال رونویسی...")
            try:
                transcript = transcribe_chunk(openai_client, audio_chunk)
            except AuthenticationError:
                print("  ❌  خطا: OPENAI_API_KEY نامعتبر است.")
                break
            except APIConnectionError:
                print("  ⚠️   خطای شبکه در STT — این بخش نادیده گرفته می‌شود.")
                transcript = ""
            except APIStatusError as exc:
                print(f"  ⚠️   خطای OpenAI API ({exc.status_code}) — این بخش نادیده گرفته می‌شود.")
                transcript = ""

            # --- Discard raw audio immediately after transcription ---
            del audio_chunk
            current_frames = None

            if not transcript:
                print("  ℹ️   متنی تشخیص داده نشد — بخش بعدی.\n")
                chunk_count += 1
                continue

            print(f"  ✅  رونویسی: {transcript[:80]}{'...' if len(transcript) > 80 else ''}\n")

            # --- Update rolling buffer ---
            transcript_buffer.append(transcript)
            chunk_count += 1

            # --- Analyze with Claude ---
            print("  🔍  در حال تحلیل زبانی...")
            try:
                analysis = analyze_transcript(
                    client=anthropic_client,
                    transcript_chunks=list(transcript_buffer),
                    model=model,
                )
                output = format_analysis_for_terminal(analysis)
                print("\n" + "─" * 60)
                print(output)
                print("─" * 60 + "\n")

            except ValueError as exc:
                print(f"  ⚠️   پاسخ Claude قابل تجزیه نبود: {exc}\n")
            except Exception as exc:
                print(f"  ⚠️   خطا در تحلیل Claude: {exc}\n")

    except KeyboardInterrupt:
        pass   # falls through to finally

    finally:
        # Guaranteed cleanup — runs even if an exception escapes the loop
        transcript_buffer.clear()
        current_frames = None

        print("\n\n" + "=" * 60)
        print("  جلسه پایان یافت.")
        print("  هیچ داده صوتی ذخیره نشد.")
        print("  بافر متن پاک شد.")
        print("=" * 60 + "\n")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    """Application entry point."""
    openai_key, anthropic_key, model = load_env()

    request_consent()

    try:
        openai_client = OpenAI(api_key=openai_key)
    except Exception as exc:
        print(f"\n❌ خطا در ایجاد کلاینت OpenAI: {exc}\n")
        sys.exit(1)

    try:
        anthropic_client = get_anthropic_client()
    except RuntimeError as exc:
        print(f"\n❌ {exc}\n")
        sys.exit(1)

    # Verify microphone access before entering the main loop
    try:
        sd.check_input_settings(samplerate=SAMPLE_RATE, channels=CHANNELS)
    except sd.PortAudioError as exc:
        print(f"\n❌ میکروفون در دسترس نیست: {exc}")
        print("   لطفاً دسترسی به میکروفون را در تنظیمات ویندوز فعال کنید.\n")
        sys.exit(1)

    run_listener(openai_client, anthropic_client, model)


if __name__ == "__main__":
    main()
