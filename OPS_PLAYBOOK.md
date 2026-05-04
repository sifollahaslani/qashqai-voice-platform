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
