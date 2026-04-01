# Fraud Detection ML Service

Python Flask service that provides AI-powered fraud detection for the Financia application.

## Features

- **Partenaire Risk Prediction**: Analyzes partenaire history and predicts fraud risk
- **Commitment Risk Prediction**: Evaluates individual commitments for anomalies
- **Pre-trained Model**: Includes a Random Forest classifier trained on sample data
- **Model Retraining**: Endpoint to retrain model with new data
- **Health Check**: Monitor service status

## Installation

### Prerequisites
- Python 3.8 or higher
- pip

### Setup

1. Navigate to the ml-service directory:
```bash
cd ml-service
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Service

Start the Flask server:
```bash
python app.py
```

The service will start on `http://localhost:5000`

## API Endpoints

### 1. Health Check
```
GET http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "version": "1.0.0"
}
```

### 2. Predict Partenaire Risk
```
POST http://localhost:5000/predict/partenaire
Content-Type: application/json

{
  "partenaireId": 5,
  "commitments": [
    {
      "amount": 50000,
      "status": "PAID",
      "daysLate": 10,
      "paymentDate": "2026-01-15"
    },
    {
      "amount": 75000,
      "status": "DEFAULTED",
      "daysLate": 120
    }
  ],
  "daysInactive": 30,
  "activityFrequency": 0.5
}
```

Response:
```json
{
  "prediction": "MEDIUM_RISK",
  "confidence": 0.75,
  "probabilities": {
    "low": 0.2,
    "medium": 0.5,
    "high": 0.25,
    "critical": 0.05
  },
  "features": {
    "default_rate": 50.0,
    "avg_commitment": 62500.0,
    "commitment_count": 2,
    "late_payment_rate": 50.0,
    "days_inactive": 30,
    "activity_frequency": 0.5
  }
}
```

### 3. Predict Commitment Risk
```
POST http://localhost:5000/predict/commitment
Content-Type: application/json

{
  "commitmentAmount": 100000,
  "daysOverdue": 95,
  "partnerDefaultCount": 2,
  "fundCapacity": 500000
}
```

Response:
```json
{
  "prediction": "HIGH_RISK",
  "confidence": 0.8,
  "risk_score": 55
}
```

### 4. Train Model
```
POST http://localhost:5000/train
Content-Type: application/json

{
  "features": [
    [5, 50000, 10, 10, 30, 0.5],
    [40, 80000, 20, 35, 120, 0.15]
  ],
  "labels": [0, 2]
}
```

Response:
```json
{
  "status": "success",
  "message": "Model trained with 2 samples",
  "accuracy": 1.0
}
```

## Integration with Java Backend

Update `FraudDetectionService.java` to call the Python service:

```java
private AIModelResult callAIModel(Partenaire partenaire, List<PartenaireFond> commitments) {
    try {
        RestTemplate restTemplate = new RestTemplate();
        String url = "http://localhost:5000/predict/partenaire";
        
        // Prepare request
        Map<String, Object> request = new HashMap<>();
        request.put("partenaireId", partenaire.getIdPartenaire());
        
        List<Map<String, Object>> commitmentsData = commitments.stream()
            .map(c -> {
                Map<String, Object> cm = new HashMap<>();
                cm.put("amount", c.getCommittedAmount());
                cm.put("status", c.getCommitmentStatus().name());
                cm.put("daysLate", c.getPaymentDate() != null && c.getCommitmentDate() != null
                    ? ChronoUnit.DAYS.between(c.getCommitmentDate(), c.getPaymentDate())
                    : 0);
                cm.put("paymentDate", c.getPaymentDate() != null ? c.getPaymentDate().toString() : null);
                return cm;
            })
            .collect(Collectors.toList());
        
        request.put("commitments", commitmentsData);
        request.put("daysInactive", 30); // Calculate actual value
        request.put("activityFrequency", 0.5); // Calculate actual value
        
        // Make request
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
        Map<String, Object> body = response.getBody();
        
        String prediction = (String) body.get("prediction");
        Double confidence = ((Number) body.get("confidence")).doubleValue();
        
        return new AIModelResult(prediction, confidence);
        
    } catch (Exception e) {
        System.err.println("AI Model call failed: " + e.getMessage());
        return new AIModelResult("MEDIUM_RISK", 0.5);
    }
}
```

## Model Details

### Features Used

**Partenaire Features:**
1. `default_rate`: Percentage of defaulted commitments (0-100)
2. `avg_commitment`: Average commitment amount
3. `commitment_count`: Total number of commitments
4. `late_payment_rate`: Percentage of late payments (0-100)
5. `days_inactive`: Days since last activity
6. `activity_frequency`: Commitments per month

**Commitment Features:**
1. `commitment_amount`: Amount of the commitment
2. `days_overdue`: Days payment is overdue
3. `partner_default_count`: Number of previous defaults by partenaire
4. `fund_capacity`: Total fund capacity
5. `payment_delay`: Days between commitment and payment

### Risk Levels

- **LOW_RISK** (0): Low probability of fraud
- **MEDIUM_RISK** (1): Moderate risk, monitor closely
- **HIGH_RISK** (2): High risk, enhanced verification needed
- **CRITICAL_RISK** (3): Critical risk, immediate action required

### Model Algorithm

- **Algorithm**: Random Forest Classifier
- **Estimators**: 100 trees
- **Training Data**: Pre-trained on sample fraud patterns
- **Retraining**: Can be retrained with actual data via `/train` endpoint

## Production Deployment

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t fraud-detection-ml .
docker run -p 5000:5000 fraud-detection-ml
```

### Environment Variables

```bash
export FLASK_ENV=production
export MODEL_PATH=/path/to/fraud_model.pkl
```

## Monitoring

Monitor the service with:
```bash
curl http://localhost:5000/health
```

## Troubleshooting

**Issue**: Model not loading
- **Solution**: Delete `fraud_model.pkl` and restart - a new model will be created

**Issue**: CORS errors from Java backend
- **Solution**: Ensure `flask-cors` is installed and CORS is enabled

**Issue**: Low prediction accuracy
- **Solution**: Retrain model with actual data using `/train` endpoint

## Future Enhancements

1. Add more sophisticated features (network analysis, behavioral patterns)
2. Implement deep learning models (LSTM for time series)
3. Add model versioning and A/B testing
4. Implement real-time model updates
5. Add explainability (SHAP values, feature importance)
6. Integrate with external data sources (credit scores, sanctions lists)
