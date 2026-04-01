# Create Fraud Test Data

This guide helps you create test data that will trigger fraud detection alerts.

---

## Scenario 1: High Default Rate Partenaire

### Step 1: Create a Partenaire
```
POST http://localhost:8083/api/partenaires
Content-Type: application/json

{
  "name": "Suspicious Bank Ltd",
  "type": "BANK",
  "status": "ACTIVE",
  "contactInfo": "fraud@test.com"
}
```

Save the returned `idPartenaire` (e.g., 100)

### Step 2: Create a Fond
```
POST http://localhost:8083/api/fonds
Content-Type: application/json

{
  "name": "Test Fund for Fraud",
  "amount": 1000000.0,
  "description": "Test fund"
}
```

Save the returned `idFond` (e.g., 50)

### Step 3: Create Multiple Commitments with Defaults
```
POST http://localhost:8083/api/partenaire-fonds
Content-Type: application/json

{
  "partenaire": {"idPartenaire": 100},
  "fond": {"idFond": 50},
  "committedAmount": 50000.0,
  "commitmentDate": "2026-01-15",
  "commitmentStatus": "DEFAULTED"
}
```

Repeat 3 times with DEFAULTED status, then create 2 more with COMMITTED status.

This creates a 60% default rate (3 out of 5) which triggers HIGH_DEFAULT_RATE alert (30 points).

---

## Scenario 2: Overdue Payments

### Create Commitment with Old Date
```
POST http://localhost:8083/api/partenaire-fonds
Content-Type: application/json

{
  "partenaire": {"idPartenaire": 100},
  "fond": {"idFond": 50},
  "committedAmount": 75000.0,
  "commitmentDate": "2025-10-01",
  "commitmentStatus": "COMMITTED"
}
```

This commitment is 180+ days old without payment, triggering LONG_OVERDUE alert (30 points).

---

## Scenario 3: Rapid Commitments

### Create 6+ Commitments in Last 7 Days
```
POST http://localhost:8083/api/partenaire-fonds
Content-Type: application/json

{
  "partenaire": {"idPartenaire": 100},
  "fond": {"idFond": 50},
  "committedAmount": 10000.0,
  "commitmentDate": "2026-03-30",
  "commitmentStatus": "COMMITTED"
}
```

Repeat 6 times with recent dates (2026-03-28 to 2026-04-01).

This triggers RAPID_COMMITMENTS alert (15 points).

---

## Scenario 4: Unusual Large Commitment

### Step 1: Create Normal Commitments
Create 3 commitments with amounts: 10000, 15000, 12000

### Step 2: Create Unusually Large Commitment
```
POST http://localhost:8083/api/partenaire-fonds
Content-Type: application/json

{
  "partenaire": {"idPartenaire": 100},
  "fond": {"idFond": 50},
  "committedAmount": 150000.0,
  "commitmentDate": "2026-04-01",
  "commitmentStatus": "COMMITTED"
}
```

This is 10x the average, triggering UNUSUAL_COMMITMENT_AMOUNT alert (20 points).

---

## Scenario 5: Late Payment Pattern

### Create Commitments with Late Payments
```
POST http://localhost:8083/api/partenaire-fonds
Content-Type: application/json

{
  "partenaire": {"idPartenaire": 100},
  "fond": {"idFond": 50},
  "committedAmount": 20000.0,
  "commitmentDate": "2025-11-01",
  "commitmentStatus": "PAID",
  "paymentDate": "2026-02-15",
  "paymentAmount": 20000.0
}
```

Create 3 commitments where payment is 70+ days after commitment date.

This triggers LATE_PAYMENT_PATTERN alert (20 points).

---

## Complete SQL Script for Quick Setup

```sql
-- Insert fraudulent partenaire
INSERT INTO partenaire (name, type, status, contact_info) 
VALUES ('Fraudulent Corp', 'PRIVATE_INVESTOR', 'ACTIVE', 'fraud@test.com');

SET @partenaire_id = LAST_INSERT_ID();

-- Insert test fond
INSERT INTO fond (name, amount, description, committed_amount) 
VALUES ('Fraud Test Fund', 1000000.0, 'Test fund for fraud detection', 0.0);

SET @fond_id = LAST_INSERT_ID();

-- Create 3 defaulted commitments (HIGH DEFAULT RATE)
INSERT INTO partenaire_fond (partenaire_id, fond_id, committed_amount, commitment_date, commitment_status)
VALUES 
(@partenaire_id, @fond_id, 50000.0, '2025-12-01', 'DEFAULTED'),
(@partenaire_id, @fond_id, 45000.0, '2025-12-15', 'DEFAULTED'),
(@partenaire_id, @fond_id, 55000.0, '2026-01-10', 'DEFAULTED');

-- Create 1 very old unpaid commitment (LONG OVERDUE)
INSERT INTO partenaire_fond (partenaire_id, fond_id, committed_amount, commitment_date, commitment_status)
VALUES (@partenaire_id, @fond_id, 80000.0, '2025-09-01', 'COMMITTED');

-- Create 6 recent commitments (RAPID COMMITMENTS)
INSERT INTO partenaire_fond (partenaire_id, fond_id, committed_amount, commitment_date, commitment_status)
VALUES 
(@partenaire_id, @fond_id, 10000.0, '2026-03-26', 'COMMITTED'),
(@partenaire_id, @fond_id, 12000.0, '2026-03-27', 'COMMITTED'),
(@partenaire_id, @fond_id, 11000.0, '2026-03-28', 'COMMITTED'),
(@partenaire_id, @fond_id, 13000.0, '2026-03-29', 'COMMITTED'),
(@partenaire_id, @fond_id, 15000.0, '2026-03-30', 'COMMITTED'),
(@partenaire_id, @fond_id, 14000.0, '2026-03-31', 'COMMITTED');

-- Create 1 unusually large commitment (UNUSUAL AMOUNT)
INSERT INTO partenaire_fond (partenaire_id, fond_id, committed_amount, commitment_date, commitment_status)
VALUES (@partenaire_id, @fond_id, 200000.0, '2026-04-01', 'COMMITTED');

-- Create 3 late payments (LATE PAYMENT PATTERN)
INSERT INTO partenaire_fond (partenaire_id, fond_id, committed_amount, commitment_date, commitment_status, payment_date, payment_amount)
VALUES 
(@partenaire_id, @fond_id, 25000.0, '2025-09-01', 'PAID', '2025-12-15', 25000.0),
(@partenaire_id, @fond_id, 30000.0, '2025-10-01', 'PAID', '2026-01-20', 30000.0),
(@partenaire_id, @fond_id, 28000.0, '2025-10-15', 'PAID', '2026-01-01', 28000.0);

-- Update fond committed amount
UPDATE fond 
SET committed_amount = (
    SELECT SUM(committed_amount) 
    FROM partenaire_fond 
    WHERE fond_id = @fond_id
)
WHERE id_fond = @fond_id;

-- Display the IDs for testing
SELECT @partenaire_id as partenaire_id, @fond_id as fond_id;
```

---

## Test the Fraud Detection

### 1. Check Partenaire Fraud
```
GET http://localhost:8083/api/fraud-detection/partenaire/{partenaire_id}
```

Expected alerts:
- HIGH_DEFAULT_RATE (30 points)
- RAPID_COMMITMENTS (15 points)
- UNUSUAL_COMMITMENT_AMOUNT (20 points)
- LATE_PAYMENT_PATTERN (20 points)

Total Risk Score: ~85 (CRITICAL)

### 2. Check Specific Commitment Fraud
```
GET http://localhost:8083/api/fraud-detection/commitment/{commitment_id}
```

Use the ID of the old unpaid commitment. Expected alerts:
- LONG_OVERDUE (30 points)
- PARTNER_DEFAULT_HISTORY (25 points)

Total Risk Score: ~55 (HIGH)

### 3. Scan All Entities
```
GET http://localhost:8083/api/fraud-detection/scan-all
```

Should return the fraudulent partenaire and high-risk commitments.

### 4. Get Critical Alerts
```
GET http://localhost:8083/api/fraud-detection/critical-alerts
```

Should return the partenaire with 85+ risk score.

---

## Expected Response Example

```json
{
  "entityId": 100,
  "entityType": "PARTENAIRE",
  "entityName": "Fraudulent Corp",
  "riskScore": 85.0,
  "riskLevel": "CRITICAL",
  "anomalies": [
    {
      "type": "HIGH_DEFAULT_RATE",
      "description": "Partner has 60.0% default rate (3 of 5 commitments)",
      "severity": "HIGH",
      "score": 30.0
    },
    {
      "type": "UNUSUAL_COMMITMENT_AMOUNT",
      "description": "1 commitments significantly above average (12333.33)",
      "severity": "MEDIUM",
      "score": 20.0
    },
    {
      "type": "RAPID_COMMITMENTS",
      "description": "6 commitments in last 7 days",
      "severity": "MEDIUM",
      "score": 15.0
    },
    {
      "type": "LATE_PAYMENT_PATTERN",
      "description": "3 payments were significantly late",
      "severity": "MEDIUM",
      "score": 20.0
    }
  ],
  "aiModelPrediction": "MEDIUM_RISK",
  "aiConfidence": 0.65,
  "recommendation": "IMMEDIATE ACTION REQUIRED: Suspend all transactions and conduct thorough investigation"
}
```

---

## Clean Up Test Data

```sql
-- Delete test data
DELETE FROM partenaire_fond WHERE partenaire_id = @partenaire_id;
DELETE FROM partenaire WHERE id_partenaire = @partenaire_id;
DELETE FROM fond WHERE id_fond = @fond_id;
```

---

## Tips

1. Use the SQL script for fastest setup
2. Adjust dates to match current date (2026-04-01)
3. Mix different fraud patterns for realistic testing
4. Test individual detection rules by creating specific scenarios
5. Use scan-all endpoint to see all detected fraud at once
