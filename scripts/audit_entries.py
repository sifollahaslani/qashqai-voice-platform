"""Read-only audit of data/entries.json against the current LinguisticEntry model.

Reports, per record:
  - unknown fields (present on disk, absent in model)
  - missing required fields (in model without default, absent on disk)
  - missing defaulted fields (in model with default, absent on disk)
  - whether the record would currently validate via LinguisticEntry.model_validate

Does not modify any file. Intended to be run before migrate_entries_v1.py.

Run from repo root:
    python -m scripts.audit_entries
or:
    python scripts/audit_entries.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

# Make `app` importable when run as a script from the repo root.
REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from pydantic import ValidationError

from app.main import LinguisticEntry  # noqa: E402

ENTRIES_FILE = REPO_ROOT / "data" / "entries.json"


def model_field_partition() -> tuple[set[str], set[str]]:
    """Split LinguisticEntry fields into (required, defaulted)."""
    required: set[str] = set()
    defaulted: set[str] = set()
    for name, info in LinguisticEntry.model_fields.items():
        if info.is_required():
            required.add(name)
        else:
            defaulted.add(name)
    return required, defaulted


def audit() -> int:
    if not ENTRIES_FILE.exists():
        print(f"[audit] {ENTRIES_FILE} does not exist — nothing to audit.")
        return 0

    raw = ENTRIES_FILE.read_text(encoding="utf-8")
    try:
        records = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"[audit] FATAL: entries.json is not valid JSON: {exc}")
        return 2

    if not isinstance(records, list):
        print("[audit] FATAL: entries.json top-level is not a list.")
        return 2

    required, defaulted = model_field_partition()
    model_fields = required | defaulted

    print(f"[audit] file:    {ENTRIES_FILE}")
    print(f"[audit] records: {len(records)}")
    print(f"[audit] model:   LinguisticEntry")
    print(f"[audit]   required fields:  {sorted(required)}")
    print(f"[audit]   defaulted fields: {sorted(defaulted)}")
    print()

    fail_count = 0
    for i, rec in enumerate(records):
        if not isinstance(rec, dict):
            print(f"[record {i}] FATAL: not a JSON object.")
            fail_count += 1
            continue

        rec_id = rec.get("id", "<no id>")
        on_disk = set(rec.keys())
        unknown = on_disk - model_fields
        missing_required = required - on_disk
        missing_defaulted = defaulted - on_disk

        print(f"[record {i}] id={rec_id}")
        print(f"  unknown fields (would be dropped/rejected): {sorted(unknown) or 'none'}")
        for f in sorted(unknown):
            print(f"    {f} = {rec[f]!r}")
        print(f"  missing required fields:                    {sorted(missing_required) or 'none'}")
        print(f"  missing defaulted fields (defaults used):   {sorted(missing_defaulted) or 'none'}")

        try:
            LinguisticEntry.model_validate(rec)
            print("  current validation: PASS")
        except ValidationError as exc:
            fail_count += 1
            print("  current validation: FAIL")
            for err in exc.errors():
                loc = ".".join(str(p) for p in err["loc"])
                print(f"    - {loc}: {err['msg']} (type={err['type']})")
        print()

    print(f"[audit] summary: {len(records)} records, {fail_count} failing validation.")
    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    sys.exit(audit())
