"""Forward migration of data/entries.json to the v2 (consent-centric) enum.

Reads:   data/entries.json
Writes:  data/entries.json.migrated   (separate file — NOT an in-place overwrite)

Maps the old ConsentStatus enum (publication-conflated) to the new one
(consent-centric, aligned with 06_Data_Governance/Withdrawal_Protocol_v1.md).

Applies the mapping to BOTH consent fields:
  - consent_status
  - community_consent_status

ENUM MAPPING (explicit):
  old "pending"       -> new "pending"      (same)
  old "public"        -> new "confirmed"    (public publication implies confirmed consent)
  old "archive_only"  -> new "restricted"   (use-limited consent)
  old "restricted"    -> new "restricted"   (same name — visibility rule tightens, see below)

Records with an already-new value (confirmed/pending/withdrawn/restricted) are
left unchanged on the consent fields.

VISIBILITY×CONSENT RULE CHANGE (surfaced, not hidden):
The new validator blocks `visibility_status == "public"` unless
`consent_status == "confirmed"`. Under the old code, `restricted` permitted
public visibility — this is now blocked. Any existing record that combined
old `restricted` + `public` would fail post-migration validation and would
need a separate human decision before being re-saved. This migration aborts
with no output written in that case rather than silently downgrading
visibility.

Every migrated record is validated through LinguisticEntry.model_validate
before being written. If any record fails, the script aborts; no output file
is produced.

Run from repo root:
    python scripts/migrate_entries_v2.py
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

# Explicit enum mapping. Old enum values not in this map are an error.
# Already-new values pass through (idempotency).
CONSENT_ENUM_MAP = {
    # old -> new
    "pending": "pending",
    "public": "confirmed",
    "archive_only": "restricted",
    "restricted": "restricted",
    # new values (idempotent)
    "confirmed": "confirmed",
    "withdrawn": "withdrawn",
}

CONSENT_FIELDS = ("consent_status", "community_consent_status")


def migrate_record(rec: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """Return (migrated_record, list_of_changes_applied)."""
    out = dict(rec)
    changes: list[str] = []

    for field in CONSENT_FIELDS:
        old = out.get(field)
        if old is None:
            continue
        if old not in CONSENT_ENUM_MAP:
            raise ValueError(
                f"unknown legacy value for {field}: {old!r}. "
                f"Expected one of {sorted(CONSENT_ENUM_MAP)}."
            )
        new = CONSENT_ENUM_MAP[old]
        if new != old:
            out[field] = new
            changes.append(f"map   {field}: {old!r} -> {new!r}")
        else:
            changes.append(f"keep  {field}={old!r}  (already canonical)")

    return out, changes


def main() -> int:
    if not SOURCE_FILE.exists():
        print(f"[migrate-v2] {SOURCE_FILE} does not exist — nothing to migrate.")
        return 0

    raw = SOURCE_FILE.read_text(encoding="utf-8")
    try:
        records = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"[migrate-v2] FATAL: source is not valid JSON: {exc}")
        return 2

    if not isinstance(records, list):
        print("[migrate-v2] FATAL: source top-level is not a list.")
        return 2

    print(f"[migrate-v2] source: {SOURCE_FILE}")
    print(f"[migrate-v2] target: {TARGET_FILE}  (separate file — not in-place)")
    print(f"[migrate-v2] records: {len(records)}")
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
            print()
            print("  HINT: a record that combined old `restricted` + `public` visibility")
            print("  will fail here. The new rule requires `confirmed` consent for public.")
            print("  Resolve by hand (lower the visibility or upgrade the consent), then re-run.")
            return 1

        migrated.append(new_rec)
        print()

    TARGET_FILE.write_text(
        json.dumps(migrated, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"[migrate-v2] wrote {len(migrated)} record(s) to {TARGET_FILE}")
    print(f"[migrate-v2] source file NOT modified.")
    print(f"[migrate-v2] next step: review {TARGET_FILE.name}, then back up and replace.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
