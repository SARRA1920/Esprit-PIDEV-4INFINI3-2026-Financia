"""
Interactive ML Fraud Verification Tool
Test your partenaires directly with the ML service
"""

import requests
import json
import sys

def get_partenaire_data(partenaire_id):
    """Get partenaire data from Java API"""
    try:
        # Get partenaire info
        response = requests.get(f"http://localhost:8083/api/partenaires/{partenaire_id}")
        if response.status_code != 200:
            print(f"❌ Partenaire {partenaire_id} not found")
            return None
        
        partenaire = response.json()
        
        # Get commitments
        response = requests.get(f"http://localhost:8083/api/partenaire-fonds")
        all_commitments = response.json()
        
        commitments = [c for c in all_commitments if c.get('partenaire', {}).get('idPartenaire') == partenaire_id]
        
        return partenaire, commitments
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return None

def verify_with_ml(partenaire_id):
    """Verify partenaire fraud using ML service"""
    
    print("="*80)
    print(f"ML FRAUD VERIFICATION - Partenaire ID {partenaire_id}")
    print("="*80)
    
    # Get data
    data = get_partenaire_data(partenaire_id)
    if not data:
        return
    
    partenaire, commitments = data
    
    # Display partenaire info
    print(f"\n📋 PARTENAIRE INFORMATION:")
    print(f"   Name: {partenaire['name']}")
    print(f"   Type: {partenaire['type']}")
    print(f"   Email: {partenaire.get('email', 'N/A')}")
    print(f"   Status: {partenaire.get('status', 'N/A')}")
    print(f"   Created: {partenaire.get('createdAt', 'N/A')}")
    print(f"   Total Commitments: {len(commitments)}")
    
    if len(commitments) == 0:
        print("\n⚠️  No commitments found. ML prediction may not be accurate.")
        print("   Creating default prediction based on account info only...")
    
    # Prepare ML request
    ml_commitments = []
    defaulted_count = 0
    paid_count = 0
    late_count = 0
    
    for c in commitments:
        status = c.get('commitmentStatus', 'PENDING')
        payment_date = c.get('paymentDate')
        
        if status == 'DEFAULTED':
            defaulted_count += 1
        if payment_date:
            paid_count += 1
            # Check if late (simplified)
            if c.get('paymentDueDate'):
                late_count += 1
        
        ml_commitments.append({
            "amount": c.get('committedAmount', 0),
            "status": status,
            "paymentDate": payment_date,
            "daysLate": 0  # Simplified
        })
    
    # Calculate activity metrics
    from datetime import datetime
    created_date = partenaire.get('createdAt')
    if created_date:
        try:
            created = datetime.strptime(created_date, '%Y-%m-%d')
            today = datetime.now()
            days_inactive = (today - created).days
        except:
            days_inactive = 30
    else:
        days_inactive = 30
    
    activity_frequency = len(commitments) / max(days_inactive, 1)
    
    ml_request = {
        "commitments": ml_commitments,
        "daysInactive": days_inactive,
        "activityFrequency": activity_frequency
    }
    
    # Call ML service
    print(f"\n🤖 CALLING ML SERVICE...")
    print(f"   Endpoint: http://localhost:5000/predict/partenaire")
    
    try:
        response = requests.post("http://localhost:5000/predict/partenaire", json=ml_request)
        
        if response.status_code == 200:
            ml_result = response.json()
            
            print(f"\n✅ ML PREDICTION RESULTS:")
            print("="*80)
            
            # Risk prediction
            prediction = ml_result['prediction']
            confidence = ml_result['confidence']
            
            risk_symbol = "🔴" if prediction == "CRITICAL_RISK" else "🟠" if prediction == "HIGH_RISK" else "🟡" if prediction == "MEDIUM_RISK" else "🟢"
            
            print(f"\n{risk_symbol} RISK LEVEL: {prediction}")
            print(f"   Confidence: {confidence:.1%}")
            
            # Probabilities
            print(f"\n📊 PROBABILITY BREAKDOWN:")
            probs = ml_result['probabilities']
            print(f"   🟢 Low Risk:      {probs['low']:.1%}")
            print(f"   🟡 Medium Risk:   {probs['medium']:.1%}")
            print(f"   🟠 High Risk:     {probs['high']:.1%}")
            print(f"   🔴 Critical Risk: {probs['critical']:.1%}")
            
            # Features used
            print(f"\n🔍 FEATURES ANALYZED:")
            features = ml_result['features']
            print(f"   Default Rate:        {features['default_rate']:.1f}%")
            print(f"   Avg Commitment:      {features['avg_commitment']:,.2f}")
            print(f"   Commitment Count:    {int(features['commitment_count'])}")
            print(f"   Late Payment Rate:   {features['late_payment_rate']:.1f}%")
            print(f"   Days Inactive:       {int(features['days_inactive'])}")
            print(f"   Activity Frequency:  {features['activity_frequency']:.2f} commitments/day")
            
            # Interpretation
            print(f"\n💡 INTERPRETATION:")
            if prediction == "CRITICAL_RISK":
                print("   ⚠️  CRITICAL: Immediate action required!")
                print("   - High probability of fraud or default")
                print("   - Recommend: Freeze new commitments, investigate thoroughly")
            elif prediction == "HIGH_RISK":
                print("   ⚠️  HIGH RISK: Close monitoring needed")
                print("   - Significant fraud indicators detected")
                print("   - Recommend: Enhanced due diligence, limit exposure")
            elif prediction == "MEDIUM_RISK":
                print("   ⚠️  MEDIUM RISK: Monitor closely")
                print("   - Some concerning patterns detected")
                print("   - Recommend: Regular monitoring, verify new commitments")
            else:
                print("   ✅ LOW RISK: Normal operations")
                print("   - No significant fraud indicators")
                print("   - Recommend: Standard monitoring procedures")
            
            # Compare with Java rule-based
            print(f"\n🔄 COMPARING WITH RULE-BASED DETECTION...")
            java_response = requests.get(f"http://localhost:8083/api/fraud-detection/partenaire/{partenaire_id}")
            
            if java_response.status_code == 200:
                java_result = java_response.json()
                print(f"\n   Java Rule-Based: {java_result['riskLevel']} (Score: {java_result['riskScore']})")
                print(f"   ML Prediction:   {prediction} (Confidence: {confidence:.1%})")
                
                if java_result['riskLevel'] == prediction.replace('_RISK', ''):
                    print(f"   ✅ Both systems agree!")
                else:
                    print(f"   ⚠️  Systems disagree - manual review recommended")
                
                if java_result['anomalies']:
                    print(f"\n   Rule-Based Anomalies Detected:")
                    for anomaly in java_result['anomalies']:
                        print(f"      - {anomaly['type']}: {anomaly['description']}")
            
        else:
            print(f"❌ ML Service Error: {response.status_code}")
            print(response.text)
    
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to ML service!")
        print("   Make sure the ML service is running on http://localhost:5000")
        print("   Start it with: cd ml-service && python app.py")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "="*80)

def list_partenaires():
    """List all partenaires"""
    try:
        response = requests.get("http://localhost:8083/api/partenaires")
        partenaires = response.json()
        
        print("\n📋 AVAILABLE PARTENAIRES:")
        print("="*80)
        for p in partenaires:
            print(f"   ID {p['idPartenaire']}: {p['name']} ({p['type']}) - {p.get('email', 'No email')}")
        print("="*80)
        
        return partenaires
    except Exception as e:
        print(f"❌ Error fetching partenaires: {e}")
        return []

def main():
    """Main interactive loop"""
    print("\n" + "="*80)
    print("🤖 ML FRAUD VERIFICATION TOOL")
    print("="*80)
    
    # Check if ML service is running
    try:
        response = requests.get("http://localhost:5000/health")
        if response.status_code == 200:
            print("✅ ML Service: ONLINE")
        else:
            print("⚠️  ML Service: UNHEALTHY")
    except:
        print("❌ ML Service: OFFLINE")
        print("   Start it with: cd ml-service && python app.py")
        return
    
    # Check if Java API is running
    try:
        response = requests.get("http://localhost:8083/api/partenaires")
        if response.status_code == 200:
            print("✅ Java API: ONLINE")
        else:
            print("⚠️  Java API: UNHEALTHY")
    except:
        print("❌ Java API: OFFLINE")
        print("   Start it with: ./mvnw spring-boot:run")
        return
    
    while True:
        print("\n" + "="*80)
        print("OPTIONS:")
        print("  1. List all partenaires")
        print("  2. Verify specific partenaire")
        print("  3. Scan all partenaires")
        print("  4. Exit")
        print("="*80)
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == "1":
            list_partenaires()
        
        elif choice == "2":
            partenaire_id = input("\nEnter Partenaire ID: ").strip()
            try:
                partenaire_id = int(partenaire_id)
                verify_with_ml(partenaire_id)
            except ValueError:
                print("❌ Invalid ID. Please enter a number.")
        
        elif choice == "3":
            partenaires = list_partenaires()
            if partenaires:
                print("\n🔍 SCANNING ALL PARTENAIRES...")
                for p in partenaires:
                    verify_with_ml(p['idPartenaire'])
                    input("\nPress Enter to continue to next partenaire...")
        
        elif choice == "4":
            print("\n👋 Goodbye!")
            break
        
        else:
            print("❌ Invalid choice. Please enter 1-4.")

if __name__ == "__main__":
    # Check if partenaire ID provided as argument
    if len(sys.argv) > 1:
        try:
            partenaire_id = int(sys.argv[1])
            verify_with_ml(partenaire_id)
        except ValueError:
            print("❌ Invalid partenaire ID")
    else:
        main()
