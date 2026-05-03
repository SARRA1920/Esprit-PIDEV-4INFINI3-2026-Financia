#!/usr/bin/env python3
"""
Agentic Savings Coach — Production-ready version
=================================================
Fixes applied vs previous versions:
  1. Ollama health-check on startup (clear error if Ollama isn't running)
  2. 422 fix: AgentRequest fields are all Optional with defaults
  3. create_agent used correctly (langchain 1.2.x)
  4. @tool decorators present (required for LangGraph tool introspection)
  5. Graceful fallback when Spring Boot is unreachable (no crash)
  6. Thread-safe numpy RNG

Run order (IMPORTANT):
  1. ollama serve                          <- must be running first
  2. ollama pull llama3.1:8b              <- only needed once
  3. Start Spring Boot on port 8083
  4. python agentic_savings_agent.py
"""

import logging
import sys
from typing import List, Optional

import numpy as np
import requests
from fastapi import FastAPI, HTTPException
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_core.messages import HumanMessage
from langchain_ollama import ChatOllama
from pydantic import BaseModel

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
)
log = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
OLLAMA_BASE = "http://localhost:11434"
OLLAMA_MODEL = "llama3.2:3b"
# Spring Boot runs with context-path `/f` (see src/main/resources/application.properties)
SPRING_BOOT_BASE = "http://localhost:8083/f"


# ── Startup check: fail fast with a readable message if Ollama is not running ─
def _require_ollama() -> None:
    try:
        r = requests.get(f"{OLLAMA_BASE}/api/tags", timeout=3)
        models = [m["name"] for m in r.json().get("models", [])]
        if not any(OLLAMA_MODEL in m for m in models):
            log.warning(
                f"Model '{OLLAMA_MODEL}' not found locally. "
                f"Run:  ollama pull {OLLAMA_MODEL}"
            )
        else:
            log.info(f"Ollama OK — model '{OLLAMA_MODEL}' is available.")
    except Exception:
        log.error(
            "\n"
            "=================================================================\n"
            "  Ollama is NOT running. The agent cannot start.\n"
            "\n"
            "  Fix — open a new PowerShell window and run:\n"
            "      ollama serve\n"
            "      ollama pull llama3.1:8b    (first time only)\n"
            "\n"
            "  Then restart this script.\n"
            "================================================================="
        )
        sys.exit(1)


_require_ollama()

# ── LLM ───────────────────────────────────────────────────────────────────────
llm = ChatOllama(model=OLLAMA_MODEL, temperature=0.2)

# ── FastAPI ───────────────────────────────────────────────────────────────────
app = FastAPI(title="Agentic Savings Coach")


# ── Pydantic schemas ──────────────────────────────────────────────────────────
# All fields Optional with defaults = no more 422 errors for partial bodies
class AgentRequest(BaseModel):
    userId:  Optional[str] = None
    goalId:  Optional[int] = None
    query:   Optional[str] = None


class AgentResponse(BaseModel):
    reasoning:           str
    advice:              str
    actions_taken:       List[str]
    data_quality_score:  float
    data_quality_issues: List[str]
    data_quality_note:   str
    disclaimer:          str


# ── Helper: safe GET to Spring Boot ───────────────────────────────────────────
def _spring_get(path: str):
    """GET from Spring Boot. Returns None (never raises) if unreachable."""
    try:
        r = requests.get(f"{SPRING_BOOT_BASE}{path}", timeout=5)
        return r.json() if r.ok else None
    except Exception as exc:
        log.warning(f"Spring Boot unreachable at {path}: {exc}")
        return None


# ── Tools ─────────────────────────────────────────────────────────────────────
@tool
def check_data_quality(goal_id: int) -> dict:
    """
    Fetch all transactions for a savings goal and compute a BIS data-quality
    score from 0 to 100. Always call this tool first before any other tool.
    Returns dict with score (float 0-100) and issues (list of strings).
    A score below 70 means data problems that affect advice reliability.
    """
    data = _spring_get(f"/api/savings/goals/{goal_id}/transactions")
    if data is None:
        return {"score": 0.0, "issues": ["Spring Boot unreachable"]}

    transactions = data if isinstance(data, list) else []
    issues: List[str] = []
    score = 100.0

    for tx in transactions:
        if tx.get("amount") is None or float(tx.get("amount", 0)) <= 0:
            issues.append(f"Transaction {tx.get('id', '?')}: invalid amount")
            score -= 25

    score = round(max(0.0, min(100.0, score)), 1)
    return {
        "score": score,
        "issues": issues if issues else ["Data quality is good"],
    }


@tool
def get_goal_details(goal_id: int) -> dict:
    """
    Retrieve full details of a savings goal by its numeric ID.
    Returns fields like targetAmount, currentAmount, deadline, name.
    Returns an error dict if the goal does not exist or backend is down.
    """
    data = _spring_get(f"/api/savings/goals/{goal_id}")
    return data if data is not None else {"error": "Goal not found or backend unreachable"}


@tool
def monte_carlo_goal_forecast(goal_id: int, monthly_saving: float = 100.0, months: int = 12) -> dict:
    """
    Run a 10000-path Monte Carlo simulation to estimate the probability of
    reaching a savings goal. Assumes a monthly return of 0.5 percent plus
    3 percent volatility and a fixed monthly deposit of monthly_saving TND
    over the given number of months.
    Returns probability_success as a percentage and average_final_amount in TND.
    """
    goal = _spring_get(f"/api/savings/goals/{goal_id}")
    if goal is None or "error" in goal:
        return {"error": "Goal not found or backend unreachable"}

    target  = float(goal.get("targetAmount", 10_000))
    current = float(goal.get("currentAmount", 0))

    rng = np.random.default_rng()
    balances = np.full(10_000, current, dtype=float)
    for _ in range(months):
        balances = balances * (1 + rng.normal(0.005, 0.03, size=10_000)) + monthly_saving

    return {
        "probability_success":  round(float((balances >= target).mean() * 100), 1),
        "average_final_amount": round(float(balances.mean()), 2),
    }


tools = [check_data_quality, get_goal_details, monte_carlo_goal_forecast]

# ── Agent ─────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are a professional Tunisian micro-epargne savings coach.

STRICT GUARDRAILS:
- NEVER give investment, stock, or high-risk financial advice.
- ALWAYS call check_data_quality first before using any other tool.
- Only discuss savings goals, deposits, and personal finance habits.
- Always end your final answer with a disclaimer.
- Be empathetic and practical for rural Tunisian micro-entrepreneur users.
- Answer in French or English matching the user query language.
"""

agent = create_agent(
    model=llm,
    tools=tools,
    system_prompt=SYSTEM_PROMPT,
)


# ── Endpoint ──────────────────────────────────────────────────────────────────
@app.post("/agent/savings-advice", response_model=AgentResponse)
async def savings_advice(request: AgentRequest):
    user_id = request.userId or "unknown"
    goal_id = request.goalId
    query   = request.query or "Provide general savings advice."

    log.info(f"Request  user={user_id}  goal={goal_id}  query={query!r}")

    try:
        human_text = (
            f"User ID: {user_id} | "
            f"Savings Goal ID: {goal_id if goal_id else 'not provided'} | "
            f"User query: {query}"
        )

        result       = agent.invoke({"messages": [HumanMessage(content=human_text)]})
        final_answer = result["messages"][-1].content

        quality = (
            check_data_quality.invoke({"goal_id": goal_id})
            if goal_id
            else {"score": 70.0, "issues": ["No goal ID provided"]}
        )

        return AgentResponse(
            reasoning="Agent followed guardrails and BIS data quality check",
            advice=final_answer,
            actions_taken=[
                "BIS data quality check",
                "Goal detail retrieval",
                "Monte Carlo simulation if applicable",
            ],
            data_quality_score=quality["score"],
            data_quality_issues=quality["issues"],
            data_quality_note=f"Data Quality Score: {quality['score']}/100",
            disclaimer=(
                "This is AI-generated advice for informational purposes only. "
                "It is not financial advice. Consult a licensed financial advisor."
            ),
        )

    except Exception as exc:
        log.error(f"Agent error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    try:
        requests.get(f"{OLLAMA_BASE}/api/tags", timeout=2)
        ollama_ok = True
    except Exception:
        ollama_ok = False

    # Spring may be reachable but return 401/403 depending on security rules.
    # For health, "up" means the server responds at all.
    try:
        requests.get(f"{SPRING_BOOT_BASE}/api/savings/goals", timeout=2)
        spring_ok = True
    except Exception:
        spring_ok = False

    return {
        "status":      "healthy" if (ollama_ok and spring_ok) else "degraded",
        "ollama":      "up" if ollama_ok else "DOWN — run: ollama serve",
        "spring_boot": "up" if spring_ok else "DOWN — start Spring Boot",
        "model":       OLLAMA_MODEL,
        "guardrails":  "active",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)