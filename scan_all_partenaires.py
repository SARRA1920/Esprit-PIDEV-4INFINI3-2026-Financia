"""
Scan all partenaires for fraud and generate a report
"""

import requests
import json

print("="*80)
print("FRAUD DETECTION SCAN - ALL PARTENAIRES")
print("="*80)

# Get all partenaires
response = requests.get("http://localhost:8083/api/partenaires")
data = response.json()

# Handle different response formats
if isinstance(data, dict) and 'value' in data:
    partenaires = data['value']
elif isinstance(data, list):
    partenaires = data
else:
    print("❌ Unexpected API response format")
    print(f"Response: {data}")
    exit(1)

print(f"\nTotal Partenaires: {len(partenaires)}\n")

# Scan each partenaire
results = []
for p in partenaires:
    try:
        partenaire_id = p['idPartenaire']
        name = p['name']
    except (KeyError, TypeError) as e:
        print(f"⚠️  Skipping invalid partenaire data: {p}")
        continue
    
    # Get fraud detection result
    fraud_response = requests.get(f"http://localhost:8083/api/fraud-detection/partenaire/{partenaire_id}")
    
    if fraud_response.status_code == 200:
        fraud_data = fraud_response.json()
        results.append({
            'id': partenaire_id,
            'name': name,
            'email': p.get('email', 'N/A'),
            'type': p['type'],
            'riskScore': fraud_data['riskScore'],
            'riskLevel': fraud_data['riskLevel'],
            'anomalyCount': len(fraud_data['anomalies']),
            'anomalies': fraud_data['anomalies']
        })

# Sort by risk score (highest first)
results.sort(key=lambda x: x['riskScore'], reverse=True)

# Print results
print("="*80)
print("FRAUD DETECTION RESULTS (Sorted by Risk Score)")
print("="*80)

for r in results:
    risk_symbol = "🔴" if r['riskLevel'] == "CRITICAL" else "🟠" if r['riskLevel'] == "HIGH" else "🟡" if r['riskLevel'] == "MEDIUM" else "🟢"
    
    print(f"\n{risk_symbol} ID {r['id']}: {r['name']}")
    print(f"   Email: {r['email']}")
    print(f"   Type: {r['type']}")
    print(f"   Risk Score: {r['riskScore']} | Level: {r['riskLevel']}")
    
    if r['anomalyCount'] > 0:
        print(f"   Anomalies ({r['anomalyCount']}):")
        for anomaly in r['anomalies']:
            print(f"      - {anomaly['type']}: {anomaly['description']}")
    else:
        print(f"   No anomalies detected")

# Summary statistics
print("\n" + "="*80)
print("SUMMARY STATISTICS")
print("="*80)

critical = sum(1 for r in results if r['riskLevel'] == 'CRITICAL')
high = sum(1 for r in results if r['riskLevel'] == 'HIGH')
medium = sum(1 for r in results if r['riskLevel'] == 'MEDIUM')
low = sum(1 for r in results if r['riskLevel'] == 'LOW')

print(f"🔴 CRITICAL Risk: {critical}")
print(f"🟠 HIGH Risk: {high}")
print(f"🟡 MEDIUM Risk: {medium}")
print(f"🟢 LOW Risk: {low}")

print(f"\nTotal Partenaires Scanned: {len(results)}")
print(f"Partenaires with Anomalies: {sum(1 for r in results if r['anomalyCount'] > 0)}")
print(f"Average Risk Score: {sum(r['riskScore'] for r in results) / len(results):.2f}")

# High risk partenaires
high_risk = [r for r in results if r['riskLevel'] in ['HIGH', 'CRITICAL']]
if high_risk:
    print(f"\n⚠️  ACTION REQUIRED: {len(high_risk)} high-risk partenaires need immediate review!")
    for r in high_risk:
        print(f"   - ID {r['id']}: {r['name']} (Score: {r['riskScore']})")

print("="*80)
