import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "application_train.csv"
OUT_DIR = Path(__file__).resolve().parent / "artifacts"
MODEL_PATH = OUT_DIR / "model.pkl"
METRICS_PATH = OUT_DIR / "metrics.json"


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    usecols = ["TARGET", "AMT_INCOME_TOTAL", "AMT_CREDIT", "AMT_ANNUITY"]
    df = pd.read_csv(DATA_PATH, usecols=usecols)

    # ---- Feature engineering (Home Credit) ----
    # durationMonths ~ AMT_CREDIT / AMT_ANNUITY (clamp to realistic range)
    duration = (df["AMT_CREDIT"] / df["AMT_ANNUITY"]).replace([np.inf, -np.inf], np.nan)
    df["durationMonths"] = duration.round()
    df["durationMonths"] = df["durationMonths"].clip(6, 60)

    # riskScore: academic + coherent with "higher risk => higher rate"
    # Home Credit: TARGET=1 means default => risk high
    df["riskScore"] = df["TARGET"] * 100.0

    # target interestRate (annual %, synthetic)
    rate = (
        5.0
        + (df["riskScore"] * 0.1)
        + (df["AMT_CREDIT"] / 10000.0)
        + (df["durationMonths"] * 0.02)
    )
    df["interestRate"] = rate.clip(5.0, 25.0)

    X = df[["AMT_CREDIT", "durationMonths", "AMT_INCOME_TOTAL", "riskScore"]].copy()
    X.columns = ["amount", "durationMonths", "income", "riskScore"]
    y = df["interestRate"].astype(float)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("model", RandomForestRegressor(n_estimators=300, random_state=42, n_jobs=-1)),
        ]
    )

    pipe.fit(X_train, y_train)

    pred = pipe.predict(X_test)
    rmse = float(mean_squared_error(y_test, pred, squared=False))
    r2 = float(r2_score(y_test, pred))

    joblib.dump(pipe, MODEL_PATH)
    METRICS_PATH.write_text(json.dumps({"rmse": rmse, "r2": r2}, indent=2), encoding="utf-8")

    print("Saved:", MODEL_PATH)
    print("Metrics:", {"rmse": rmse, "r2": r2})


if __name__ == "__main__":
    main()

