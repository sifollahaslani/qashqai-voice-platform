import hmac
import json
import os
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal, List, Optional

import anthropic
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, field_validator


# ---------- Data models ----------

class Message(BaseModel):
    language: Optional[Literal["qashqai", "fa", "tr", "en"]] = None
    text: str


class AgentResponse(BaseModel):
    agent: str
    text: str


class ChatResult(BaseModel):
    detected_language: str
    steps: List[AgentResponse]
    final: AgentResponse


class DetectResult(BaseModel):
    language: Literal["qashqai", "fa", "tr", "en"]
    confidence: Literal["low", "medium", "high"]


# ---------- Linguistic entry models ----------

ContentType = Literal["word", "sentence", "story", "song", "proverb", "oral_history"]

# Consent vocabulary — consent-centric, not publication-centric.
# Aligned with 06_Data_Governance/Withdrawal_Protocol_v1.md.
#   confirmed  — consent obtained and currently valid
#   pending    — consent not yet obtained
#   withdrawn  — consent was given and has been revoked
#   restricted — consent given with conditions on use
# Publication/visibility is expressed separately via VisibilityStatus.
ConsentStatus = Literal["confirmed", "pending", "withdrawn", "restricted"]

VisibilityStatus = Literal["public", "internal", "blocked"]

# Canonical speaker-id format. The consent-gate hook (hooks/consent-gate.sh)
# uses this same pattern (case-insensitively) to detect speaker references in
# Bash commands and to look up consent. Enforced here so the model and the
# hook share a single source of truth — see Step 4.
SPEAKER_ID_PATTERN = r"^SPK-\d{3,}$"
_SPEAKER_ID_RE = re.compile(SPEAKER_ID_PATTERN)

# Current entry schema version. Bumped when a breaking change to the
# LinguisticEntry shape lands (e.g. enum vocabulary, field rename, removal).
# Persisted on every record so future migrations can identify what shape
# each record was written under. See scripts/migrate_entries_v*.py.
CURRENT_ENTRY_SCHEMA_VERSION = 1


def _utc_now_iso() -> str:
    """Return current UTC time as RFC 3339 / ISO 8601 string with 'Z' suffix."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")


class LinguisticEntryCreate(BaseModel):
    # Governance hardening (Step 1): reject unknown fields at the request boundary
    # rather than silently dropping them. Inherited by LinguisticEntry, so the same
    # rule applies to response serialisation. Surfaces the data/entries.json schema
    # drift (legacy `ai_usage_permission` field) instead of hiding it.
    model_config = ConfigDict(extra="forbid")

    title: str
    content_type: ContentType
    language: str
    dialect: Optional[str] = None
    speaker_id: str
    speaker_display_name: Optional[str] = None
    recording_date: Optional[str] = None
    collector_name: Optional[str] = None
    consent_status: ConsentStatus
    community_consent_status: ConsentStatus = "pending"
    consent_withdrawable_until: Optional[str] = None
    ai_training_allowed: bool = False
    ai_inference_allowed: bool = False
    ai_generation_allowed: bool = False
    visibility_status: VisibilityStatus
    notes: Optional[str] = None

    # Audit metadata (Step 5) — minimal pair, no actor identity yet.
    #
    # created_at:
    #   RFC 3339 / ISO 8601 UTC timestamp. The POST handler sets this on
    #   creation if the caller omits it. `None` is the explicit marker for
    #   "legacy / unknown" — used by the v4 migration for records that
    #   predate this field. Auto-population is documented and tested
    #   (test_post_sets_created_at_automatically); callers can pass an
    #   explicit value to override (test_post_accepts_explicit_created_at).
    #
    # entry_schema_version:
    #   Schema version this record was written under. Defaulted to the
    #   module-level CURRENT_ENTRY_SCHEMA_VERSION on new records. Future
    #   migrations read this to decide what to do per record.
    created_at: Optional[str] = None
    entry_schema_version: int = CURRENT_ENTRY_SCHEMA_VERSION

    @field_validator("title", "language", "speaker_id")
    @classmethod
    def must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field must not be blank")
        return v.strip()

    @field_validator("speaker_id")
    @classmethod
    def must_match_canonical_speaker_id(cls, v: str) -> str:
        if not _SPEAKER_ID_RE.match(v):
            raise ValueError(
                f"speaker_id must match canonical format {SPEAKER_ID_PATTERN} "
                f"(e.g. 'SPK-001'); got {v!r}. Case matters."
            )
        return v

    @field_validator("visibility_status")
    @classmethod
    def check_consent_visibility(cls, v: str, info) -> str:
        """Public visibility requires confirmed consent.

        Rule: `visibility_status == "public"` is permitted only when
        `consent_status == "confirmed"`. Any other consent state
        (`pending`, `restricted`, `withdrawn`) blocks public visibility.

        Note (semantic change from pre-Step-3 code): the previous validator
        allowed public visibility with `restricted` consent. The new rule
        tightens that — restricted-use consent does not authorise public
        publication. Old `archive_only` and `pending` rules are preserved
        (mapped to `restricted` and `pending` respectively).
        """
        consent = info.data.get("consent_status")
        if v == "public" and consent != "confirmed":
            raise ValueError(
                f"Visibility cannot be public when consent_status is {consent!r}; "
                f"only 'confirmed' allows public visibility."
            )
        return v


class LinguisticEntry(LinguisticEntryCreate):
    id: str


# ---------- Entry storage ----------

_DATA_DIR = Path(__file__).resolve().parent.parent / "data"
_ENTRIES_FILE = _DATA_DIR / "entries.json"

# Audit log (Step 6) — append-only JSONL.
# One JSON object per line, never rewritten, never truncated. Each successful
# /entries write produces one audit line; if audit append fails, the API
# surfaces a 500 with the persisted entry_id so the operator can reconcile
# rather than silently lose the audit record.
_AUDIT_LOG_FILE = _DATA_DIR / "audit_log.jsonl"

# Audit schema version. Bumped Step 6 → Step 7: create_entry events gained
# the `auth_mode` field, and a new `auth_denied` op was introduced. The bump
# is forward-only — no pre-Step-7 audit data exists on disk (the Step 6
# leak was cleaned and never had real lines).
AUDIT_SCHEMA_VERSION = 2

# Step 7 — shared-secret auth + localhost allowlist.
# Read by require_api_token() at request time (not module load) so tests can
# monkeypatch env vars cleanly.
_AUTH_TOKEN_ENV = "QV_API_TOKEN"
_AUTH_HEADER_NAME = "X-QV-Auth-Token"
_LOCAL_ORIGINS = frozenset({"127.0.0.1", "::1", "localhost", "testclient"})


def _read_entries() -> List[dict]:
    """Return stored entries, or [] when the file does not exist yet.

    Raises RuntimeError if the file exists but cannot be read or parsed,
    so callers fail fast instead of silently overwriting good data.
    """
    if not _ENTRIES_FILE.exists():
        return []
    try:
        return json.loads(_ENTRIES_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            f"entries.json is corrupt (JSON parse error): {exc}"
        ) from exc
    except OSError as exc:
        raise RuntimeError(
            f"entries.json could not be read (OS error): {exc}"
        ) from exc


def _audit_safe(event: dict) -> None:
    """Best-effort audit append (Step 7) — used on the auth-deny path.

    Wraps _append_audit and swallows OSError after writing a warning to
    stderr. Rationale: the security decision (deny) must stand regardless
    of audit availability. Letting an audit-write failure abort the deny
    flow would turn disk-full or permission-denied into a vehicle for
    bypassing the deny entirely.

    Audit-write failures on this path are still loud — stderr is captured
    by every reasonable process supervisor and surfaces as an operational
    incident — but they do not change what the API returns to the caller.

    On the entry-creation path we use _append_audit directly (raising
    OSError → HTTPException 500) because there the operation has already
    succeeded and the caller MUST be told there's a recoverable gap.
    """
    try:
        _append_audit(event)
    except OSError as exc:
        print(
            f"[audit-warn] {event.get('op','?')}: audit append failed: {exc}. "
            f"Event lost: {json.dumps(event, ensure_ascii=False)}",
            file=sys.stderr,
            flush=True,
        )


def require_api_token(
    request: Request,
    x_qv_auth_token: Optional[str] = Header(None, alias=_AUTH_HEADER_NAME),
) -> str:
    """Shared-secret auth dependency (Step 7). Returns auth_mode string.

    Configuration:
      - QV_API_TOKEN env var set       -> require header X-QV-Auth-Token to
                                          match (constant-time compare).
                                          Success returns "token".
      - QV_API_TOKEN env var unset     -> allow only local origins
                                          (127.0.0.1 / ::1 / localhost /
                                          testclient). Success returns
                                          "localhost:<host>".
    Fail-closed: any other situation raises HTTPException 401.

    Every denial writes an `auth_denied` audit event before raising.
    Audit failure during deny is best-effort (stderr) so a broken audit
    disk cannot bypass the deny decision.
    """
    expected = os.environ.get(_AUTH_TOKEN_ENV)
    origin = request.client.host if request.client else "unknown"

    if expected:
        provided = x_qv_auth_token or ""
        if not hmac.compare_digest(provided.encode("utf-8"), expected.encode("utf-8")):
            _audit_safe({
                "audit_schema_version": AUDIT_SCHEMA_VERSION,
                "ts": _utc_now_iso(),
                "op": "auth_denied",
                "request_origin": origin,
                "reason": "missing_or_invalid_token",
            })
            raise HTTPException(
                status_code=401,
                detail="Authentication required.",
                headers={"WWW-Authenticate": f'{_AUTH_HEADER_NAME} realm="QashqAI"'},
            )
        return "token"

    # No token configured → localhost-only fallback.
    if origin in _LOCAL_ORIGINS:
        return f"localhost:{origin}"

    _audit_safe({
        "audit_schema_version": AUDIT_SCHEMA_VERSION,
        "ts": _utc_now_iso(),
        "op": "auth_denied",
        "request_origin": origin,
        "reason": "no_token_configured_remote_origin",
    })
    raise HTTPException(
        status_code=401,
        detail=(
            f"Authentication not configured ({_AUTH_TOKEN_ENV} unset) and "
            f"request is from non-local origin {origin!r}. Set "
            f"{_AUTH_TOKEN_ENV} to enable remote access."
        ),
    )


def _append_audit(event: dict) -> None:
    """Append a single JSON object as one line to the audit log (Step 6).

    Append-only contract:
      - opens in "a" mode (positions at EOF, never truncates)
      - writes exactly one line: `json.dumps(event) + "\\n"`
      - flush() + os.fsync() to durably commit before returning
      - no rename, no temp file — the file's prior contents are never
        touched, only extended

    Why no temp+rename like _write_entries? An append is not a replace.
    The prior bytes of the audit log are the audit record; we must extend
    them in place. Crash mid-append may leave a partial trailing line —
    JSONL readers are expected to detect and ignore lines that fail to
    parse as JSON, which is the standard JSONL recovery convention.

    Caller (create_entry) catches OSError and surfaces it as a 500 with
    the persisted entry_id named, so an audit-write failure cannot be
    silently swallowed.
    """
    _DATA_DIR.mkdir(parents=True, exist_ok=True)
    line = json.dumps(event, ensure_ascii=False) + "\n"
    with open(_AUDIT_LOG_FILE, "a", encoding="utf-8") as fh:
        fh.write(line)
        fh.flush()
        os.fsync(fh.fileno())


def _write_entries(entries: List[dict]) -> None:
    """Atomically write entries to disk (Step 5).

    Flow:
      1. Serialize JSON to a sibling temp file in the same directory.
      2. flush() + os.fsync() to force bytes from buffer to disk.
      3. os.replace(tmp, real) — atomic rename on POSIX and Windows
         (Python 3.3+ on Windows maps this to MoveFileEx with
         MOVEFILE_REPLACE_EXISTING).

    Crash semantics: if any step before the os.replace fails (process killed,
    disk full, permission denied), the original file is unchanged. A stale
    `.tmp` file may remain — the next successful write overwrites it. There
    is no partial-state window where readers see truncated JSON.
    """
    _DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp = _ENTRIES_FILE.with_name(_ENTRIES_FILE.name + ".tmp")
    data = json.dumps(entries, ensure_ascii=False, indent=2)
    with open(tmp, "w", encoding="utf-8") as fh:
        fh.write(data)
        fh.flush()
        os.fsync(fh.fileno())
    os.replace(tmp, _ENTRIES_FILE)


# ---------- Language detection ----------

# Qashqai-specific markers: letters/digraphs common in Qashqai Turkic but
# rare in standard Persian, plus common Qashqai function words.
_QASHQAI_MARKERS = set("ۆۉۊۋ")  # Qashqai-specific Arabic-script vowel letters
_QASHQAI_WORDS = {"من", "سن", "او", "بیز", "سیز", "اونلار", "نئجه", "هارا", "نه", "بو", "او"}
_TURKISH_CHARS = set("ğşıöüçĞŞIÖÜÇ")


def detect_language(text: str) -> DetectResult:
    """
    Heuristic script-based language detection — no ML dependencies needed.

    Strategy:
    1. Count Arabic-script vs Latin-script characters.
    2. If mostly Arabic script: look for Qashqai-specific markers → qashqai, else → fa.
    3. If mostly Latin: look for Turkish-specific diacritics → tr, else → en.
    """
    stripped = text.strip()
    if not stripped:
        return DetectResult(language="en", confidence="low")

    arabic_count = sum(
        1 for ch in stripped
        if "\u0600" <= ch <= "\u06FF"
        or "\uFB50" <= ch <= "\uFDFF"
        or "\uFE70" <= ch <= "\uFEFF"
    )
    latin_count = sum(1 for ch in stripped if ch.isascii() and ch.isalpha())
    total = arabic_count + latin_count or 1

    if arabic_count / total >= 0.4:
        # Arabic-script: distinguish Qashqai from Persian
        has_qashqai_char = any(ch in _QASHQAI_MARKERS for ch in stripped)
        words = set(stripped.split())
        qashqai_word_hits = len(words & _QASHQAI_WORDS)

        if has_qashqai_char or qashqai_word_hits >= 2:
            confidence = "high" if has_qashqai_char else "medium"
            return DetectResult(language="qashqai", confidence=confidence)
        if qashqai_word_hits == 1:
            return DetectResult(language="qashqai", confidence="low")
        return DetectResult(language="fa", confidence="medium" if arabic_count / total >= 0.6 else "low")

    # Latin-script: distinguish Turkish from English
    has_turkish = any(ch in _TURKISH_CHARS for ch in stripped)
    if has_turkish:
        return DetectResult(language="tr", confidence="high")
    return DetectResult(language="en", confidence="medium" if latin_count / total >= 0.6 else "low")


# ---------- Simple multi-agent core ----------

class BaseAgent:
    name: str

    def __init__(self, name: str) -> None:
        self.name = name

    def handle(self, msg: Message) -> str:
        raise NotImplementedError


class CulturalGuardianAgent(BaseAgent):
    """
    Very simple cultural-safety filter.
    Checks for empty text, taboo logic can be added later.
    """

    def handle(self, msg: Message) -> str:
        if not msg.text.strip():
            return "Message is empty; please write something."
        return (
            f"Cultural check passed for language='{msg.language}'. Content looks respectful."
        )


_SYSTEM_PROMPTS = {
    "qashqai": (
        "Sen QashqAI Voice platformunun akıl yürütme ajanısın. "
        "Qashqai Türkçesi konuşan kullanıcılara yardımcı oluyorsun — bu dil İran'da konuşulan, "
        "tehlike altındaki bir Türk dilidir. "
        "Yanıtlarını mümkün olduğunca Qashqai Türkçesiyle ver; "
        "gerektiğinde Farsça veya Türkiye Türkçesiyle destekle. "
        "Dilin korunmasına ve yaşatılmasına katkıda bulun."
    ),
    "fa": (
        "شما دستیار هوشمند پلتفرم QashqAI Voice هستید. "
        "به کاربران فارسی‌زبان به طور کامل به فارسی پاسخ دهید. "
        "در صورت نیاز، ارتباط فرهنگی با جوامع قشقایی را در نظر بگیرید."
    ),
    "tr": (
        "Sen QashqAI Voice platformunun akıl yürütme ajanısın. "
        "Türkçe konuşan kullanıcılara tam olarak Türkçe yanıt ver. "
        "Gerektiğinde Qashqai Türkçesiyle olan kültürel bağlantılara değin."
    ),
    "en": (
        "You are the reasoning agent of the QashqAI Voice platform, "
        "a cultural-technological initiative for preserving the Qashqai language — "
        "an endangered Turkic language spoken in Iran. "
        "Respond fully in English and, where relevant, highlight connections "
        "to Qashqai language and culture."
    ),
}


class ReasoningAgent(BaseAgent):
    """
    Main reasoning engine — powered by Claude claude-opus-4-6 with adaptive thinking.
    Uses a language-specific system prompt to respond in the user's language.
    """

    def __init__(self, name: str) -> None:
        super().__init__(name)
        self._client = anthropic.AsyncAnthropic(
            api_key=os.environ.get("ANTHROPIC_API_KEY")
        )

    async def handle(self, msg: Message) -> str:
        lang = msg.language or "en"
        system = _SYSTEM_PROMPTS.get(lang, _SYSTEM_PROMPTS["en"])

        try:
            async with self._client.messages.stream(
                model="claude-opus-4-6",
                max_tokens=1024,
                thinking={"type": "adaptive"},
                system=system,
                messages=[{"role": "user", "content": msg.text.strip()}],
            ) as stream:
                final = await stream.get_final_message()

            return next(
                (block.text for block in final.content if block.type == "text"),
                "",
            )
        except anthropic.AuthenticationError:
            raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY is missing or invalid.")
        except anthropic.APIConnectionError:
            raise HTTPException(status_code=502, detail="Could not connect to Claude API.")
        except anthropic.APIStatusError as exc:
            raise HTTPException(status_code=502, detail=f"Claude API error {exc.status_code}: {exc.message}")


class OrchestratorAgent(BaseAgent):
    """
    Orchestrator:
    1) Auto-detect language if not provided
    2) Cultural guardian
    3) Reasoning
    """

    def __init__(self):
        super().__init__(name="orchestrator")
        self.guardian = CulturalGuardianAgent("cultural_guardian")
        self.reasoner = ReasoningAgent("reasoner")

    async def run(self, msg: Message) -> ChatResult:
        steps: List[AgentResponse] = []

        # Resolve language (auto-detect if omitted)
        if msg.language is None:
            detected = detect_language(msg.text)
            msg = msg.model_copy(update={"language": detected.language})
            steps.append(AgentResponse(
                agent="language_detector",
                text=f"Detected language='{detected.language}' (confidence: {detected.confidence}).",
            ))

        g = self.guardian.handle(msg)
        steps.append(AgentResponse(agent="cultural_guardian", text=g))

        r = await self.reasoner.handle(msg)
        final = AgentResponse(agent="reasoner", text=r)
        steps.append(final)

        return ChatResult(detected_language=msg.language, steps=steps, final=final)


# ---------- FastAPI wiring ----------

app = FastAPI(
    title="QashqAI Voice Multi-Agent Platform",
    description="Prototype: cultural guardian + reasoning agent + orchestrator",
    version="0.3.0",
)

# ---------- CORS ----------
# ALLOWED_ORIGINS env var: comma-separated list of frontend URLs.
# Falls back to localhost for local development.
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000")
_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

orchestrator = OrchestratorAgent()


@app.get("/")
def root():
    return {
        "project": "QashqAI Voice",
        "status": "running",
        "endpoints": ["/chat", "/detect"],
    }


@app.post("/detect", response_model=DetectResult)
def detect_api(msg: Message):
    """Detect the language of the provided text without running the full agent pipeline."""
    return detect_language(msg.text)


@app.post("/chat", response_model=ChatResult)
async def chat_api(msg: Message):
    return await orchestrator.run(msg)


# ---------- Linguistic entry endpoints ----------

@app.post("/entries", response_model=LinguisticEntry, status_code=201)
def create_entry(
    payload: LinguisticEntryCreate,
    request: Request,
    auth_mode: str = Depends(require_api_token),
):
    try:
        entries = _read_entries()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    # Set created_at if the caller omitted it. Documented and tested behaviour
    # (not a hidden default) — see test_post_sets_created_at_automatically and
    # test_post_accepts_explicit_created_at.
    payload_dict = payload.model_dump()
    if payload_dict.get("created_at") is None:
        payload_dict["created_at"] = _utc_now_iso()
    entry = LinguisticEntry(id=str(uuid.uuid4()), **payload_dict)
    entries.append(entry.model_dump())
    _write_entries(entries)  # atomic (Step 5)

    # Audit append AFTER successful entry write (Step 6). Ordering rationale:
    # if we appended audit first and the entry write then failed, the audit
    # would reference a phantom entry. Post-write audit accepts a narrow
    # inconsistency window in exchange for a clean invariant: every audit
    # line refers to an entry that definitely exists on disk.
    #
    # If audit append raises, the entry IS persisted — we surface a 500 that
    # names the entry_id explicitly so the operator can reconcile rather
    # than the audit failure being silently swallowed. This is "loud, not
    # corrupting": entries are intact; audit has a known, surfaced gap.
    audit_event = {
        "audit_schema_version": AUDIT_SCHEMA_VERSION,
        "ts": _utc_now_iso(),
        "op": "create_entry",
        "entry_id": entry.id,
        "entry_schema_version": entry.entry_schema_version,
        "request_origin": (request.client.host if request.client else "unknown"),
        "auth_mode": auth_mode,  # Step 7 — how this request was authenticated
    }
    try:
        _append_audit(audit_event)
    except OSError as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Entry {entry.id} was persisted but audit log append failed: {exc}. "
                f"Reconcile manually before retrying to avoid a duplicate entry."
            ),
        ) from exc

    return entry


@app.get("/entries", response_model=List[LinguisticEntry])
def list_entries(auth_mode: str = Depends(require_api_token)):
    try:
        return _read_entries()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
