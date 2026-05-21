"""Tests for the Stage A migration audit contract.

Each of scripts/migrate_entries_v{1,2,3,4}.py must, on a successful
migration run, append exactly one line to data/audit_log.jsonl with
op="migration_prepared" and the documented fields.

If the audit append fails, the migration script must exit non-zero with a
loud message — never silently leave a prepared migration without a trace.

Tests load each migration module via importlib (no scripts/__init__.py
required) and monkeypatch its SOURCE_FILE / TARGET_FILE plus
app.main._AUDIT_LOG_FILE so the real data/ directory is never touched.
"""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SCRIPTS_DIR = REPO_ROOT / "scripts"


# ---------------------------------------------------------------------------
# Module loader (no scripts/__init__.py — uses spec_from_file_location)
# ---------------------------------------------------------------------------


def _load_migration(version: int):
    path = SCRIPTS_DIR / f"migrate_entries_v{version}.py"
    spec = importlib.util.spec_from_file_location(f"_test_migrate_v{version}", path)
    mod = importlib.util.module_from_spec(spec)
    # Add to sys.modules so the script's own `from app.main import ...` resolves
    sys.modules[spec.name] = mod
    spec.loader.exec_module(mod)
    return mod


# ---------------------------------------------------------------------------
# Default-isolate the real data/ directory for every test in this file
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def _isolate_paths(tmp_path, monkeypatch):
    """Every test here writes audit to a tmp file, never the real one."""
    monkeypatch.setattr(
        "app.main._AUDIT_LOG_FILE",
        tmp_path / "audit_log.jsonl",
    )
    monkeypatch.delenv("QV_API_TOKEN", raising=False)


# ---------------------------------------------------------------------------
# Per-migration fixtures — the input shape each script expects
# ---------------------------------------------------------------------------


def _v1_input() -> list[dict]:
    """Pre-v1 record (has legacy ai_usage_permission)."""
    return [{
        "id": "11111111-1111-1111-1111-111111111111",
        "title": "at",
        "content_type": "word",
        "language": "qashqai",
        "speaker_id": "SPK-001",  # already canonical; v1 doesn't normalise
        "consent_status": "pending",
        "ai_usage_permission": "review_required",
        "visibility_status": "internal",
    }]


def _v2_input() -> list[dict]:
    """Post-v1 record (still uses old enum value, e.g. 'public')."""
    return [{
        "id": "22222222-2222-2222-2222-222222222222",
        "title": "at",
        "content_type": "word",
        "language": "qashqai",
        "speaker_id": "SPK-001",
        "speaker_display_name": None,
        "recording_date": None,
        "collector_name": None,
        "consent_status": "pending",  # already canonical in v2
        "community_consent_status": "pending",
        "consent_withdrawable_until": None,
        "ai_training_allowed": False,
        "ai_inference_allowed": False,
        "ai_generation_allowed": False,
        "visibility_status": "internal",
        "notes": None,
    }]


def _v3_input() -> list[dict]:
    """Post-v2 record with lowercase speaker_id needing normalisation."""
    rec = _v2_input()[0]
    rec["speaker_id"] = "spk-001"
    return [rec]


def _v4_input() -> list[dict]:
    """Post-v3 record missing created_at / entry_schema_version."""
    return _v2_input()  # v2 shape is exactly missing the Step-5 fields


_INPUTS_BY_VERSION = {
    1: _v1_input,
    2: _v2_input,
    3: _v3_input,
    4: _v4_input,
}


# ---------------------------------------------------------------------------
# Helper: run a migration with isolated paths and return (exit_code, audit_lines)
# ---------------------------------------------------------------------------


def _run_migration(version: int, tmp_path: Path, monkeypatch) -> tuple[int, list[dict]]:
    mod = _load_migration(version)
    source = tmp_path / "entries.json"
    target = tmp_path / "entries.json.migrated"
    source.write_text(
        json.dumps(_INPUTS_BY_VERSION[version](), ensure_ascii=False),
        encoding="utf-8",
    )
    monkeypatch.setattr(mod, "SOURCE_FILE", source)
    monkeypatch.setattr(mod, "TARGET_FILE", target)

    rc = mod.main()

    audit_file = tmp_path / "audit_log.jsonl"
    if not audit_file.exists():
        return rc, []
    lines = [
        json.loads(line)
        for line in audit_file.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    return rc, lines


# ---------------------------------------------------------------------------
# Stage A — every migration writes exactly one migration_prepared audit line
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("version", [1, 2, 3, 4])
def test_migration_writes_one_audit_line_with_correct_shape(version, tmp_path, monkeypatch):
    rc, lines = _run_migration(version, tmp_path, monkeypatch)

    assert rc == 0, f"v{version} migration exited {rc} unexpectedly"
    assert len(lines) == 1, (
        f"v{version} produced {len(lines)} audit lines, expected 1"
    )

    line = lines[0]
    assert line["audit_schema_version"] == 3, (
        f"v{version} wrote audit_schema_version={line['audit_schema_version']!r}; "
        "Stage A bumps to 3"
    )
    assert line["op"] == "migration_prepared"
    assert line["migration_version"] == version
    assert line["record_count"] == 1
    assert line["request_origin"] == "local-cli"
    # ts is ISO UTC with Z suffix
    import re
    assert re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$", line["ts"]), line["ts"]
    # paths are recorded
    assert "source_path" in line and line["source_path"]
    assert "target_path" in line and line["target_path"]


# ---------------------------------------------------------------------------
# Failure path — audit failure makes migration exit non-zero, loud, NOT silent
# ---------------------------------------------------------------------------


def test_migration_audit_failure_exits_nonzero(tmp_path, monkeypatch, capsys):
    """When _append_audit raises OSError, the migration script must return 1
    and print a clear stderr message naming the migration step.

    The .migrated file IS still on disk — the failure is post-write — so the
    operator has a recoverable artifact but is told NOT to apply it without
    resolving the audit issue first.
    """
    mod = _load_migration(4)
    source = tmp_path / "entries.json"
    target = tmp_path / "entries.json.migrated"
    source.write_text(json.dumps(_v4_input(), ensure_ascii=False), encoding="utf-8")
    monkeypatch.setattr(mod, "SOURCE_FILE", source)
    monkeypatch.setattr(mod, "TARGET_FILE", target)

    # Patch the migration module's LOCAL binding of _append_audit (not the
    # one in app.main). The script does `from app.main import _append_audit`
    # at import time, so the bound name lives on the migration module itself.
    # Patching app.main._append_audit after import has no effect on this
    # binding — a real subtle gotcha worth flagging.
    with patch.object(mod, "_append_audit", side_effect=OSError("simulated audit disk full")):
        rc = mod.main()

    assert rc == 1, "audit failure must propagate as non-zero exit"

    captured = capsys.readouterr()
    # Loud, on stderr, naming both the failure and the remediation step
    assert "audit append failed" in captured.err.lower()
    assert "operator replacement" in captured.err.lower() or "trace" in captured.err.lower()

    # .migrated WAS written before audit ran — it must still be present
    assert target.exists(), "the prepared migration artifact must not be deleted"

    # The audit log was never written
    audit_file = tmp_path / "audit_log.jsonl"
    if audit_file.exists():
        assert audit_file.read_text(encoding="utf-8").strip() == ""


# ---------------------------------------------------------------------------
# Append-only — re-running a migration appends; never rewrites earlier lines
# ---------------------------------------------------------------------------


def test_migration_audit_is_append_only(tmp_path, monkeypatch):
    """If the migration is run twice, the second run appends a second line
    without touching the first. Same append-only contract as Step 6's
    create_entry audit lines."""
    mod = _load_migration(4)
    source = tmp_path / "entries.json"
    target = tmp_path / "entries.json.migrated"
    source.write_text(json.dumps(_v4_input(), ensure_ascii=False), encoding="utf-8")
    monkeypatch.setattr(mod, "SOURCE_FILE", source)
    monkeypatch.setattr(mod, "TARGET_FILE", target)

    audit_file = tmp_path / "audit_log.jsonl"

    assert mod.main() == 0
    first_bytes = audit_file.read_bytes()

    # Re-run (idempotent; v4 migration is a no-op on already-migrated input
    # because the autouse target was overwritten on the prior call... but the
    # audit log is append-only and gets a second line either way).
    assert mod.main() == 0
    after_bytes = audit_file.read_bytes()

    assert after_bytes.startswith(first_bytes), "audit log is not append-only"
    assert len(after_bytes) > len(first_bytes)

    lines = [
        json.loads(line)
        for line in audit_file.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    assert len(lines) == 2
    assert all(l["op"] == "migration_prepared" for l in lines)
    assert all(l["migration_version"] == 4 for l in lines)


# ---------------------------------------------------------------------------
# Cross-cutting — Stage A bump did not break Step-7 audit consumers
# ---------------------------------------------------------------------------


def test_audit_schema_version_constant_is_3(tmp_path):
    """The schema bump is the contract Stage A delivers; assert it explicitly."""
    from app.main import AUDIT_SCHEMA_VERSION
    assert AUDIT_SCHEMA_VERSION == 3, (
        f"AUDIT_SCHEMA_VERSION is {AUDIT_SCHEMA_VERSION}; Stage A requires 3."
    )
