"""
live_listener.py — QashqAI Live Listener main loop.

Privacy contract (enforced in this file):
  - NO audio written to disk, ever.
  - Raw audio exists only in memory for the minimum time needed for
    transcription (one chunk at a time).
  - The rolling transcript buffer holds at most 3 chunks.
  - Both the audio chunk and the buffer are explicitly cleared on exit.
  - In --local-stt mode, audio never leaves the device. Transcript text
    (not audio) is saved to transcripts/transcript_YYYYMMDD_HHMMSS.txt.

Usage:
    python src/live_listener.py                          # smoke-test (default)
    python src/live_listener.py --fieldwork --local-stt  # local STT, no API
    python src/live_listener.py --fieldwork --zdr-confirmed
    python src/live_listener.py --fieldwork --consent-override

Requires:
    ANTHROPIC_API_KEY, ANTHROPIC_MODEL always.
    OPENAI_API_KEY only for non-local-stt fieldwork and smoke-test.
    (copy .env.example to .env and fill in your keys)
"""

import io
import os
import sys
import wave
import collections
import datetime
import pathlib

# Force UTF-8 output on Windows (German locale defaults to cp1252,
# which cannot encode Arabic-script characters used in terminal output).
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr.encoding and sys.stderr.encoding.lower() != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8")

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
CHUNK_SECONDS = 20          # Duration of each audio chunk (OpenAI STT path)
LOCAL_CHUNK_SECONDS = 10    # Duration for local STT — shorter, more responsive
BUFFER_MAX_CHUNKS = 3       # Rolling transcript buffer size
DTYPE = "float32"           # sounddevice capture format
TRANSCRIPTS_DIR = pathlib.Path("transcripts")   # Local STT session logs

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
# Local STT — faster-whisper (audio never leaves device)
# ---------------------------------------------------------------------------

def transcribe_chunk_local(whisper_model, frames: np.ndarray) -> tuple[str, str]:
    """
    Transcribe audio using a local faster-whisper model.

    Audio is passed as a numpy float32 array directly — no BytesIO, no disk
    write, no network call. faster-whisper accepts numpy arrays natively.

    Args:
        whisper_model: Loaded faster_whisper.WhisperModel instance.
        frames: 1-D float32 numpy array of audio samples in [-1.0, 1.0].

    Returns:
        Tuple of (transcript_text, detected_language_code).
        transcript_text is empty string if nothing was detected.
    """
    segments_gen, info = whisper_model.transcribe(
        frames,
        language=None,      # auto-detect
        vad_filter=True,    # skip silent sections
        beam_size=5,
    )
    # Consume the lazy generator; each segment has .text, .start, .end
    segments = list(segments_gen)
    text = " ".join(seg.text.strip() for seg in segments).strip()
    return text, info.language


def run_local_listener(whisper_model, anthropic_client, model: str) -> None:
    """
    Fieldwork loop using local faster-whisper STT.

    Audio is captured in 10-second chunks, transcribed locally, and
    appended to a rolling in-memory buffer. Each chunk is also written
    to a timestamped transcript file in transcripts/. Raw audio is
    discarded immediately after transcription.

    No audio ever leaves the device in this mode.

    Args:
        whisper_model: Loaded faster_whisper.WhisperModel instance.
        anthropic_client: Authenticated Anthropic client.
        model: Claude model ID string.
    """
    transcript_buffer: collections.deque[str] = collections.deque(maxlen=BUFFER_MAX_CHUNKS)
    chunk_count = 0
    current_frames: np.ndarray | None = None
    transcript_file = None

    # Prepare transcript file
    TRANSCRIPTS_DIR.mkdir(exist_ok=True)
    session_ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    transcript_path = TRANSCRIPTS_DIR / f"transcript_{session_ts}.txt"

    print(f"  📂  رونوشت جلسه: {transcript_path}")
    print("  🎙️  [local-stt] در حال گوش دادن... (Ctrl+C برای توقف)\n")

    try:
        transcript_file = open(transcript_path, "w", encoding="utf-8")
        transcript_file.write("# QashqAI Live Listener — Local STT Session\n")
        transcript_file.write(f"# Started: {datetime.datetime.now().isoformat()}\n")
        transcript_file.write("# Model: faster-whisper small / cpu / int8\n")
        transcript_file.write("# Audio: captured locally, never transmitted\n\n")

        while True:
            print(f"  ⏺  بخش {chunk_count + 1} — در حال ضبط {LOCAL_CHUNK_SECONDS} ثانیه...")

            current_frames = sd.rec(
                frames=LOCAL_CHUNK_SECONDS * SAMPLE_RATE,
                samplerate=SAMPLE_RATE,
                channels=CHANNELS,
                dtype=DTYPE,
            )
            sd.wait()

            audio_chunk = current_frames.flatten()

            # --- Transcribe locally ---
            print("  📝  در حال رونویسی محلی (faster-whisper)...")
            try:
                transcript, detected_lang = transcribe_chunk_local(whisper_model, audio_chunk)
            finally:
                # Discard raw audio immediately regardless of success or failure
                del audio_chunk
                current_frames = None

            if not transcript:
                print("  ℹ️   متنی تشخیص داده نشد — بخش بعدی.\n")
                chunk_count += 1
                continue

            ts = datetime.datetime.now().strftime("%H:%M:%S")
            preview = transcript[:80] + ("..." if len(transcript) > 80 else "")
            print(f"  ✅  [{ts}] [{detected_lang}] {preview}\n")

            # Write transcript line to file
            transcript_file.write(f"[{ts}] [{detected_lang}] {transcript}\n")
            transcript_file.flush()

            transcript_buffer.append(transcript)
            chunk_count += 1

            # --- Claude analysis ---
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
                transcript_file.write(f"[analysis]\n{output}\n\n")
                transcript_file.flush()
            except ValueError as exc:
                print(f"  ⚠️   پاسخ Claude قابل تجزیه نبود: {exc}\n")
            except Exception as exc:
                print(f"  ⚠️   خطا در تحلیل Claude: {exc}\n")

    except KeyboardInterrupt:
        pass   # falls through to finally

    finally:
        transcript_buffer.clear()
        current_frames = None
        if transcript_file and not transcript_file.closed:
            transcript_file.write(
                f"\n# Session ended: {datetime.datetime.now().isoformat()}\n"
            )
            transcript_file.close()

        print("\n\n" + "=" * 60)
        print("  جلسه پایان یافت.")
        print("  هیچ داده صوتی ذخیره نشد.")
        print("  بافر متن پاک شد.")
        if transcript_path.exists():
            print(f"  📄  رونوشت: {transcript_path}")
        print("=" * 60 + "\n")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def run_smoke_test(openai_client: OpenAI) -> None:
    """
    Smoke test: record 7 seconds, transcribe via Whisper, print result.
    No Claude call. No rolling buffer. No fieldwork data.

    Args:
        openai_client: Authenticated OpenAI client.
    """
    smoke_seconds = 7
    frames: np.ndarray | None = None
    transcript_buffer: collections.deque[str] = collections.deque(maxlen=BUFFER_MAX_CHUNKS)

    print("\n[smoke-test] Recording for 7 seconds — speak a short English test sentence.")
    print("[smoke-test] Example: \"this is a microphone test, one two three\"\n")

    try:
        frames = sd.rec(
            frames=smoke_seconds * SAMPLE_RATE,
            samplerate=SAMPLE_RATE,
            channels=CHANNELS,
            dtype=DTYPE,
        )
        sd.wait()

        audio_chunk = frames.flatten()
        print("[smoke-test] Transcribing via POST https://api.openai.com/v1/audio/transcriptions ...")

        try:
            transcript = transcribe_chunk(openai_client, audio_chunk)
        finally:
            # Discard raw audio immediately regardless of success or failure
            del audio_chunk
            frames = None

        print(f"\n[smoke-test] Transcript: \"{transcript}\"\n")
        transcript_buffer.append(transcript)

    except AuthenticationError:
        print("[smoke-test] ERROR: OPENAI_API_KEY is invalid.")
    except APIConnectionError:
        print("[smoke-test] ERROR: Network failure reaching OpenAI.")
    except APIStatusError as exc:
        print(f"[smoke-test] ERROR: OpenAI API returned {exc.status_code}.")
    except sd.PortAudioError as exc:
        print(f"[smoke-test] ERROR: Microphone not accessible: {exc}")
    except KeyboardInterrupt:
        print("\n[smoke-test] Interrupted by user.")
    finally:
        # Guaranteed cleanup
        transcript_buffer.clear()
        frames = None
        print("[smoke-test] Buffer cleared.")
        print("[smoke-test] No audio files written.")
        print("[smoke-test] Done.\n")


CONSENT_OVERRIDE_SENTENCE = (
    "I accept that audio leaves the device and is processed by OpenAI without ZDR"
)


def enforce_fieldwork_gate(flags: set[str]) -> None:
    """
    Hard gate for fieldwork mode — must be passed before any father/Qashqai session.

    Requires exactly one of:
        --local-stt         Use local faster-whisper — audio never leaves device.
                            10-second chunks. Transcripts saved to transcripts/.
        --zdr-confirmed     User asserts Zero Data Retention is active on their
                            OpenAI organisation. Prints verification reminder.
        --consent-override  User types the full consent sentence accepting that
                            audio leaves the device without ZDR.

    Args:
        flags: Set of CLI flags present in sys.argv.

    Raises:
        SystemExit(1): If none of the required sub-flags are provided, or if
                       the user fails the confirmation step.
    """
    has_zdr = "--zdr-confirmed" in flags
    has_local = "--local-stt" in flags
    has_override = "--consent-override" in flags

    if not (has_zdr or has_local or has_override):
        print("\n" + "=" * 60)
        print("  FIELDWORK GATE — حفاظت از حریم خصوصی گوینده")
        print("=" * 60)
        print()
        print("  حالت کار میدانی نیاز به یکی از گزینه‌های زیر دارد:")
        print("  Fieldwork mode requires one of the following flags:")
        print()
        print("  --local-stt")
        print("      Use local faster-whisper — audio never leaves the device.")
        print("      صدا هرگز دستگاه را ترک نمی‌کند.")
        print()
        print("  --zdr-confirmed")
        print("      Zero Data Retention is active on your OpenAI organisation.")
        print("      صدای پدر بدون ذخیره‌سازی پردازش می‌شود.")
        print()
        print("  --consent-override")
        print("      Explicit documented consent accepting external API processing.")
        print("      رضایت مستند برای پردازش توسط API خارجی بدون ZDR.")
        print()
        print("  Without one of these, fieldwork cannot begin.")
        print("  بدون یکی از این گزینه‌ها، کار میدانی امکان‌پذیر نیست.")
        print("=" * 60 + "\n")
        sys.exit(1)

    if has_local:
        # Gate passes — local STT is the privacy-safest option.
        # main() will load the model and call run_local_listener().
        print("\n  ✅  [local-stt] صدا هرگز دستگاه را ترک نمی‌کند.")
        print("      رونوشت در transcripts/ ذخیره می‌شود.\n")
        return

    if has_zdr:
        print("\n" + "=" * 60)
        print("  --zdr-confirmed: Zero Data Retention verification")
        print("=" * 60)
        print()
        print("  ⚠️  You have asserted that ZDR is active on your OpenAI organisation.")
        print("  Before continuing, verify this is true:")
        print()
        print("  1. Go to: https://platform.openai.com/settings/organization/general")
        print("  2. Confirm Zero Data Retention is listed as enabled.")
        print("  3. If unsure, stop now and contact OpenAI support.")
        print()
        print("  If ZDR is NOT active, speaker audio will be retained")
        print("  by OpenAI for up to 30 days.")
        print()
        print("  آیا ZDR را در داشبورد OpenAI تأیید کرده‌اید؟ (y / n): ", end="")
        try:
            answer = input().strip().lower()
        except (EOFError, KeyboardInterrupt):
            print("\n  خروج — تأیید ZDR دریافت نشد.\n")
            sys.exit(1)
        if answer != "y":
            print("\n  خروج — بدون تأیید ZDR، کار میدانی انجام نمی‌شود.\n")
            sys.exit(1)
        print("\n  ✅ ZDR تأیید شد. ادامه می‌دهیم...\n")
        return

    if has_override:
        print("\n" + "=" * 60)
        print("  --consent-override: Explicit consent required")
        print("=" * 60)
        print()
        print("  ⚠️  Zero Data Retention is NOT confirmed.")
        print("  Audio will be sent to OpenAI and may be retained for up to 30 days.")
        print()
        print("  To proceed, type the following sentence exactly:")
        print()
        print(f"  \"{CONSENT_OVERRIDE_SENTENCE}\"")
        print()
        print("  > ", end="")
        try:
            answer = input().strip()
        except (EOFError, KeyboardInterrupt):
            print("\n  خروج — رضایت صریح دریافت نشد.\n")
            sys.exit(1)
        if answer != CONSENT_OVERRIDE_SENTENCE:
            print("\n  ❌ متن وارد شده مطابقت ندارد. خروج.\n")
            sys.exit(1)
        print("\n  ✅ رضایت صریح ثبت شد. ادامه می‌دهیم...\n")
        return


def main() -> None:
    """Application entry point.

    Flags:
        --dry-run-consent    Run only the consent gate, then exit.
                             No mic access, no API calls, no audio capture.
        --smoke-test         Record 7 seconds, transcribe, print result.
                             No Claude call. No fieldwork data. (default mode)
        --fieldwork          Enable real fieldwork mode (father's voice, Qashqai).
                             Requires one of:
                               --zdr-confirmed    ZDR active on OpenAI org
                               --local-stt        Local Whisper (TODO)
                               --consent-override Typed explicit consent
    """
    flags = set(sys.argv[1:])

    if "--dry-run-consent" in flags:
        print("\n[dry-run-consent] آزمایش دروازه رضایت — بدون میکروفون یا API")
        request_consent()
        print("[dry-run-consent] دروازه رضایت با موفقیت تست شد. خروج.\n")
        sys.exit(0)

    if "--fieldwork" not in flags:
        # Default: smoke-test mode. Requires only OPENAI_API_KEY.
        load_dotenv()
        openai_key = os.environ.get("OPENAI_API_KEY", "")
        if not openai_key:
            print("\n❌ OPENAI_API_KEY is not set. Copy .env.example to .env and fill it in.\n")
            sys.exit(1)
        request_consent()
        try:
            openai_client = OpenAI(api_key=openai_key)
        except Exception as exc:
            print(f"\n❌ Error creating OpenAI client: {exc}\n")
            sys.exit(1)
        run_smoke_test(openai_client)
        sys.exit(0)

    # --- Fieldwork mode ---
    enforce_fieldwork_gate(flags)

    if "--local-stt" in flags:
        # Local path: no OPENAI_API_KEY needed — only Anthropic for analysis.
        load_dotenv()
        anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "")
        model = os.environ.get("ANTHROPIC_MODEL", "")
        missing = [
            name for name, val in [
                ("ANTHROPIC_API_KEY", anthropic_key),
                ("ANTHROPIC_MODEL", model),
            ]
            if not val
        ]
        if missing:
            print(f"\n❌ متغیرهای محیطی تنظیم نشده: {', '.join(missing)}")
            print("   فایل .env.example را به .env کپی کرده و کلیدها را پر کنید.\n")
            sys.exit(1)

        request_consent()

        try:
            anthropic_client = get_anthropic_client()
        except RuntimeError as exc:
            print(f"\n❌ {exc}\n")
            sys.exit(1)

        try:
            sd.check_input_settings(samplerate=SAMPLE_RATE, channels=CHANNELS)
        except sd.PortAudioError as exc:
            print(f"\n❌ میکروفون در دسترس نیست: {exc}")
            print("   لطفاً دسترسی به میکروفون را در تنظیمات ویندوز فعال کنید.\n")
            sys.exit(1)

        print("\n  ⏳  در حال بارگذاری مدل Whisper محلی (small / cpu / int8)...")
        print("      (بارگذاری اولیه ممکن است چند ثانیه طول بکشد)\n")
        try:
            from faster_whisper import WhisperModel
            whisper_model = WhisperModel("small", device="cpu", compute_type="int8")
            print("  ✅  مدل بارگذاری شد.\n")
        except ImportError:
            print("\n❌ faster-whisper نصب نشده است.")
            print("   pip install faster-whisper\n")
            sys.exit(1)
        except Exception as exc:
            print(f"\n❌ خطا در بارگذاری مدل faster-whisper: {exc}\n")
            sys.exit(1)

        run_local_listener(whisper_model, anthropic_client, model)
        sys.exit(0)

    # --- Fieldwork mode with OpenAI STT (zdr-confirmed or consent-override) ---
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

    try:
        sd.check_input_settings(samplerate=SAMPLE_RATE, channels=CHANNELS)
    except sd.PortAudioError as exc:
        print(f"\n❌ میکروفون در دسترس نیست: {exc}")
        print("   لطفاً دسترسی به میکروفون را در تنظیمات ویندوز فعال کنید.\n")
        sys.exit(1)

    run_listener(openai_client, anthropic_client, model)


if __name__ == "__main__":
    main()
