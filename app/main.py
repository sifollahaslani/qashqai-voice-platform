from typing import Literal, List, Optional
from fastapi import FastAPI
from pydantic import BaseModel


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


class ReasoningAgent(BaseAgent):
    """
    Main reasoning engine (placeholder).
    """

    def handle(self, msg: Message) -> str:
        base = msg.text.strip()
        lang = msg.language

        if lang == "qashqai":
            return f"Qashqai reasoning: «{base}»."
        if lang == "fa":
            return f"استدلال قشقایی: «{base}»."
        if lang == "tr":
            return f"Türkçe akıl yürütme: «{base}»."
        return f'English reasoning: \u201c{base}\u201d.'


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

    def run(self, msg: Message) -> ChatResult:
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

        r = self.reasoner.handle(msg)
        final = AgentResponse(agent="reasoner", text=r)
        steps.append(final)

        return ChatResult(detected_language=msg.language, steps=steps, final=final)


# ---------- FastAPI wiring ----------

app = FastAPI(
    title="QashqAI Voice Multi-Agent Platform",
    description="Prototype: cultural guardian + reasoning agent + orchestrator",
    version="0.3.0",
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
def chat_api(msg: Message):
    return orchestrator.run(msg)
