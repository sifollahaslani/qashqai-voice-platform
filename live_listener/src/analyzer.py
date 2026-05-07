"""
analyzer.py — Claude API call and JSON response handling.

Sends the rolling transcript buffer to Claude and returns a parsed
analysis dict. Never stores audio. Operates on text only.
"""

import json
import os

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
