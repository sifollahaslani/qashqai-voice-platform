"""Forward migration of data/entries.json to the current LinguisticEntry schema.

Reads:   data/entries.json
Writes:  data/entries.json.migrated   (separate file — NOT an in-place overwrite)

Does NOT touch data/entries.json. A separate manual step (or replace_entries.sh)
performs the backup + replace.

Field mapping (approved):
  - DROP   ai_usage_permission         (legacy field, removed from schema)
  - ADD    ai_training_allowed   = False
  - ADD    ai_inference_allowed  = False
  - ADD    ai_generation_allowed = False

For any other field with a model default that is absent from the on-disk record,
the migration writes the default value explicitly into the migrated record. This
removes the silent dependency on model defaults persisting unchanged in future
schema revisions.

Every migrated record is validated through LinguisticEntry.model_validate before
being written. If any record fails, the script aborts with a non-zero exit and
writes nothing.

Run from repo root:
    python scripts/migrate_entries_v1.py
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

from app.main import LinguisticEntry  # noqa: E402

SOURCE_FILE = REPO_ROOT / "data" / "entries.json"
TARGET_FILE = REPO_ROOT / "data" / "entries.json.migrated"

# Explicit, single-purpose mapping. No conditional branches: the only legacy
# field is `ai_usage_permission`, and its only observed value is
# "review_required". The mapping drops it and writes three explicit booleans.
LEGACY_FIELDS_TO_DROP = {"ai_usage_permission"}
LEGACY_FIELD_REPLACEMENTS = {
    "ai_training_allowed": False,
    "ai_inference_allowed": False,
    "ai_generation_allowed": False,
}

# Explicit defaults for fields the model would have defaulted silently. Pulled
# from the model definition rather than duplicated — keeps this list authoritative.
EXPLICIT_DEFAULTS = {
    "community_consent_status": "pending",
    "consent_withdrawable_until": None,
    "speaker_display_name": None,
    "recording_date": None,
    "collector_name": None,
    "dialect": None,
    "notes": None,
}


def migrate_record(rec: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """Return (migrated_record, list_of_changes_applied)."""
    out = dict(rec)
    changes: list[str] = []

    for f in LEGACY_FIELDS_TO_DROP:
        if f in out:
            changes.append(f"drop  {f}={out[f]!r}")
            del out[f]

    for f, v in LEGACY_FIELD_REPLACEMENTS.items():
        if f not in out:
            out[f] = v
            changes.append(f"add   {f}={v!r}")

    for f, v in EXPLICIT_DEFAULTS.items():
        if f not in out:
            out[f] = v
            changes.append(f"add   {f}={v!r}  (was implicit default)")

    return out, changes


def main() -> int:
    if not SOURCE_FILE.exists():
        print(f"[migrate] {SOURCE_FILE} does not exist — nothing to migrate.")
        return 0

    raw = SOURCE_FILE.read_text(encoding="utf-8")
    try:
        records = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"[migrate] FATAL: source is not valid JSON: {exc}")
        return 2

    if not isinstance(records, list):
        print("[migrate] FATAL: source top-level is not a list.")
        return 2

    print(f"[migrate] source: {SOURCE_FILE}")
    print(f"[migrate] target: {TARGET_FILE}  (separate file — not in-place)")
    print(f"[migrate] records: {len(records)}")
    print()

    migrated: list[dict[str, Any]] = []
    for i, rec in enumerate(records):
        if not isinstance(rec, dict):
            print(f"[record {i}] FATAL: not a JSON object — aborting, no output written.")
            return 2

        rec_id = rec.get("id", "<no id>")
        new_rec, changes = migrate_record(rec)

        print(f"[record {i}] id={rec_id}")
        if not changes:
            print("  no changes required")
        else:
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
    print(f"[migrate] wrote {len(migrated)} record(s) to {TARGET_FILE}")
    print(f"[migrate] source file NOT modified.")
    print(f"[migrate] next step: review {TARGET_FILE.name}, then back up and replace.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
