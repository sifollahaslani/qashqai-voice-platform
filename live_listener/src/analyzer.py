"""
analyzer.py — Claude API call and JSON response handling.

Sends the rolling transcript buffer to Claude and returns a parsed
analysis dict. Never stores audio. Operates on text only.
"""

import json
import os
from typing import Any

import anthropic

from prompts import SYSTEM_PROMPT, build_user_prompt


def get_anthropic_client() -> anthropic.Anthropic:
    """
    Create an Anthropic client using ANTHROPIC_API_KEY from environment.

    Raises:
        RuntimeError: If ANTHROPIC_API_KEY is not set.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set. "
            "Copy .env.example to .env and fill in your key."
        )
    return anthropic.Anthropic(api_key=api_key)


def get_mistral_client() -> Any:
    """
    Create a Mistral client using MISTRAL_API_KEY from environment.

    Raises:
        RuntimeError: If MISTRAL_API_KEY is not set or mistralai is not installed.
    """
    api_key = os.environ.get("MISTRAL_API_KEY")
    if not api_key:
        raise RuntimeError(
            "MISTRAL_API_KEY is not set. "
            "Copy .env.example to .env and fill in your key."
        )
    try:
        from mistralai import Mistral
    except ImportError as exc:
        raise RuntimeError(
            "mistralai package is not installed. Run: pip install mistralai"
        ) from exc
    return Mistral(api_key=api_key)


def analyze_transcript_mistral(
    client: Any,
    transcript_chunks: list[str],
    model: str,
) -> dict:
    """
    Send the rolling transcript buffer to Mistral for linguistic analysis.

    Uses the same system prompt and JSON output contract as the Anthropic path.
    Only text/transcript is sent — no audio, no raw recordings.

    Args:
        client: Authenticated mistralai.Mistral client.
        transcript_chunks: List of up to 3 transcript strings (oldest first).
        model: Mistral model ID from MISTRAL_MODEL env var.

    Returns:
        Parsed analysis dict with keys:
            qashqai_text, persian_translation, key_vocabulary,
            linguistic_note, topic, emotional_tone.

    Raises:
        RuntimeError: On Mistral API errors.
        ValueError: If Mistral returns invalid JSON.
    """
    user_prompt = build_user_prompt(transcript_chunks)

    try:
        response = client.chat.complete(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )
    except Exception as exc:
        raise RuntimeError(f"Mistral API error: {exc}") from exc

    raw_text = response.choices[0].message.content.strip()

    # Strip markdown code fences if Mistral wraps the JSON
    if raw_text.startswith("```"):
        lines = raw_text.splitlines()
        inner = [line for line in lines if not line.startswith("```")]
        raw_text = "\n".join(inner).strip()

    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Mistral returned non-JSON output: {raw_text[:200]}"
        ) from exc

    return result


def analyze_transcript(
    client: anthropic.Anthropic,
    transcript_chunks: list[str],
    model: str,
) -> dict:
    """
    Send the rolling transcript buffer to Claude for linguistic analysis.

    Args:
        client: Authenticated Anthropic client.
        transcript_chunks: List of up to 3 transcript strings (oldest first).
        model: Claude model ID from ANTHROPIC_MODEL env var.

    Returns:
        Parsed analysis dict with keys:
            qashqai_text, persian_translation, key_vocabulary,
            linguistic_note, topic, emotional_tone.

    Raises:
        anthropic.AuthenticationError: If the API key is invalid.
        anthropic.APIConnectionError: On network failure.
        anthropic.APIStatusError: On non-2xx API response.
        ValueError: If Claude returns invalid JSON.
    """
    user_prompt = build_user_prompt(transcript_chunks)

    message = client.messages.create(
        model=model,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    raw_text = message.content[0].text.strip()

    # Strip markdown code fences if Claude wraps the JSON
    if raw_text.startswith("```"):
        lines = raw_text.splitlines()
        # Remove opening fence (```json or ```) and closing fence (```)
        inner = [
            line for line in lines
            if not line.startswith("```")
        ]
        raw_text = "\n".join(inner).strip()

    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Claude returned non-JSON output: {raw_text[:200]}"
        ) from exc

    return result


def format_analysis_for_terminal(analysis: dict) -> str:
    """
    Format the analysis dict as indented JSON for terminal display.

    Args:
        analysis: Parsed analysis dict from analyze_transcript().

    Returns:
        UTF-8 JSON string with Persian preserved (ensure_ascii=False).
    """
    return json.dumps(analysis, ensure_ascii=False, indent=2)
