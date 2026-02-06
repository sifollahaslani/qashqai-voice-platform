from typing import Literal, List
from fastapi import FastAPI
from pydantic import BaseModel


# ---------- Data models ----------

class Message(BaseModel):
    language: Literal["qashqai", "fa", "tr", "en"]
    text: str


class AgentResponse(BaseModel):
    agent: str
    text: str


class ChatResult(BaseModel):
    steps: List[AgentResponse]
    final: AgentResponse


# ---------- Simple multi-agent core ----------

class BaseAgent:
    name: str

    def _init_(self, name: str) -> None:
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
        return f"English reasoning: “{base}”."


class OrchestratorAgent(BaseAgent):
    """
    Orchestrator:
    1) Cultural guardian
    2) Reasoning
    """

    def _init_(self):
        super()._init_(name="orchestrator")
        self.guardian = CulturalGuardianAgent("cultural_guardian")
        self.reasoner = ReasoningAgent("reasoner")

    def run(self, msg: Message) -> ChatResult:
        steps: List[AgentResponse] = []

        g = self.guardian.handle(msg)
        steps.append(AgentResponse(agent="cultural_guardian", text=g))

        r = self.reasoner.handle(msg)
        final = AgentResponse(agent="reasoner", text=r)
        steps.append(final)

        return ChatResult(steps=steps, final=final)


# ---------- FastAPI wiring ----------

app = FastAPI(
    title="QashqAI Voice Multi-Agent Platform",
    description="Prototype: cultural guardian + reasoning agent + orchestrator",
    version="0.2.0",
)

orchestrator = OrchestratorAgent()


@app.get("/")
def root():
    return {
        "project": "QashqAI Voice",
        "status": "running",
        "endpoint": "/chat",
    }


@app.post("/chat", response_model=ChatResult)
def chat_api(msg: Message):
    return orchestrator.run(msg)
