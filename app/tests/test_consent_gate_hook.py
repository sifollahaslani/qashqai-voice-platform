"""Subprocess-level smoke tests for hooks/consent-gate.sh (Step 4).

These tests are the contract for the rewritten hook. They cover every
documented exit path, including the four consent states under the new
ConsentStatus enum.

Tests skip cleanly if bash is not available (e.g. unusual CI runner).

Run with:  pytest app/tests/test_consent_gate_hook.py -v
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path

import pytest

HOOK = Path(__file__).resolve().parent.parent.parent / "hooks" / "consent-gate.sh"
HAS_BASH = shutil.which("bash") is not None


def _run_hook(command: str, entries_file: Path) -> tuple[int, str]:
    """Invoke the hook with the given Bash command and entries-file override.

    Returns (returncode, combined_output).
    """
    env = os.environ.copy()
    env["CLAUDE_TOOL_INPUT_COMMAND"] = command
    env["QV_ENTRIES_FILE"] = str(entries_file)
    proc = subprocess.run(
        ["bash", str(HOOK)],
        env=env,
        capture_output=True,
        text=True,
    )
    return proc.returncode, proc.stdout + proc.stderr


def _write_entries(path: Path, entries: list[dict]) -> None:
    path.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")


def _entry(speaker_id: str, consent_status: str, entry_id: str = "e1") -> dict:
    """Minimal entry shape sufficient for the hook to make a decision."""
    return {
        "id": entry_id,
        "speaker_id": speaker_id,
        "consent_status": consent_status,
        # remaining fields are not read by the hook, so omitted
    }


pytestmark = pytest.mark.skipif(not HAS_BASH, reason="bash not available")


# ---------------------------------------------------------------------------
# Scoping — commands without a speaker reference are not gated
# ---------------------------------------------------------------------------


def test_no_speaker_reference_allows_through(tmp_path):
    """A command with no SPK-NNN reference is not subject to the gate.

    This is intentional scoping, not a silent fallback: the hook gates speaker
    data access, not every Bash command. Documented at the top of the hook.
    """
    f = tmp_path / "entries.json"
    _write_entries(f, [_entry("SPK-001", "pending")])  # exists but irrelevant
    rc, out = _run_hook("ls -la /tmp", f)
    assert rc == 0, out


# ---------------------------------------------------------------------------
# Per-consent-state behaviour — the four ConsentStatus values
# ---------------------------------------------------------------------------


def test_confirmed_allows_through(tmp_path):
    f = tmp_path / "entries.json"
    _write_entries(f, [_entry("SPK-001", "confirmed")])
    rc, out = _run_hook("python process.py --speaker SPK-001", f)
    assert rc == 0, out
    assert "all confirmed" in out


def test_pending_blocks(tmp_path):
    f = tmp_path / "entries.json"
    _write_entries(f, [_entry("SPK-001", "pending")])
    rc, out = _run_hook("python process.py --speaker SPK-001", f)
    assert rc == 1
    assert "pending" in out
    assert "blocked" in out.lower()


def test_withdrawn_blocks(tmp_path):
    """Withdrawn consent must block — this is the lifecycle counterpart of
    confirmed and the reason the new enum exists at all.
    """
    f = tmp_path / "entries.json"
    _write_entries(f, [_entry("SPK-001", "withdrawn")])
    rc, out = _run_hook("python process.py --speaker SPK-001", f)
    assert rc == 1
    assert "withdrawn" in out
    assert "blocked" in out.lower()


def test_restricted_blocks(tmp_path):
    """Restricted consent is not a green light — it's a limited consent state
    and must not authorise free-form processing through this hook.
    """
    f = tmp_path / "entries.json"
    _write_entries(f, [_entry("SPK-001", "restricted")])
    rc, out = _run_hook("python process.py --speaker SPK-001", f)
    assert rc == 1
    assert "restricted" in out
    assert "blocked" in out.lower()


# ---------------------------------------------------------------------------
# All-or-nothing per speaker — one bad entry blocks the whole speaker
# ---------------------------------------------------------------------------


def test_mixed_entries_one_unconfirmed_blocks(tmp_path):
    f = tmp_path / "entries.json"
    _write_entries(
        f,
        [
            _entry("SPK-001", "confirmed", "e1"),
            _entry("SPK-001", "pending", "e2"),
        ],
    )
    rc, out = _run_hook("python process.py --speaker SPK-001", f)
    assert rc == 1
    assert "e2" in out


def test_multiple_confirmed_entries_allow(tmp_path):
    f = tmp_path / "entries.json"
    _write_entries(
        f,
        [
            _entry("SPK-001", "confirmed", "e1"),
            _entry("SPK-001", "confirmed", "e2"),
        ],
    )
    rc, out = _run_hook("python process.py --speaker SPK-001", f)
    assert rc == 0, out


# ---------------------------------------------------------------------------
# Case sensitivity — lowercase mention cannot sneak past
# ---------------------------------------------------------------------------


def test_lowercase_mention_still_gated(tmp_path):
    """A command using lowercase `spk-001` must still trigger the gate.

    Catches `cat /data/spk-001/file.txt`-style mentions. The hook detects
    case-insensitively but looks up the canonical uppercase form.
    """
    f = tmp_path / "entries.json"
    _write_entries(f, [_entry("SPK-001", "pending")])
    rc, out = _run_hook("cat /tmp/spk-001/notes.txt", f)
    assert rc == 1
    assert "SPK-001" in out  # normalized for lookup
    assert "pending" in out


def test_lowercase_mention_confirmed_speaker_allowed(tmp_path):
    f = tmp_path / "entries.json"
    _write_entries(f, [_entry("SPK-001", "confirmed")])
    rc, out = _run_hook("cat /tmp/spk-001/notes.txt", f)
    assert rc == 0, out


# ---------------------------------------------------------------------------
# Failure modes — missing store, corrupt store, unknown speaker
# ---------------------------------------------------------------------------


def test_unknown_speaker_blocks(tmp_path):
    f = tmp_path / "entries.json"
    _write_entries(f, [_entry("SPK-001", "confirmed")])
    rc, out = _run_hook("python process.py --speaker SPK-999", f)
    assert rc == 1
    assert "no entries found" in out.lower() or "intake" in out.lower()


def test_missing_entries_file_blocks(tmp_path):
    """If the store file does not exist, the hook must fail closed."""
    missing = tmp_path / "does-not-exist.json"
    rc, out = _run_hook("python process.py --speaker SPK-001", missing)
    assert rc == 1
    assert "not found" in out.lower() or "blocked" in out.lower()


def test_corrupt_entries_file_blocks(tmp_path):
    """If the store is unparseable, the hook must fail closed."""
    f = tmp_path / "entries.json"
    f.write_text("{ not json", encoding="utf-8")
    rc, out = _run_hook("python process.py --speaker SPK-001", f)
    assert rc == 1
    assert "not valid json" in out.lower() or "blocked" in out.lower()
