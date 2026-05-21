"""Tests for _read_entries storage safety.

Run with:  pytest app/tests/test_entries_storage.py -v
Requires:  pip install pytest httpx fastapi
"""
import json
import os
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app, _read_entries, _ENTRIES_FILE


# ---------------------------------------------------------------------------
# _read_entries unit tests
# ---------------------------------------------------------------------------


def test_read_entries_missing_file(tmp_path, monkeypatch):
    """Returns [] when entries.json does not exist."""
    monkeypatch.setattr("app.main._ENTRIES_FILE", tmp_path / "entries.json")
    assert _read_entries() == []


def test_read_entries_valid_file(tmp_path, monkeypatch):
    """Returns list when entries.json is valid JSON."""
    f = tmp_path / "entries.json"
    f.write_text(json.dumps([{"id": "abc"}]), encoding="utf-8")
    monkeypatch.setattr("app.main._ENTRIES_FILE", f)
    assert _read_entries() == [{"id": "abc"}]


def test_read_entries_corrupt_json_raises(tmp_path, monkeypatch):
    """Raises RuntimeError (not returns []) on corrupt JSON."""
    f = tmp_path / "entries.json"
    f.write_text("{ not valid json", encoding="utf-8")
    monkeypatch.setattr("app.main._ENTRIES_FILE", f)
    with pytest.raises(RuntimeError, match="corrupt"):
        _read_entries()


def test_read_entries_os_error_raises(tmp_path, monkeypatch):
    """Raises RuntimeError (not returns []) on OS read error."""
    f = tmp_path / "entries.json"
    f.write_text("[]", encoding="utf-8")
    monkeypatch.setattr("app.main._ENTRIES_FILE", f)
    with patch("app.main._ENTRIES_FILE") as mock_path:
        mock_path.exists.return_value = True
        mock_path.read_text.side_effect = OSError("permission denied")
        with pytest.raises(RuntimeError, match="OS error"):
            _read_entries()


# ---------------------------------------------------------------------------
# POST /entries integration tests
# ---------------------------------------------------------------------------

_VALID_PAYLOAD = {
    "title": "Test word",
    "content_type": "word",
    "language": "qashqai",
    "speaker_id": "SPK-001",
    "consent_status": "pending",
    "community_consent_status": "pending",
    "visibility_status": "internal",
    "ai_training_allowed": False,
    "ai_inference_allowed": False,
    "ai_generation_allowed": False,
}


def test_post_entries_returns_500_on_corrupt_storage(tmp_path, monkeypatch):
    """POST /entries must return 500, not 201, when storage is corrupt."""
    f = tmp_path / "entries.json"
    f.write_text("{ bad", encoding="utf-8")
    monkeypatch.setattr("app.main._ENTRIES_FILE", f)
    monkeypatch.setattr("app.main._DATA_DIR", tmp_path)

    client = TestClient(app, raise_server_exceptions=False)
    response = client.post("/entries", json=_VALID_PAYLOAD)
    assert response.status_code == 500
    # Confirm the corrupt file was NOT overwritten
    assert f.read_text(encoding="utf-8") == "{ bad"


def test_get_entries_returns_500_on_corrupt_storage(tmp_path, monkeypatch):
    """GET /entries must return 500 when storage is corrupt."""
    f = tmp_path / "entries.json"
    f.write_text("{ bad", encoding="utf-8")
    monkeypatch.setattr("app.main._ENTRIES_FILE", f)

    client = TestClient(app, raise_server_exceptions=False)
    response = client.get("/entries")
    assert response.status_code == 500


def test_post_entries_success(tmp_path, monkeypatch):
    """POST /entries creates entry and persists it when storage is healthy."""
    f = tmp_path / "entries.json"
    monkeypatch.setattr("app.main._ENTRIES_FILE", f)
    monkeypatch.setattr("app.main._DATA_DIR", tmp_path)

    client = TestClient(app)
    response = client.post("/entries", json=_VALID_PAYLOAD)
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Test word"
    assert "id" in body
    # Confirm it was written to disk
    stored = json.loads(f.read_text(encoding="utf-8"))
    assert len(stored) == 1
    assert stored[0]["id"] == body["id"]


# ---------------------------------------------------------------------------
# Governance hardening (Step 1) — explicit forbid on unknown fields
# ---------------------------------------------------------------------------


def test_post_entries_rejects_unknown_field(tmp_path, monkeypatch):
    """POST with a field not in the schema must return 422, not silently drop it.

    Without `extra='forbid'`, Pydantic v2 would drop unknown fields and persist
    only the known ones — a silent governance bypass for any caller passing
    misnamed or future fields.
    """
    f = tmp_path / "entries.json"
    monkeypatch.setattr("app.main._ENTRIES_FILE", f)
    monkeypatch.setattr("app.main._DATA_DIR", tmp_path)

    payload = {**_VALID_PAYLOAD, "ai_usage_permission": "review_required"}

    client = TestClient(app)
    response = client.post("/entries", json=payload)

    assert response.status_code == 422
    # Nothing should have been written when validation rejects the payload.
    assert not f.exists() or json.loads(f.read_text(encoding="utf-8")) == []


def test_get_entries_against_legacy_on_disk_record(tmp_path, monkeypatch):
    """Document current behaviour when on-disk data contains a legacy field
    (`ai_usage_permission`) that is no longer in the model.

    This test exists to surface — not paper over — the schema drift in the
    real data/entries.json. After Step 1 (extra='forbid' on LinguisticEntry
    via inheritance), response_model validation should reject the record.
    The expected outcome is a 500: the API refuses to serve data it cannot
    validate, rather than silently dropping the unknown field.

    If this test fails (e.g. returns 200 with the field stripped), Step 1 is
    incomplete and the drift is still silent. Step 2 (migration) is what
    actually resolves the drift; this test only ensures we cannot ignore it.
    """
    f = tmp_path / "entries.json"
    legacy_record = {
        "id": "6d20a4c2-961a-4554-b2a1-c4d9ae901902",
        "title": "at",
        "content_type": "word",
        "language": "qashqai",
        "dialect": "dareshuri",
        # Canonical speaker_id (Step 4) — keeps this test focused on the
        # legacy `ai_usage_permission` field surfacing as 500. Without this
        # normalisation, the test would also be exercising the speaker_id
        # format validator, conflating two failure modes.
        "speaker_id": "SPK-001",
        "speaker_display_name": None,
        "recording_date": None,
        "collector_name": None,
        "consent_status": "pending",
        "ai_usage_permission": "review_required",  # legacy field, not in current model
        "visibility_status": "internal",
        "notes": None,
    }
    f.write_text(json.dumps([legacy_record]), encoding="utf-8")
    monkeypatch.setattr("app.main._ENTRIES_FILE", f)

    client = TestClient(app, raise_server_exceptions=False)
    response = client.get("/entries")

    # We assert the failure-mode contract: response_model validation must
    # refuse to serve unknown-field records, not silently strip them.
    assert response.status_code == 500, (
        f"Expected 500 (response_model validation refuses legacy record), "
        f"got {response.status_code} with body {response.text[:200]!r}. "
        f"If this is a 200, extra='forbid' is not propagating to LinguisticEntry."
    )


# ---------------------------------------------------------------------------
# Governance hardening (Step 3) — consent enum unification
# ---------------------------------------------------------------------------


def _payload(**overrides):
    """Helper: valid payload with optional field overrides."""
    return {**_VALID_PAYLOAD, **overrides}


def test_post_rejects_old_enum_value_public(tmp_path, monkeypatch):
    """Old enum value `public` is no longer in ConsentStatus → 422.

    Belt-and-braces check that the enum change is enforced at the request
    boundary (callers using the old vocabulary fail loud, not silently).
    """
    monkeypatch.setattr("app.main._ENTRIES_FILE", tmp_path / "entries.json")
    monkeypatch.setattr("app.main._DATA_DIR", tmp_path)
    client = TestClient(app)
    response = client.post("/entries", json=_payload(consent_status="public"))
    assert response.status_code == 422


def test_post_rejects_old_enum_value_archive_only(tmp_path, monkeypatch):
    """Old enum value `archive_only` is no longer in ConsentStatus → 422."""
    monkeypatch.setattr("app.main._ENTRIES_FILE", tmp_path / "entries.json")
    monkeypatch.setattr("app.main._DATA_DIR", tmp_path)
    client = TestClient(app)
    response = client.post("/entries", json=_payload(consent_status="archive_only"))
    assert response.status_code == 422


def test_post_accepts_new_enum_value_confirmed(tmp_path, monkeypatch):
    """New value `confirmed` is accepted."""
    monkeypatch.setattr("app.main._ENTRIES_FILE", tmp_path / "entries.json")
    monkeypatch.setattr("app.main._DATA_DIR", tmp_path)
    client = TestClient(app)
    response = client.post(
        "/entries",
        json=_payload(consent_status="confirmed", visibility_status="public"),
    )
    assert response.status_code == 201


def test_post_accepts_new_enum_value_withdrawn(tmp_path, monkeypatch):
    """New value `withdrawn` is accepted at create time (visibility must be non-public)."""
    monkeypatch.setattr("app.main._ENTRIES_FILE", tmp_path / "entries.json")
    monkeypatch.setattr("app.main._DATA_DIR", tmp_path)
    client = TestClient(app)
    response = client.post(
        "/entries",
        json=_payload(consent_status="withdrawn", visibility_status="blocked"),
    )
    assert response.status_code == 201


def test_visibility_public_requires_confirmed_consent(tmp_path, monkeypatch):
    """The unified rule: public visibility requires confirmed consent.

    Covers all four new consent states. Encodes the Step 3 tightening
    explicitly so any future relaxation has to delete a test, not slip
    through unnoticed.
    """
    monkeypatch.setattr("app.main._ENTRIES_FILE", tmp_path / "entries.json")
    monkeypatch.setattr("app.main._DATA_DIR", tmp_path)
    client = TestClient(app)

    # confirmed + public  -> allowed
    r = client.post(
        "/entries",
        json=_payload(consent_status="confirmed", visibility_status="public"),
    )
    assert r.status_code == 201, r.text

    # pending + public    -> rejected
    r = client.post(
        "/entries",
        json=_payload(consent_status="pending", visibility_status="public"),
    )
    assert r.status_code == 422

    # restricted + public -> rejected  (this is the Step 3 tightening)
    r = client.post(
        "/entries",
        json=_payload(consent_status="restricted", visibility_status="public"),
    )
    assert r.status_code == 422

    # withdrawn + public  -> rejected
    r = client.post(
        "/entries",
        json=_payload(consent_status="withdrawn", visibility_status="public"),
    )
    assert r.status_code == 422


def test_non_public_visibility_allowed_for_all_consent_states(tmp_path, monkeypatch):
    """Internal/blocked visibility is allowed regardless of consent state.

    Sanity check that the validator is scoped to public visibility only — we
    are not accidentally blocking internal/blocked storage of pending or
    withdrawn records.
    """
    monkeypatch.setattr("app.main._ENTRIES_FILE", tmp_path / "entries.json")
    monkeypatch.setattr("app.main._DATA_DIR", tmp_path)
    client = TestClient(app)

    for consent in ("confirmed", "pending", "restricted", "withdrawn"):
        for visibility in ("internal", "blocked"):
            r = client.post(
                "/entries",
                json=_payload(
                    consent_status=consent,
                    community_consent_status=consent,
                    visibility_status=visibility,
                ),
            )
            assert r.status_code == 201, (
                f"{consent=} + {visibility=} should be allowed; "
                f"got {r.status_code}: {r.text[:200]}"
            )


# ---------------------------------------------------------------------------
# Governance hardening (Step 5) — audit metadata + atomic write
# ---------------------------------------------------------------------------

import re as _re
from unittest.mock import patch as _patch


def test_post_sets_created_at_automatically(tmp_path, monkeypatch):
    """POST without created_at must auto-populate it with an ISO UTC timestamp."""
    monkeypatch.setattr("app.main._ENTRIES_FILE", tmp_path / "entries.json")
    monkeypatch.setattr("app.main._DATA_DIR", tmp_path)
    client = TestClient(app)

    response = client.post("/entries", json=_payload())  # no created_at
    assert response.status_code == 201
    body = response.json()
    assert body.get("created_at") is not None
    # RFC 3339 / ISO 8601 UTC with Z suffix; permissive on fractional digits.
    assert _re.match(
        r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$",
        body["created_at"],
    ), f"created_at not ISO-UTC: {body['created_at']!r}"


def test_post_accepts_explicit_created_at(tmp_path, monkeypatch):
    """Callers can override created_at (e.g. backfills) — auto-set only fires
    when the field is None."""
    monkeypatch.setattr("app.main._ENTRIES_FILE", tmp_path / "entries.json")
    monkeypatch.setattr("app.main._DATA_DIR", tmp_path)
    client = TestClient(app)

    fixed = "2020-01-01T00:00:00.000000Z"
    response = client.post("/entries", json=_payload(created_at=fixed))
    assert response.status_code == 201
    assert response.json()["created_at"] == fixed


def test_post_defaults_entry_schema_version(tmp_path, monkeypatch):
    """entry_schema_version defaults to the current schema version."""
    from app.main import CURRENT_ENTRY_SCHEMA_VERSION

    monkeypatch.setattr("app.main._ENTRIES_FILE", tmp_path / "entries.json")
    monkeypatch.setattr("app.main._DATA_DIR", tmp_path)
    client = TestClient(app)

    response = client.post("/entries", json=_payload())
    assert response.status_code == 201
    assert response.json()["entry_schema_version"] == CURRENT_ENTRY_SCHEMA_VERSION


def test_atomic_write_preserves_original_on_replace_failure(tmp_path, monkeypatch):
    """If os.replace fails (simulating crash between fsync and rename),
    the original entries.json is untouched. A stale .tmp may remain.

    This is the core crash-safety contract of _write_entries: there is no
    window in which the live file is half-written.
    """
    from app.main import _write_entries

    f = tmp_path / "entries.json"
    original_payload = [{"id": "original", "marker": "do-not-touch"}]
    f.write_text(json.dumps(original_payload), encoding="utf-8")
    monkeypatch.setattr("app.main._ENTRIES_FILE", f)
    monkeypatch.setattr("app.main._DATA_DIR", tmp_path)

    new_payload = [{"id": "new", "marker": "should-not-land"}]

    with _patch("app.main.os.replace", side_effect=OSError("simulated crash")):
        with pytest.raises(OSError):
            _write_entries(new_payload)

    # Original file content must be byte-identical to what we wrote first.
    assert json.loads(f.read_text(encoding="utf-8")) == original_payload, (
        "Original file was modified during failed write — atomic-write contract broken."
    )

    # A stale temp may remain (acceptable; next successful write overwrites).
    tmp = f.with_name(f.name + ".tmp")
    if tmp.exists():
        # It exists and contains the new payload that never landed — that's fine.
        assert json.loads(tmp.read_text(encoding="utf-8")) == new_payload


def test_atomic_write_succeeds_when_replace_works(tmp_path, monkeypatch):
    """Happy-path counterpart: when replace succeeds, the live file is
    updated and no .tmp is left behind."""
    from app.main import _write_entries

    f = tmp_path / "entries.json"
    f.write_text(json.dumps([{"id": "v0"}]), encoding="utf-8")
    monkeypatch.setattr("app.main._ENTRIES_FILE", f)
    monkeypatch.setattr("app.main._DATA_DIR", tmp_path)

    _write_entries([{"id": "v1"}])

    assert json.loads(f.read_text(encoding="utf-8")) == [{"id": "v1"}]
    tmp = f.with_name(f.name + ".tmp")
    assert not tmp.exists(), "stale .tmp should have been atomically renamed away"


def test_backup_recovery_restores_previous_state(tmp_path):
    """Demonstrates the rollback procedure at the file-system level:
    rename a `.bak` file back over `entries.json` and the previous state
    is restored. This is the recovery path used in production rollback.

    The test does not exercise _write_entries — it validates the operator
    contract that backups produced by the migration scripts (and that any
    future Step-6 audit-log step might rely on) can be restored with a
    single atomic rename.
    """
    live = tmp_path / "entries.json"
    bak = tmp_path / "entries.json.pre-v4.bak"

    pre_state = [{"id": "pre", "consent_status": "pending"}]
    post_state = [{"id": "post", "consent_status": "confirmed"}]

    bak.write_text(json.dumps(pre_state), encoding="utf-8")
    live.write_text(json.dumps(post_state), encoding="utf-8")

    # Rollback procedure: atomic rename of backup over live.
    os.replace(bak, live)

    assert json.loads(live.read_text(encoding="utf-8")) == pre_state
    assert not bak.exists()
