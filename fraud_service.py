#!/usr/bin/env python3
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import logging
from datetime import datetime
import json

#  Configure logging FIRST
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "fraud-detection"}), 200

@app.route('/fraud', methods=['POST'])
def fraud():
    try:
        if not request.is_json:
            logger.warning("Invalid Content-Type")
            return jsonify({"error": "Content-Type must be application/json"}), 415

        raw_body = request.get_data(as_text=True) or ""
        try:
            data = json.loads(raw_body)
        except json.JSONDecodeError as exc:
            logger.warning(f"Invalid JSON body: {exc.msg} at pos {exc.pos}")
            return jsonify({
                "error": "Invalid JSON body",
                "details": f"{exc.msg} at position {exc.pos}",
            }), 400

        if not isinstance(data, dict):
            logger.warning(f"Invalid JSON body type: {type(data).__name__}")
            return jsonify({"error": "Invalid JSON body (expected an object)"}), 400

        # SAFE LOGGING (no arbitrary code execution)
        history_list = data.get('history', [])
        if history_list is None:
            history_list = []
        if not isinstance(history_list, list):
            logger.warning(f"Invalid history type: {type(history_list).__name__}")
            return jsonify({"error": "history must be an array"}), 400

        safe_data = {
            'accountId': data.get('accountId', 'unknown'),
            'amount': data.get('transaction', {}).get('amount', 0),
            'history_count': len(history_list),
            'type': data.get('transaction', {}).get('type', 'unknown')
        }
        logger.info(f"Processing fraud request: {safe_data}")

        # 🛡 INPUT VALIDATION
        tx_data = data.get('transaction', {})
        if not tx_data or 'amount' not in tx_data:
            logger.warning("Missing transaction.amount")
            return jsonify({"error": "Missing transaction.amount"}), 400

        try:
            tx_amount = float(tx_data['amount'])
            if tx_amount < 0:
                return jsonify({"error": "Amount cannot be negative"}), 400
        except (ValueError, TypeError):
            logger.warning(f"Invalid amount: {tx_data.get('amount')}")
            return jsonify({"error": "Invalid amount format"}), 400

        #  ML ANALYSIS
        history = history_list
        amounts = []
        for h in history:
            if not isinstance(h, dict):
                continue
            try:
                amt = float(h.get('amount', 0))
                if amt >= 0:
                    amounts.append(amt)
            except (ValueError, TypeError):
                continue  # Skip invalid history entries

        if len(amounts) >= 3:
            mean_amt = np.mean(amounts)
            std_amt = np.std(amounts)
            z_score = abs(tx_amount - mean_amt) / max(std_amt, 1e-6)
            anomaly_score = min(100.0, z_score * 15)

            reasons = []
            if anomaly_score > 70:
                reasons.append("Amount deviates significantly from history")
            if tx_data.get('type') == "WITHDRAWAL" and tx_amount > mean_amt * 0.8:
                reasons.append("Suspicious large withdrawal")

            risk_level = "HIGH" if anomaly_score >= 70 else "LOW"
        else:
            anomaly_score = 30.0
            reasons = ["Insufficient history (<3 valid deposits)"]
            risk_level = "LOW"

        logger.info(f"Fraud analysis complete: score={anomaly_score:.2f}, risk={risk_level}, reasons={len(reasons)}")

        return jsonify({
            'score': round(float(anomaly_score), 2),
            'isHighRisk': anomaly_score >= 70,
            'riskLevel': risk_level,
            'reasons': reasons
        })

    except Exception as e:
        logger.error(f" Unexpected error in /fraud: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@app.route('/metrics', methods=['GET'])
def metrics():
    """Simple metrics endpoint"""
    return jsonify({
        "uptime": "running",
        "requests_processed": "live",
        "timestamp": datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    logger.info(" Starting Fraud Detection Service on http://0.0.0.0:5001")
    logger.info(" Health: http://localhost:5001/health")
    app.run(host='0.0.0.0', port=5001, debug=False)  # debug=False in production