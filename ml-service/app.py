from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for Java backend

# Initialize or load model
MODEL_PATH = 'fraud_model.pkl'

def create_default_model():
    """Create a pre-trained model with sample data"""
    # Sample training data (features: default_rate, avg_commitment, commitment_count, late_payment_rate, days_inactive, activity_frequency)
    X_train = np.array([
        [5, 50000, 10, 10, 30, 0.5],   # Low risk
        [10, 45000, 8, 15, 45, 0.4],   # Low risk
        [15, 60000, 12, 20, 20, 0.6],  # Low risk
        [25, 55000, 9, 25, 60, 0.3],   # Medium risk
        [35, 70000, 15, 30, 90, 0.2],  # Medium risk
        [40, 80000, 20, 35, 120, 0.15],# High risk
        [50, 90000, 18, 45, 150, 0.1], # High risk
        [60, 100000, 25, 55, 180, 0.05],# Critical risk
        [70, 120000, 30, 65, 200, 0.02],# Critical risk
        [80, 150000, 35, 75, 250, 0.01] # Critical risk
    ])
    
    # Labels: 0 = low risk, 1 = medium risk, 2 = high risk, 3 = critical risk
    y_train = np.array([0, 0, 0, 1, 1, 2, 2, 3, 3, 3])
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    return model

# Load or create model
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("Loaded existing model")
else:
    model = create_default_model()
    joblib.dump(model, MODEL_PATH)
    print("Created new model")

def extract_partenaire_features(data):
    """Extract features from partenaire data"""
    commitments = data.get('commitments', [])
    
    if not commitments:
        # New partenaire - return neutral features
        return np.array([[0, 0, 0, 0, 0, 0]])
    
    # Calculate features
    total_commitments = len(commitments)
    
    # Default rate
    defaulted = sum(1 for c in commitments if c.get('status') == 'DEFAULTED')
    default_rate = (defaulted / total_commitments * 100) if total_commitments > 0 else 0
    
    # Average commitment amount
    amounts = [c.get('amount', 0) for c in commitments]
    avg_commitment = np.mean(amounts) if amounts else 0
    
    # Late payment rate
    late_payments = sum(1 for c in commitments if c.get('daysLate', 0) > 60)
    paid_count = sum(1 for c in commitments if c.get('paymentDate') is not None)
    late_payment_rate = (late_payments / paid_count * 100) if paid_count > 0 else 0
    
    # Days inactive (placeholder - would need actual dates)
    days_inactive = data.get('daysInactive', 30)
    
    # Activity frequency (commitments per month)
    activity_frequency = data.get('activityFrequency', 0.5)
    
    features = np.array([[
        default_rate,
        avg_commitment,
        total_commitments,
        late_payment_rate,
        days_inactive,
        activity_frequency
    ]])
    
    return features

def extract_commitment_features(data):
    """Extract features from commitment data"""
    # Features: commitment_amount, days_since_commitment, partner_default_count, fund_utilization, payment_delay
    commitment_amount = data.get('commitmentAmount', 0)
    days_since_commitment = data.get('daysSinceCommitment', 0)
    partner_default_count = data.get('partnerDefaultCount', 0)
    fund_utilization = data.get('fundUtilization', 0)
    payment_delay = data.get('paymentDelay', 0)
    
    features = np.array([[
        commitment_amount / 10000,  # Normalize
        days_since_commitment,
        partner_default_count,
        fund_utilization,
        payment_delay
    ]])
    
    return features

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'version': '1.0.0'
    })

@app.route('/predict/partenaire', methods=['POST'])
def predict_partenaire():
    """Predict fraud risk for a partenaire"""
    try:
        data = request.json
        
        # Extract features
        features = extract_partenaire_features(data)
        
        # Make prediction
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        confidence = float(np.max(probabilities))
        
        # Map prediction to risk level
        risk_levels = ['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL_RISK']
        risk_level = risk_levels[prediction]
        
        return jsonify({
            'prediction': risk_level,
            'confidence': confidence,
            'probabilities': {
                'low': float(probabilities[0]),
                'medium': float(probabilities[1]) if len(probabilities) > 1 else 0,
                'high': float(probabilities[2]) if len(probabilities) > 2 else 0,
                'critical': float(probabilities[3]) if len(probabilities) > 3 else 0
            },
            'features': {
                'default_rate': float(features[0][0]),
                'avg_commitment': float(features[0][1]),
                'commitment_count': int(features[0][2]),
                'late_payment_rate': float(features[0][3]),
                'days_inactive': int(features[0][4]),
                'activity_frequency': float(features[0][5])
            }
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'prediction': 'MEDIUM_RISK',
            'confidence': 0.5
        }), 500

@app.route('/predict/commitment', methods=['POST'])
def predict_commitment():
    """Predict fraud risk for a commitment"""
    try:
        data = request.json
        
        # For commitments, use simpler rule-based approach
        commitment_amount = data.get('commitmentAmount', 0)
        days_overdue = data.get('daysOverdue', 0)
        partner_defaults = data.get('partnerDefaultCount', 0)
        
        # Calculate risk score
        risk_score = 0
        if days_overdue > 90:
            risk_score += 30
        elif days_overdue > 60:
            risk_score += 20
        
        if partner_defaults > 0:
            risk_score += 25
        
        if commitment_amount > data.get('fundCapacity', 0) * 0.8:
            risk_score += 15
        
        # Determine risk level
        if risk_score >= 70:
            risk_level = 'CRITICAL_RISK'
            confidence = 0.9
        elif risk_score >= 50:
            risk_level = 'HIGH_RISK'
            confidence = 0.8
        elif risk_score >= 30:
            risk_level = 'MEDIUM_RISK'
            confidence = 0.7
        else:
            risk_level = 'LOW_RISK'
            confidence = 0.75
        
        return jsonify({
            'prediction': risk_level,
            'confidence': confidence,
            'risk_score': risk_score
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'prediction': 'MEDIUM_RISK',
            'confidence': 0.5
        }), 500

@app.route('/train', methods=['POST'])
def train_model():
    """Retrain model with new data"""
    try:
        data = request.json
        X = np.array(data.get('features', []))
        y = np.array(data.get('labels', []))
        
        if len(X) == 0 or len(y) == 0:
            return jsonify({'error': 'No training data provided'}), 400
        
        global model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X, y)
        
        # Save model
        joblib.dump(model, MODEL_PATH)
        
        return jsonify({
            'status': 'success',
            'message': f'Model trained with {len(X)} samples',
            'accuracy': float(model.score(X, y))
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting Fraud Detection ML Service...")
    print("Model loaded and ready")
    app.run(host='0.0.0.0', port=5000, debug=True)
