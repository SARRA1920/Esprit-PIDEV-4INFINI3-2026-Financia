# ML interestRate (academic)

## 1) Install Python deps

```bash
pip install -r ml/requirements.txt
```

## 2) Train + export model

```bash
python ml/train_interest_rate.py
```

Artifacts are saved in `ml/artifacts/`:
- `model.pkl`
- `metrics.json`

## 3) Run FastAPI

```bash
uvicorn ml.api_main:app --host 0.0.0.0 --port 8000 --reload
```

Test:

```bash
curl -X POST http://localhost:8000/predict-rate ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\":6000,\"durationMonths\":12,\"income\":36000,\"riskScore\":80}"
```

