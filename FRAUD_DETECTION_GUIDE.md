# Fraud Detection & Anomaly Detection System

## Overview
AI-powered fraud detection system that analyzes partners, commitments, and payment patterns to identify suspicious activities.

---

## API Endpoints

### 1. Detect Partenaire Fraud
```
GET http://localhost:8083/api/fraud-detection/partner/{partenaireId}
```

Analyzes a specific partenaire for fraud indicators including:
- High default rate
- Unusual commitment amounts
- Rapid multiple commitments
- Late payment patterns
- Sudden activity spikes

### 2. Detect Commitment Fraud
```
GET http://localhost:8083/api/fraud-detection/commitment/{commitmentId}
```

Analyzes a specific commitment for anomalies:
- Large commitment vs fond capacity
- Payment delays
- Partenaire default history

### 3. Scan All Entities
```
GET http://localhost:8083/api/fraud-detection/scan-all
```

Scans all partenaires and commitments, returns entities with risk score > 30

### 4. Get High Risk Entities
```
GET http://localhost:8083/api/fraud-detection/high-risk
```

Returns entities with risk score >= 50

### 5. Get Critical Alerts
```
GET http://localhost:8083/api/fraud-detection/critical-alerts
```

Returns entities with risk score >= 70 (immediate action required)

---

## Response Example

```json
{
  "entityId": 4,
  "entityType": "PARTENAIRE",
  "entityName": "ABC Bank",
  "riskScore": 65.0,
  "riskLevel": "HIGH",
  "anomalies": [
    {
      "type": "HIGH_DEFAULT_RATE",
      "description": "Partner has 40.0% default rate (2 of 5 commitments)",
      "severity": "HIGH",
      "score": 30.0
    },
    {
      "type": "LATE_PAYMENT_PATTERN",
      "description": "3 payments were significantly late",
      "severity": "MEDIUM",
      "score": 20.0
    },
    {
      "type": "RAPID_COMMITMENTS",
      "description": "6 commitments in last 7 days",
      "severity": "MEDIUM",
      "score": 15.0
    }
  ],
  "aiModelPrediction": "MEDIUM_RISK",
  "aiConfidence": 0.65,
  "recommendation": "Enhanced monitoring required. Review all recent transactions and contact partner"
}
```

---

## Detection Rules

### Partenaire-Level Detection

1. **High Default Rate** (30 points)
   - Triggers when default rate > 30%
   - Severity: HIGH

2. **Unusual Commitment Amount** (20 points)
   - Triggers when commitment > 3x average
   - Severity: MEDIUM

3. **Rapid Commitments** (15 points)
   - Triggers when > 5 commitments in 7 days
   - Severity: MEDIUM

4. **Late Payment Pattern** (20 points)
   - Triggers when > 30% of payments are 60+ days late
   - Severity: MEDIUM

5. **Sudden Activity Spike** (25 points)
   - Triggers when inactive for 180+ days then 50%+ recent activity
   - Severity: HIGH

### Commitment-Level Detection

1. **Large Commitment** (15 points)
   - Triggers when commitment > 80% of remaining fond capacity
   - Severity: MEDIUM

2. **Long Overdue** (30 points)
   - Triggers when payment overdue by 90+ days
   - Severity: HIGH

3. **Overdue Payment** (20 points)
   - Triggers when payment overdue by 60+ days
   - Severity: MEDIUM

4. **Partenaire Default History** (25 points)
   - Triggers when partenaire has previous defaults
   - Severity: HIGH

---

## Risk Levels

| Risk Score | Level | Action Required |
|------------|-------|-----------------|
| 0-29 | LOW | Continue normal monitoring |
| 30-49 | MEDIUM | Monitor closely, additional verification |
| 50-69 | HIGH | Enhanced monitoring, review transactions |
| 70-100 | CRITICAL | Immediate action, suspend transactions |

---

## AI Model Integration

The system includes placeholders for AI model integration. You can connect to:

### Option 1: Python ML Service (Recommended)
```python
# Flask/FastAPI service example
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)
model = joblib.load('fraud_model.pkl')

@app.route('/predict/partenaire', methods=['POST'])
def predict_partenaire():
    data = request.json
    features = extract_features(data)
    prediction = model.predict([features])
    confidence = model.predict_proba([features]).max()
    
    return jsonify({
        'prediction': prediction[0],
        'confidence': float(confidence)
    })
```

Update `FraudDetectionService.callAIModel()`:
```java
private AIModelResult callAIModel(Partenaire partenaire, List<PartenaireFond> commitments) {
    RestTemplate restTemplate = new RestTemplate();
    String url = "http://localhost:5000/predict/partenaire";
    
    Map<String, Object> request = new HashMap<>();
    request.put("partenaireId", partenaire.getIdPartenaire());
    request.put("defaultRate", calculateDefaultRate(commitments));
    request.put("avgCommitment", calculateAvgCommitment(commitments));
    request.put("commitmentCount", commitments.size());
    
    ResponseEntity<AIModelResult> response = restTemplate.postForEntity(
        url, request, AIModelResult.class
    );
    
    return response.getBody();
}
```

### Option 2: TensorFlow Java
```xml
<dependency>
    <groupId>org.tensorflow</groupId>
    <artifactId>tensorflow-core-platform</artifactId>
    <version>0.5.0</version>
</dependency>
```

### Option 3: AWS SageMaker
```java
AmazonSageMakerRuntime client = AmazonSageMakerRuntimeClientBuilder.defaultClient();
InvokeEndpointRequest request = new InvokeEndpointRequest()
    .withEndpointName("fraud-detection-endpoint")
    .withBody(ByteBuffer.wrap(jsonData.getBytes()));
InvokeEndpointResult result = client.invokeEndpoint(request);
```

### Option 4: Azure ML
```java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://your-endpoint.azureml.net/score"))
    .header("Authorization", "Bearer " + apiKey)
    .POST(HttpRequest.BodyPublishers.ofString(jsonData))
    .build();
```

---

## ML Model Features

Recommended features for training your fraud detection model:

### Partenaire Features
- Default rate (%)
- Average commitment amount
- Total commitments count
- Late payment rate (%)
- Days since last activity
- Activity frequency (commitments per month)
- Partenaire type (encoded)
- Partenaire status (encoded)

### Commitment Features
- Commitment amount
- Days since commitment
- Partenaire default history
- Fond utilization rate
- Payment delay (if paid)
- Commitment to fond ratio

### Training Data
```python
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# Prepare training data
features = [
    'default_rate', 'avg_commitment', 'commitment_count',
    'late_payment_rate', 'days_inactive', 'activity_frequency'
]

X = df[features]
y = df['is_fraud']  # 0 or 1

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# Save model
import joblib
joblib.dump(model, 'fraud_model.pkl')
```

---

## Usage Examples

### Example 1: Check Specific Partenaire
```
GET http://localhost:8083/api/fraud-detection/partner/4
```

### Example 2: Daily Fraud Scan
```
GET http://localhost:8083/api/fraud-detection/scan-all
```

### Example 3: Critical Alerts Dashboard
```
GET http://localhost:8083/api/fraud-detection/critical-alerts
```

### Example 4: Monitor High-Risk Entities
```
GET http://localhost:8083/api/fraud-detection/high-risk
```

---

## Integration with Existing APIs

You can trigger fraud detection automatically:

1. **After creating commitment**:
```java
@PostMapping
public ResponseEntity<PartenaireFond> createPartenaireFond(@RequestBody PartenaireFond pf) {
    PartenaireFond saved = service.save(pf);
    
    // Trigger fraud detection
    FraudDetectionResult fraud = fraudService.detectCommitmentFraud(saved.getId());
    if (fraud.getRiskScore() > 70) {
        // Send alert, log, or reject
    }
    
    return ResponseEntity.ok(saved);
}
```

2. **Scheduled daily scan**:
```java
@Scheduled(cron = "0 0 2 * * *") // 2 AM daily
public void dailyFraudScan() {
    List<FraudDetectionResult> results = fraudService.scanAllForFraud();
    // Send email alerts for high-risk entities
}
```

---

## Best Practices

1. **Regular Scans**: Run daily fraud scans during off-peak hours
2. **Alert Thresholds**: Configure alerts for risk scores > 50
3. **Model Updates**: Retrain AI model monthly with new data
4. **Manual Review**: Always have human review for CRITICAL alerts
5. **Logging**: Log all fraud detection results for audit trail
6. **False Positives**: Track and adjust rules to reduce false positives

---

## Future Enhancements

1. **Real-time Detection**: WebSocket alerts for immediate fraud detection
2. **Machine Learning**: Train custom models on your historical data
3. **Behavioral Analysis**: Track partner behavior patterns over time
4. **Network Analysis**: Detect fraud rings and connected entities
5. **External Data**: Integrate credit scores, blacklists, sanctions lists
