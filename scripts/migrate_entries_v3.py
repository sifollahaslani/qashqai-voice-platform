"""Forward migration of data/entries.json speaker_id values to the canonical
format ^SPK-\\d{3,}$ (uppercase, hyphen, 3+ digits).

Reads:   data/entries.json
Writes:  data/entries.json.migrated   (separate file — NOT an in-place overwrite)

SPEAKER-ID FORMAT (v3):
  canonical:  SPK-001, SPK-007, SPK-12345
  accepted legacy variants for normalization: (any case)-(any case)-digits
    e.g. spk-001 -> SPK-001
         Spk-007 -> SPK-007

Any speaker_id that does not match `^[Ss][Pp][Kk]-\\d{3,}$` is considered an
unknown format and the migration ABORTS with no output written. No silent
coercion (e.g. zero-padding, prefix injection, character substitution) is
performed.

Every migrated record is validated through LinguisticEntry.model_validate
before being written.

Run from repo root:
    python scripts/migrate_entries_v3.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from pydantic import ValidationError

# Stage A — see migrate_entries_v1.py for the rationale.
from app.main import (  # noqa: E402
    AUDIT_SCHEMA_VERSION,
    LinguisticEntry,
    SPEAKER_ID_PATTERN,
    _SPEAKER_ID_RE,
    _append_audit,
    _utc_now_iso,
)

_MIGRATION_VERSION = 3

SOURCE_FILE = REPO_ROOT / "data" / "entries.json"
TARGET_FILE = REPO_ROOT / "data" / "entries.json.migrated"

# Match any case-variation of SPK-NNN. Anything else is rejected as
# "unknown format" and the script aborts.
_CASE_INSENSITIVE_RE = re.compile(r"^[Ss][Pp][Kk]-\d{3,}$")


def migrate_record(rec: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """Return (migrated_record, list_of_changes_applied)."""
    out = dict(rec)
    changes: list[str] = []

    sid = out.get("speaker_id")
    if sid is None:
        return out, changes
    if not isinstance(sid, str):
        raise ValueError(f"speaker_id must be a string; got {type(sid).__name__}")

    if _SPEAKER_ID_RE.match(sid):
        changes.append(f"keep  speaker_id={sid!r}  (already canonical)")
    elif _CASE_INSENSITIVE_RE.match(sid):
        new = sid.upper()
        out["speaker_id"] = new
        changes.append(f"map   speaker_id: {sid!r} -> {new!r}  (case normalization)")
    else:
        raise ValueError(
            f"speaker_id {sid!r} does not match canonical {SPEAKER_ID_PATTERN!r} "
            f"or any accepted legacy case variant. Cannot auto-migrate."
        )

    return out, changes


def main() -> int:
    if not SOURCE_FILE.exists():
        print(f"[migrate-v3] {SOURCE_FILE} does not exist — nothing to migrate.")
        return 0

    raw = SOURCE_FILE.read_text(encoding="utf-8")
    try:
        records = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"[migrate-v3] FATAL: source is not valid JSON: {exc}")
        return 2

    if not isinstance(records, list):
        print("[migrate-v3] FATAL: source top-level is not a list.")
        return 2

    print(f"[migrate-v3] source: {SOURCE_FILE}")
    print(f"[migrate-v3] target: {TARGET_FILE}  (separate file — not in-place)")
    print(f"[migrate-v3] canonical speaker_id pattern: {SPEAKER_ID_PATTERN}")
    print(f"[migrate-v3] records: {len(records)}")
    print()

    migrated: list[dict[str, Any]] = []
    for i, rec in enumerate(records):
        if not isinstance(rec, dict):
            print(f"[record {i}] FATAL: not a JSON object — aborting, no output written.")
            return 2

        rec_id = rec.get("id", "<no id>")
        print(f"[record {i}] id={rec_id}")

        try:
            new_rec, changes = migrate_record(rec)
        except ValueError as exc:
            print(f"  FATAL: {exc}")
            print("  aborting, no output written.")
            return 1

        for c in changes:
            print(f"  {c}")

        try:
            LinguisticEntry.model_validate(new_rec)
            print("  validation: PASS")
        except ValidationError as exc:
            print("  validation: FAIL — aborting, no output written.")
            for err in exc.errors():
                loc = ".".join(str(p) for p in err["loc"])
                print(f"    - {loc}: {err['msg']} (type={err['type']})")
            return 1

        migrated.append(new_rec)
        print()

    TARGET_FILE.write_text(
        json.dumps(migrated, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"[migrate-v3] wrote {len(migrated)} record(s) to {TARGET_FILE}")
    print(f"[migrate-v3] source file NOT modified.")

    # Stage A — record migration preparation in the canonical audit log.
    try:
        _append_audit({
            "audit_schema_version": AUDIT_SCHEMA_VERSION,
            "ts": _utc_now_iso(),
            "op": "migration_prepared",
            "migration_version": _MIGRATION_VERSION,
            "source_path": str(SOURCE_FILE),
            "target_path": str(TARGET_FILE),
            "record_count": len(migrated),
            "request_origin": "local-cli",
        })
    except OSError as exc:
        print(
            f"[migrate-v3] WARNING: migrated file written but audit append failed: {exc}",
            file=sys.stderr,
        )
        print(
            "[migrate-v3] Resolve the audit issue BEFORE running the operator "
            "replacement so the migration is not applied without a trace.",
            file=sys.stderr,
        )
        return 1

    print(f"[migrate-v3] next step: review {TARGET_FILE.name}, then back up and replace.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
