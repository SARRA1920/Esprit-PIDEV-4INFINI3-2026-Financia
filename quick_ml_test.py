"""
Quick ML Test - Test any partenaire ID
Usage: python quick_ml_test.py <partenaire_id>
"""

import requests
import sys

if len(sys.argv) < 2:
    print("Usage: python quick_ml_test.py <partenaire_id>")
    print("\nExample: python quick_ml_test.py 6")
    sys.exit(1)

partenaire_id = int(sys.argv[1])

print(f"\n{'='*70}")
print(f"TESTING PARTENAIRE ID {partenaire_id}")
print(f"{'='*70}\n")

# 1. Get partenaire info
print("1️⃣  Fetching partenaire data...")
response = requests.get(f"http://localhost:8083/api/partenaires/{partenaire_id}")
if response.status_code != 200:
    print(f"❌ Partenaire not found!")
    sys.exit(1)

partenaire = response.json()
print(f"✅ Found: {partenaire['name']} ({partenaire['type']})")
print(f"   Email: {partenaire.get('email', 'N/A')}")

# 2. Get commitments
print("\n2️⃣  Fetching commitments...")
response = requests.get("http://localhost:8083/api/partenaire-fonds")
all_commitments = response.json()
commitments = [c for c in all_commitments if c.get('partenaire', {}).get('idPartenaire') == partenaire_id]
print(f"✅ Found {len(commitments)} commitments")

# 3. Prepare ML data
print("\n3️⃣  Preparing ML request...")
ml_data = {
    "commitments": [
        {
            "amount": c.get('committedAmount', 0),
            "status": c.get('commitmentStatus', 'PENDING'),
            "paymentDate": c.get('paymentDate'),
            "daysLate": 0
        }
        for c in commitments
    ],
    "daysInactive": 1,
    "activityFrequency": len(commitments)
}

print(f"✅ Prepared data with {len(ml_data['commitments'])} commitments")

# 4. Call ML service
print("\n4️⃣  Calling ML service...")
response = requests.post("http://localhost:5000/predict/partenaire", json=ml_data)

if response.status_code == 200:
    result = response.json()
    
    print(f"\n{'='*70}")
    print("ML PREDICTION RESULT")
    print(f"{'='*70}")
    
    prediction = result['prediction']
    confidence = result['confidence']
    
    # Risk symbol
    if prediction == "CRITICAL_RISK":
        symbol = "🔴"
        color = "CRITICAL"
    elif prediction == "HIGH_RISK":
        symbol = "🟠"
        color = "HIGH"
    elif prediction == "MEDIUM_RISK":
        symbol = "🟡"
        color = "MEDIUM"
    else:
        symbol = "🟢"
        color = "LOW"
    
    print(f"\n{symbol} RISK: {color}")
    print(f"   Confidence: {confidence:.1%}")
    
    print(f"\n📊 Probabilities:")
    for level, prob in result['probabilities'].items():
        bar_length = int(prob * 50)
        bar = "█" * bar_length
        print(f"   {level:8s} [{bar:<50s}] {prob:.1%}")
    
    print(f"\n🔍 Features:")
    features = result['features']
    print(f"   Default Rate:       {features['default_rate']:.1f}%")
    print(f"   Avg Commitment:     {features['avg_commitment']:,.2f}")
    print(f"   Total Commitments:  {int(features['commitment_count'])}")
    print(f"   Late Payment Rate:  {features['late_payment_rate']:.1f}%")
    
    # 5. Compare with Java
    print(f"\n5️⃣  Comparing with Java rule-based detection...")
    response = requests.get(f"http://localhost:8083/api/fraud-detection/partenaire/{partenaire_id}")
    
    if response.status_code == 200:
        java_result = response.json()
        
        print(f"\n{'='*70}")
        print("COMPARISON")
        print(f"{'='*70}")
        print(f"Java Rule-Based:  {java_result['riskLevel']:8s} (Score: {java_result['riskScore']})")
        print(f"ML Prediction:    {color:8s} (Confidence: {confidence:.1%})")
        
        if java_result['riskLevel'] == color:
            print(f"\n✅ AGREEMENT: Both systems agree on {color} risk")
        else:
            print(f"\n⚠️  DISAGREEMENT: Manual review recommended")
            print(f"\n   Why they might disagree:")
            print(f"   - ML uses probabilistic model, rules use thresholds")
            print(f"   - ML considers feature combinations, rules check individual metrics")
            print(f"   - ML needs more training data for better accuracy")
        
        if java_result['anomalies']:
            print(f"\n   Rule-Based Anomalies:")
            for anomaly in java_result['anomalies']:
                print(f"      • {anomaly['type']}: {anomaly['description']}")
    
    print(f"\n{'='*70}")
    
else:
    print(f"❌ ML Service Error: {response.status_code}")
    print(response.text)
