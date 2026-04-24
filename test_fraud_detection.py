"""
Test fraud detection for existing partenaire
"""

import requests
import json

# Test partenaire ID 6 - Suspicious Investment Corp
partenaire_id = 6

print("="*70)
print(f"FRAUD DETECTION TEST - Partenaire ID {partenaire_id}")
print("="*70)

# Get partenaire data from Java API
java_api = f"http://localhost:8083/api/fraud-detection/partenaire/{partenaire_id}"
response = requests.get(java_api)

print("\n1. JAVA RULE-BASED DETECTION:")
print("-" * 70)
if response.status_code == 200:
    result = response.json()
    print(f"Entity: {result['entityName']}")
    print(f"Risk Score: {result['riskScore']}")
    print(f"Risk Level: {result['riskLevel']}")
    print(f"AI Prediction: {result.get('aiModelPrediction', 'N/A')}")
    print(f"AI Confidence: {result.get('aiConfidence', 'N/A')}")
    print(f"\nAnomalies Detected:")
    for anomaly in result['anomalies']:
        print(f"  - {anomaly['type']}: {anomaly['description']} (Score: {anomaly['score']})")
    print(f"\nRecommendation: {result['recommendation']}")
    
    java_result = result  # Save for later
else:
    print(f"Error: {response.status_code}")
    print(response.text)
    java_result = None

# Get debug info
debug_api = f"http://localhost:8083/api/fraud-detection/partenaire/{partenaire_id}/debug"
response = requests.get(debug_api)

print("\n2. DETAILED DEBUG INFO:")
print("-" * 70)
if response.status_code == 200:
    debug = response.json()
    print(f"Total Commitments: {debug['totalCommitments']}")
    print(f"Defaulted: {debug['defaultedCommitments']} ({debug['defaultRate']:.1f}%)")
    print(f"Average Commitment: {debug['avgCommitment']:.2f}")
    print(f"Max Commitment: {debug['maxCommitment']:.2f}")
    print(f"Recent Commitments (7 days): {debug['recentCommitments']}")
    print(f"Account Age: {debug['accountAgeDays']} days")
    
    print("\nRule Evaluation:")
    for rule, result in debug['ruleResults'].items():
        print(f"  {rule}: {result}")

# Test with ML service
print("\n3. ML SERVICE PREDICTION:")
print("-" * 70)

# Prepare data for ML service
ml_request = {
    "commitments": [
        {
            "amount": c['amount'],
            "status": c['status'],
            "paymentDate": c['paymentDate'],
            "daysLate": 0 if c['paymentDate'] else 0
        }
        for c in debug['commitments']
    ],
    "daysInactive": debug['accountAgeDays'],
    "activityFrequency": debug['totalCommitments'] / max(debug['accountAgeDays'], 1)
}

ml_api = "http://localhost:5000/predict/partenaire"
response = requests.post(ml_api, json=ml_request)

if response.status_code == 200:
    ml_result = response.json()
    print(f"ML Prediction: {ml_result['prediction']}")
    print(f"ML Confidence: {ml_result['confidence']:.2%}")
    print(f"\nProbabilities:")
    for level, prob in ml_result['probabilities'].items():
        print(f"  {level.upper()}: {prob:.2%}")
    print(f"\nFeatures Used:")
    for feature, value in ml_result['features'].items():
        print(f"  {feature}: {value}")
else:
    print(f"ML Service Error: {response.status_code}")
    print(response.text)

    print("\n" + "="*70)
    print("FINAL ASSESSMENT")
    print("="*70)
    if java_result:
        print(f"Java Rule-Based: {java_result['riskLevel']} (Score: {java_result['riskScore']})")
        print(f"ML Prediction: {ml_result['prediction']} (Confidence: {ml_result['confidence']:.2%})")
        print(f"\nRecommendation: {java_result['recommendation']}")
    print("="*70)
