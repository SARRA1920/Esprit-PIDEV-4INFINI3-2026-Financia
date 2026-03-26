from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field


ARTIFACTS = Path(__file__).resolve().parent / "artifacts"
MODEL_PATH = ARTIFACTS / "model.pkl"

app = FastAPI(title="Interest Rate ML API", version="1.0")
model = None


class RateRequest(BaseModel):
    amount: float = Field(gt=0)
    durationMonths: int = Field(gt=0)
    income: float = Field(gt=0)
    riskScore: float = Field(ge=0, le=100)


class RateResponse(BaseModel):
    interestRate: float


def clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


@app.on_event("startup")
def load_model():
    global model
    model = joblib.load(MODEL_PATH)


@app.post("/predict-rate", response_model=RateResponse)
def predict_rate(req: RateRequest):
    X = pd.DataFrame([req.model_dump()])
    y = float(model.predict(X)[0])
    y = clamp(y, 5.0, 25.0)
    return RateResponse(interestRate=round(y, 2))

