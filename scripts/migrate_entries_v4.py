"""Forward migration of data/entries.json: stamp audit metadata fields
(`created_at`, `entry_schema_version`) explicitly on every record.

Reads:   data/entries.json
Writes:  data/entries.json.migrated   (separate file — NOT an in-place overwrite)

Policy:
  - `created_at` absent on disk -> written as JSON null (explicit "unknown /
    legacy"). The migration does NOT fabricate a timestamp; the file mtime
    is not the record's creation time and using it would invent audit data.
  - `entry_schema_version` absent on disk -> written as
    CURRENT_ENTRY_SCHEMA_VERSION (the version at the time Step 5 landed).

Already-stamped records pass through unchanged. The script is idempotent.

Every migrated record is validated through LinguisticEntry.model_validate
before being written. Aborts on any failure; no output produced.

Run from repo root:
    python scripts/migrate_entries_v4.py
"""
from __future__ import annotations

import json
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
    CURRENT_ENTRY_SCHEMA_VERSION,
    LinguisticEntry,
    _append_audit,
    _utc_now_iso,
)

_MIGRATION_VERSION = 4

SOURCE_FILE = REPO_ROOT / "data" / "entries.json"
TARGET_FILE = REPO_ROOT / "data" / "entries.json.migrated"


def migrate_record(rec: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """Return (migrated_record, list_of_changes_applied)."""
    out = dict(rec)
    changes: list[str] = []

    if "created_at" not in out:
        out["created_at"] = None
        changes.append("add   created_at=None  (explicit 'legacy / unknown')")
    else:
        changes.append(f"keep  created_at={out['created_at']!r}")

    if "entry_schema_version" not in out:
        out["entry_schema_version"] = CURRENT_ENTRY_SCHEMA_VERSION
        changes.append(
            f"add   entry_schema_version={CURRENT_ENTRY_SCHEMA_VERSION}  "
            f"(was implicit default)"
        )
    else:
        changes.append(f"keep  entry_schema_version={out['entry_schema_version']!r}")

    return out, changes


def main() -> int:
    if not SOURCE_FILE.exists():
        print(f"[migrate-v4] {SOURCE_FILE} does not exist — nothing to migrate.")
        return 0

    raw = SOURCE_FILE.read_text(encoding="utf-8")
    try:
        records = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"[migrate-v4] FATAL: source is not valid JSON: {exc}")
        return 2

    if not isinstance(records, list):
        print("[migrate-v4] FATAL: source top-level is not a list.")
        return 2

    print(f"[migrate-v4] source: {SOURCE_FILE}")
    print(f"[migrate-v4] target: {TARGET_FILE}  (separate file — not in-place)")
    print(f"[migrate-v4] records: {len(records)}")
    print()

    migrated: list[dict[str, Any]] = []
    for i, rec in enumerate(records):
        if not isinstance(rec, dict):
            print(f"[record {i}] FATAL: not a JSON object — aborting, no output written.")
            return 2

        rec_id = rec.get("id", "<no id>")
        print(f"[record {i}] id={rec_id}")

        new_rec, changes = migrate_record(rec)
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
    print(f"[migrate-v4] wrote {len(migrated)} record(s) to {TARGET_FILE}")
    print(f"[migrate-v4] source file NOT modified.")

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
            f"[migrate-v4] WARNING: migrated file written but audit append failed: {exc}",
            file=sys.stderr,
        )
        print(
            "[migrate-v4] Resolve the audit issue BEFORE running the operator "
            "replacement so the migration is not applied without a trace.",
            file=sys.stderr,
        )
        return 1

    print(f"[migrate-v4] next step: review {TARGET_FILE.name}, then back up and replace.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
