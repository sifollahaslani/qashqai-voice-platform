# QashqAI Voice — Operations Playbook

This playbook collects operational runbooks for the QashqAI Voice platform.
On-call responder: Director (Siefollah Aslani, solo).

---

## AI Provider Incident Response Protocol

**Type:** Internal operational document
**Audience:** On-call responder (currently: Director, solo)
**Read time:** <2 minutes during incident

### When to use this runbook

You are seeing one or more of:

- Anthropic status page reports an incident affecting Claude models
- Backend logs show elevated 5xx from `api.anthropic.com`
- Speakers report submission failures
- Frontend health check shows AI Pipeline = Degraded

---

### Step 0 — Confirm (60 seconds)

```bash
# Check Anthropic status
curl -s https://status.claude.com/api/v2/status.json | jq '.status.indicator'

# Check our backend health
curl -s https://qashqai-voice-platform.onrender.com/health | jq

# Check our public status
curl -s https://qashqaivoice.com/api/status | jq
```

If all three are green and a speaker reports a problem → it is **not** an API incident, escalate to user-specific debugging.

If Anthropic is red/yellow → continue to Step 1.

---

### Step 1 — Classify severity (30 seconds)

| What you see | Severity |
|---|---|
| Submissions failing entirely, data at risk | **SEV-1** |
| Submissions accepted but AI processing fails | **SEV-3** (queue + fallback active) |
| Cultural Guardian failing, Reasoning OK | **SEV-3** (fallback to Sonnet 4.6) |
| Reasoning Agent failing | **SEV-2** (queue submissions, do NOT downgrade quality) |
| Both agents failing, queue growing fast | **SEV-2** |
| Frontend or backend completely down | **SEV-1** |

---

### Step 2 — Activate safety mode (2 minutes)

**If SEV-1:**

```bash
# Set platform to read-only
curl -X POST https://qashqai-voice-platform.onrender.com/admin/safety-mode \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"mode": "read_only", "reason": "incident_<YYYY-MM-DD>"}'
```

**If SEV-2 or SEV-3:**

```bash
# Activate AI fallback for Cultural Guardian
curl -X POST https://qashqai-voice-platform.onrender.com/admin/ai-fallback \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"agent": "cultural_guardian", "model": "claude-sonnet-4-6"}'

# Pause Reasoning Agent submissions (queue them)
curl -X POST https://qashqai-voice-platform.onrender.com/admin/queue-mode \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"agent": "reasoning", "mode": "queue"}'
```

---

### Step 3 — Update public status (1 minute)

The status component reads from `backend/app/status.py`. Update component states:

```bash
# Set AI Pipeline to Degraded
curl -X PATCH https://qashqai-voice-platform.onrender.com/admin/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"component": "ai_pipeline", "state": "degraded"}'
```

States: `operational` | `degraded` | `unavailable`

---

### Step 4 — Open incident log (3 minutes)

Create `docs/incidents/YYYY-MM-DD-<short-slug>.md`:

```markdown
# Incident YYYY-MM-DD — <short title>

**Severity:** SEV-X
**Detected:** YYYY-MM-DD HH:MM UTC
**Resolved:** (pending)
**Responder:** <name>

## Timeline
- HH:MM — Detection: <how detected>
- HH:MM — Confirmed via <source>
- HH:MM — Safety mode activated: <which mode>
- HH:MM — Public status updated

## Impact
- Affected component(s):
- Affected entries: (none / count / IDs if known)
- Speakers affected: (estimate)

## Actions taken
-

## Pending
-
```

---

### Step 5 — Notify (only if required)

| Condition | Action |
|---|---|
| SEV-1 with cultural data risk | Contact father (Layer 4) within 1 hour |
| SEV-1 affecting submitted entries | Email partner list within 48h with post-mortem |
| SEV-2 or SEV-3 | No proactive notification — public status is sufficient |

**Do not** post on social media during an incident. The status component is the only public channel.

---

### Step 6 — Monitor and resolve

```bash
# Watch Anthropic status
watch -n 60 'curl -s https://status.claude.com/api/v2/incidents/unresolved.json | jq ".incidents"'

# Watch our queue depth
watch -n 30 'curl -s https://qashqai-voice-platform.onrender.com/admin/queue-stats \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq'
```

When upstream incident resolves:

1. Run smoke test: submit a test entry through the full pipeline.
2. If smoke test passes: deactivate fallbacks, return components to `operational`.
3. Process queued submissions (FIFO).
4. Update incident log with resolution timestamp and outcome.

---

### Step 7 — Post-mortem (within 5 working days for SEV-1/SEV-2)

Reopen the incident log and add:

- **Root cause:** technical and (if applicable) governance.
- **Why our safeguards worked / did not work.**
- **Structural changes:** PRs, runbook updates, architecture changes.
- **Lessons for the CARE adaptation paper:** does this incident illustrate something about resilience-by-design that should be cited?

---

### Anti-patterns (do not do)

- Do not silently downgrade quality. Queue or fail visibly.
- Do not delete failed submissions. Preserve for manual review.
- Do not auto-promote `consent_status` from `pending` under any circumstances.
- Do not name the upstream vendor in public communications without the Director's explicit decision.
- Do not skip the incident log "because it was short". Short incidents accumulate into patterns.

---

## Governance & Storage Operations

**Scope:** behavior of the `data/entries.json` store, the `data/audit_log.jsonl` audit log, the migration scripts in `scripts/`, the consent-gate Bash hook, the shared-secret auth on `/entries`, and the override-accountability + strict-audit-schema gates added by Slice C. Reflects the state of `governance-hardening` at commit `50c109f` (Slice 1 + Slice C landed; Slice 2 — Stage B operator helper, Stage C Write/Edit hard-gate, Stage D hook-denial audit — remain deferred).

This section documents what the system **guarantees**, what the operator is **expected to ensure**, and what is **unsupported today**. It is descriptive, not aspirational — every claim corresponds to behavior in committed code.

### Architectural ceilings

The following bypasses cannot be closed within current v0 constraints (no DB, no OS-level process isolation, no audit signing). They are documented, not enforced:

| Ceiling | Why it exists |
|---|---|
| **In-process Python imports** — `from app.main import _write_entries; _write_entries([...])` writes the entries file without going through validation, auth, or audit. | Python has no enforced module privacy. Underscore-prefixed names are convention only. |
| **Filesystem-level edits** — `vim data/entries.json`, `cat > data/entries.json`, any process with disk write access bypasses all in-process governance. | The store is a flat JSON file on a normal filesystem; the OS does not distinguish governance writes from any other writes. |
| **Audit log spoofing** — any code path with write access to `data/audit_log.jsonl` can fabricate arbitrary audit lines. | The append-only log is not signed. The chokepoint contract says "writers must audit"; it cannot enforce "no one writes audit without writing data." |
| **`live_listener/` parallel domain** — `live_listener/src/live_listener.py` writes transcripts to `transcripts/*.txt` with its own consent flow (`request_consent()`, `enforce_fieldwork_gate()`). Those events do NOT appear in `data/audit_log.jsonl`. | Live listener is a separate governance domain by design. Audit chain isolation is a known consequence. |

No caller in the repo today exercises the first three. The fourth is by design.

### Single-worker / single-process assumption

The store and audit log are designed for **one writer at a time**. Specifically:

- `uvicorn app.main:app` must run with a single worker (`--workers 1`, the default). Multiple workers writing concurrently will race in `_write_entries` and silently lose entries (the audit log will still show both `create_entry` events; the missing entry is detectable via post-hoc reconciliation but not recoverable).
- Migration scripts must not be run concurrently. Two simultaneous `python scripts/migrate_entries_vN.py` invocations race on the `.migrated` sibling file. Both `migration_prepared` audit lines will appear; the `.migrated` content is whichever writer finished last.
- The migration scripts should not be run while the API is serving requests. The migration reads `entries.json` then writes `.migrated`; a POST landing between the read and the operator's eventual `mv` will be missing from the applied result.

**Guaranteed:** single-process atomic crash-safety. A killed `_write_entries` mid-flow leaves the original file untouched.
**Operator-expected:** to keep concurrent writers off the store. Stop the API before running migrations.
**Unsupported today:** multi-worker uvicorn deployments, concurrent operator scripts, mixed API + migration traffic.

### Migration assumptions

- Migration scripts run from the **repo root**. Paths in the scripts are anchored at `Path(__file__).resolve().parent.parent`; running from elsewhere works for the scripts themselves but the consent-gate hook uses a CWD-relative `data/entries.json` and fails closed from non-root.
- The migration ritual is **two steps**: `python scripts/migrate_entries_vN.py` produces `data/entries.json.migrated` and a `migration_prepared` audit line; the operator then manually backs up and replaces (`cp data/entries.json data/entries.json.pre-vN.bak && mv data/entries.json.migrated data/entries.json`). Stage B (deferred) will collapse this into one audited helper.
- The `.migrated` write is **not atomic**. A killed migration script mid-write leaves a partial `.migrated`. The next run overwrites it. Operator must verify `.migrated` validates before applying.
- `migration_prepared` audit lines record **intent**, not completion. There is currently no `migration_applied` op. A reader of the audit log alone cannot determine whether a prepared migration was actually applied.

### Audit log limitations

The audit log (`data/audit_log.jsonl`) is the system's record of governance-affecting events. Its limitations:

- **Append-only, but operator-editable.** The code never rewrites earlier lines (verified by `test_audit_log_is_append_only`). The OS does not prevent an operator from editing the file directly. The append-only contract is a code invariant, not a filesystem one.
- **No in-system rollback.** Once a line lands, no code removes it. Reverting a code commit (`git revert`) does not remove the audit lines written under that commit's logic. A reader may encounter lines whose schema version doesn't match the running code's expectations.
- **No size cap, no rotation, no archival.** Today's record count is small. The file is expected to be readable as one whole text file. Future growth is an open operational concern (no current sharp edge at the scale we're at).
- **`request_origin` is the immediate TCP peer**, not the original caller. Behind a reverse proxy, audit records show the proxy's address. `X-Forwarded-For` is not honored — accepting it without explicit trust scope would be a spoofing vector.
- **`auth_mode` is informational**, not an identity claim. `"token"` means a valid token was presented; it does not say who presented it. `"localhost:127.0.0.1"` means the request came from a configured local origin. Neither field maps to a human actor.
- **`migration_prepared.request_origin` is a self-reported literal** (`"local-cli"`). Anyone running a migration script claims `local-cli` as origin.
- **(Slice C) Write-side schema integrity, not forgery resistance.** Every line appended by `_append_audit` is first validated against the `AuditEvent` Pydantic model (`extra='forbid'`). Unknown fields and unknown ops raise `ValidationError` BEFORE the filesystem touch — closing the silent-malformed-metadata surface. This does NOT prevent direct filesystem appends from spoofing well-formed lines (no log signing in v0); it only prevents the code from producing malformed lines.
- **(Slice C) `AuditEvent` is permissive across ops.** Per-op required-fields tightening lives in the call sites (in `create_entry`, `require_api_token`, the migration scripts), not in the model. A reviewer auditing whether a given op has the right fields populated must read the call site, not the model. Per-op discriminated-union tightening is a possible future Slice.
- **(Slice C) `revocation_actor` / `revocation_reason` on `consent_revoked` are unauthenticated assertions.** They prove the API received an accountability claim. They do NOT prove who made the claim — there is no cryptographic binding to `auth_mode`.

**Guaranteed:** every successful `POST /entries` produces at least one audit line (`create_entry`, plus a second `consent_revoked` line when the entry's `consent_status` is `"withdrawn"`); every auth denial produces an `auth_denied` line; every successful `python scripts/migrate_entries_vN.py` produces one `migration_prepared` line. Every line passes strict `AuditEvent` schema validation before write. Lines are fsync-durable before the caller sees success.
**Operator-expected:** treat the audit log as the system's record of *what the code did*, not as evidence of who initiated an action or whether downstream operator steps completed.
**Unsupported today:** rolling back audit history; rotating or archiving the file; reading without trusting line content; cryptographically verifying actor identity from `revocation_actor` / `consent_override_actor`.

### Backup locality

The four `data/entries.json.pre-v[1-4].bak` files are created by the migration ritual and are the canonical rollback artifacts. They are:

- **Local-only.** Each operator's machine has its own. Not in git (`.gitignore` line 28: `data/`).
- **Not synchronized across machines.** A fresh `git clone` has no backups for any prior migration.
- **Per-version, single-use.** `os.replace(pre-vN.bak, entries.json)` consumes the backup file. To preserve the rollback artifact, the operator must `cp` the backup elsewhere before the replace.

**Guaranteed:** backup files are byte-identical snapshots of the live store at the moment they were created (verified by `test_backup_recovery_restores_previous_state` at the filesystem layer).
**Operator-expected:** keep backups outside the repo if rollback past a fresh clone is required; understand that another developer's checkout has no rollback path for migrations applied only on your machine.
**Unsupported today:** distributed backup recovery; multi-operator rollback coordination.

### Emergency recovery expectations

Five common emergency scenarios and their procedures:

| Scenario | Procedure | Recoverable? |
|---|---|---|
| **Token lost or rotated badly** | On the host: `unset QV_API_TOKEN` then restart uvicorn. Localhost-mode access is restored; operator can administer locally. Set a new token, restart, redistribute. | Fully |
| **Bad migration applied to live store** | `os.replace("data/entries.json.pre-vN.bak", "data/entries.json")` (atomic). Audit log retains the `migration_prepared` line — there is no `migration_reverted` op today; operator should note the revert in an operator journal outside the audit log. | Fully (data); partially (audit forensics) |
| **Audit log partial trailing line from crash** | Open in a text editor, delete only the partial line, save. JSONL readers skip unparseable lines, so the file is usable as-is in the meantime. | Fully |
| **Disk full while POSTing** | API returns 500 with `entry_id` named; the entry IS persisted (atomic write happened first). Free disk space. Caller MUST check the entry_id is in the store before retrying (no idempotency key — retry can create a duplicate). | Recoverable with operator discipline |
| **Concurrent-write entry loss** | Compare `data/audit_log.jsonl` `create_entry` line count against `data/entries.json` length. Missing entries are detectable but their content is gone. Contact the original requester to re-submit. | Detectable but not recoverable in-system |

### Concurrency assumptions

Restating in one place:

- No file locking anywhere in the code (`flock`, `fcntl`, `msvcrt.locking`, `threading.Lock`, `asyncio.Lock` — none present).
- Safe with: single uvicorn worker, no concurrent migration scripts, no operator filesystem operations during API activity.
- Unsafe with: multiple workers, concurrent script runs, simultaneous operator + API writes.

Today's deployment satisfies the safe path. Scaling beyond single-worker requires either file locking (added to `_write_entries` and `_append_audit`) or migrating the store off the flat file. Both are out of v0 scope.

### Known sharp edges

Bugs and edge cases that are real but not blocking today:

- **`hooks/consent-gate.sh` only consent-checks the FIRST `SPK-NNN` match in a command** (`head -1` in regex pipeline). A command like `python tool.py SPK-001 SPK-002` only verifies SPK-001's consent. If SPK-002 is `pending`/`withdrawn`/`restricted`, the command proceeds. Single-speaker workflows are unaffected; multi-speaker batch operations are partially unchecked.
- **`_LOCAL_ORIGINS` is a fixed set** (`127.0.0.1`, `::1`, `localhost`, `testclient`). Forms like `::ffff:127.0.0.1` (IPv4-mapped IPv6, occasionally seen on dual-stack hosts) are denied as "remote" even though they originate locally. Fail-closed direction is correct; the breadth occasionally causes false-positive denials.
- **`hooks/consent-gate.sh` requires `python` (not `python3`) on PATH.** On stripped-down environments or strict Python-3-only systems, the hook fails closed and blocks every speaker-mentioning Bash command in Claude Code sessions.
- **Token rotation has no overlap window.** Changing `QV_API_TOKEN` requires server restart with a brief deny window for clients still on the old token. Coordinated downtime or out-of-band distribution is the only mitigation today.
- **No idempotency key on `POST /entries`.** A 500-with-named-entry-id response cannot be safely retried by a naive client without checking whether the entry landed. Operator-side reconciliation is the current mechanism.
- **No emergency override on `consent-gate.sh`** beyond editing `.claude/settings.json` (which itself is un-audited). Stage D (deferred) would close the audit half by recording hook denials in `data/audit_log.jsonl`.

### Governance guarantees vs operational expectations vs unsupported

| Category | What |
|---|---|
| **Guaranteed by code** | Atomic single-write crash safety. POST /entries either lands entirely or not at all. Unknown fields are rejected at 422 (inbound) / 500 (outbound). Canonical consent enum is enforced at the model boundary. Canonical speaker_id format is enforced. Auth fails closed in every misconfiguration mode. Every successful create_entry, auth_denied, and migration_prepared event produces one audit line. Audit append failure surfaces as 500 (create) or stderr warning (deny). **(Slice C)** `consent_status='withdrawn'` is rejected unless `irreversible_acknowledged=True`, `visibility_status='blocked'`, and all `ai_*_allowed=False`. Any consent override (mismatch or revocation) is rejected unless `consent_override_actor` and `consent_override_reason` are non-empty. Revocation is rejected unless `downstream_invalidation_refs` is explicitly present (empty list allowed as affirmative declaration). Every `data/audit_log.jsonl` line passes strict `AuditEvent` (`extra='forbid'`) schema validation before write; malformed metadata and unknown ops are rejected pre-write. Every withdrawal-creating POST emits an additional `consent_revoked` audit line tied to the same `entry_id` carrying `revocation_actor`, `revocation_reason`, `downstream_invalidation_refs`. |
| **Operationally expected of the operator** | Run uvicorn with a single worker. Run migration scripts from repo root, with the API stopped, one at a time. Keep `.pre-vN.bak` backups outside the repo if cross-machine rollback may be needed. Treat the audit log as a record of code actions, not of human actors. Rotate `QV_API_TOKEN` during coordinated downtime windows. Verify a prepared migration's `.migrated` file before applying. After a 500-with-entry-id, verify before retry. |
| **Not supported today** | Multi-worker uvicorn. Concurrent migration scripts. Concurrent operator + API writes. Rolling back audit log lines. Audit log rotation/archival. `X-Forwarded-For` honoring. Token overlap during rotation. Cross-machine backup recovery. Multi-speaker batch consent enforcement. IPv4-mapped IPv6 local-origin detection. Idempotent POST retry. |
| **Policy/process dependent** | Whether and how to record an operator's manual revert in the audit log (no code support). Whether a partial `.migrated` from a killed migration is safe to apply (operator judgment). Whether a token leak requires an incident log (use the AI Provider runbook above as a model). Cultural-validation decisions affecting `consent_status` (governed by `06_Data_Governance/Consent_Framework_v1.md` and `Withdrawal_Protocol_v1.md`). |

### Slice 2 decisions (recorded for later implementation)

The next slice (Stage B operator helper + Stage C Write/Edit hard-gate + Stage D hook-denial audit) is deferred but the following decisions have been recorded for when implementation resumes. Note: the originally-planned 3 → 4 schema bump was consumed by Slice C; Slice 2's bump is now renumbered to 4 → 5.

- **`AUDIT_SCHEMA_VERSION` bump 4 → 5** on the Stage B commit (renumbered from 3 → 4 — Slice C took 3 → 4 for the `consent_revoked` op + strict `AuditEvent` schema). New op `migration_applied` joins the schema on Stage B as a non-additive bump for discipline.
- **Stale `data/entries.json.tmp`**: Stage B's helper fails closed if a stale `.tmp` exists from a concurrent or interrupted write. Operator must investigate and clear it before retry.
- **Stage C's block message**: fixed text in `hooks/pre-data-operation.sh`. No env-var configurability. Single canonical phrasing pointing at the two legitimate write paths.
- **`sys.modules` cleanup in `test_migration_audit.py`**: lands as a separate precursor commit (Stage A.1) before Slice 2, not bundled into Stage B's tests.
- **Stage D (hook-denial audit)** — `consent-gate.sh` and `pre-data-operation.sh` denials produce stdout/stderr today and no audit line. Stage D wires them into `data/audit_log.jsonl` with new ops (`hook_denied_consent`, `hook_denied_restricted_write` — names provisional). Until Stage D lands, blocked operations leave no trace in the canonical audit log.

### Slice C summary (committed at `50c109f`)

Slice C narrowed three pre-existing gaps in the HTTP API chokepoint. It did NOT address architectural ceilings; those remain documented and unchanged. Slice C is fully reviewable as a single commit on the `governance-hardening` branch.

| Surface | Pre-Slice-C | Post-Slice-C |
|---|---|---|
| Withdrawal recording | Accepted with no acknowledgment, any visibility, any AI permissions | Requires `irreversible_acknowledged=True`, `visibility_status='blocked'`, all `ai_*_allowed=False` |
| Consent override | Could land silently when speaker and community consent diverged | Requires non-empty `consent_override_actor` + `consent_override_reason` |
| Downstream invalidation on revocation | No record of what artifacts the revocation should invalidate | Requires explicit `downstream_invalidation_refs` list (empty `[]` is an affirmative "no downstream") |
| Audit log line shape | Whatever dict the caller passed; typos persisted silently | Strict `AuditEvent` (`extra='forbid'`) validated pre-write; unknown fields and unknown ops rejected |
| Audit visibility of revocation | Only a `create_entry` line; revocation accountability fields not recorded | Additional `consent_revoked` line emitted with `revocation_actor`, `revocation_reason`, `downstream_invalidation_refs` |
| Audit line of `create_entry` | `entry_id`, `entry_schema_version`, `request_origin`, `auth_mode` | Same + `consent_status` + `visibility_status` (governance posture captured) |

Test suite: 76 passed (was 57 pre-Slice-C; 19 new tests directly trace to the guarantees above plus the AuditEvent strict-schema gate).
