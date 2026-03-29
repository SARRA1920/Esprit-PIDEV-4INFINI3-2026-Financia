# Late Payment Penalty Calculation - Testing Guide

## Overview
This guide provides comprehensive testing instructions for the Late Payment Penalty Calculation feature.

## Features Implemented

### 1. Penalty Configuration (Contract Level)
- `penaltyRate`: The rate for penalty calculation (e.g., 5.00 for 5%)
- `penaltyType`: PERCENTAGE, FIXED, or TIERED
- `gracePeriodDays`: Days before penalty starts (e.g., 3 days)

### 2. Penalty Tracking (Payment Level)
- `penaltyAmount`: Current penalty amount
- `overdueDate`: When payment became overdue
- `daysOverdue`: Number of days overdue
- `penaltyHistories`: Historical record of penalty changes

### 3. Penalty Calculation Methods

#### PERCENTAGE
Formula: `penalty = amountDue * (penaltyRate/100) * (daysOverdue/30)`
- Example: 1000 TND * 5% * (30 days / 30) = 50 TND

#### FIXED
Formula: `penalty = fixedRate * daysOverdue`
- Example: 10 TND/day * 5 days = 50 TND

#### TIERED
- 0-30 days: 2% of amount due
- 31-60 days: 5% of amount due
- 61+ days: 10% of amount due

### 4. Automatic Features
- Daily scheduled job at 1:00 AM
- Auto-update payment status (PENDING → OVERDUE)
- Auto-calculate penalties for overdue payments
- Penalty history logging

---

## API Endpoints

### Penalty Management

#### 1. Calculate Penalty for Single Payment
```http
POST /api/penalties/calculate/{echeancierPayementId}
```

**Response:**
```json
{
  "message": "Penalty calculated successfully for payment ID: 1"
}
```

#### 2. Calculate All Penalties
```http
POST /api/penalties/calculate-all
```

**Response:**
```json
{
  "message": "Penalty calculation completed",
  "paymentsMarkedOverdue": 3,
  "penaltiesUpdated": 5
}
```

#### 3. Get Penalty History
```http
GET /api/penalties/history/{echeancierPayementId}
```

**Response:**
```json
[
  {
    "id": 1,
    "calculationDate": "2024-03-15",
    "daysOverdue": 5,
    "penaltyAmount": 25.000,
    "previousPenaltyAmount": 20.000,
    "calculationMethod": "PERCENTAGE",
    "createdAt": "2024-03-15T10:00:00Z"
  }
]
```

#### 4. Run Daily Job Manually (Testing)
```http
POST /api/penalties/run-daily-job
```

**Response:**
```json
{
  "message": "Daily penalty job executed successfully",
  "paymentsMarkedOverdue": 2,
  "penaltiesUpdated": 8
}
```

---

## Testing Scenarios

### Scenario 1: Create Contract with Percentage Penalty

**Step 1: Create Contract**
```http
POST /api/contrats/credit/1
Content-Type: application/json

{
  "signedDate": "2024-01-01",
  "amount": 10000,
  "rate": 5.5,
  "duration": 12,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "PERSONAL",
  "currency": "TND",
  "penaltyRate": 5.0,
  "penaltyType": "PERCENTAGE",
  "gracePeriodDays": 3
}
```

**Expected Result:**
- Contract created with penalty configuration
- penaltyRate = 5.0 (5% monthly)
- penaltyType = PERCENTAGE
- gracePeriodDays = 3

---

### Scenario 2: Create Overdue Payment and Calculate Penalty

**Step 1: Create Payment (30 days overdue)**
```http
POST /api/echeanciers/contrat/1
Content-Type: application/json

{
  "dueDate": "2024-02-15",
  "amountDue": 1000,
  "principalAmount": 900,
  "interestAmount": 100,
  "penaltyAmount": 0,
  "status": "OVERDUE"
}
```

**Step 2: Calculate Penalty**
```http
POST /api/penalties/calculate/1
```

**Step 3: Verify Payment**
```http
GET /api/echeanciers/1
```

**Expected Result:**
- Payment status = OVERDUE
- daysOverdue = 30 (approximately, based on current date)
- penaltyAmount = 50.000 (1000 * 5% * 30/30)
- overdueDate = date when marked overdue

**Calculation:**
```
Amount Due: 1000 TND
Penalty Rate: 5% monthly
Days Overdue: 30 days
Grace Period: 3 days (already passed)

Penalty = 1000 * (5/100) * (30/30) = 50 TND
```

---

### Scenario 3: Fixed Penalty Calculation

**Step 1: Create Contract with Fixed Penalty**
```http
POST /api/contrats/credit/2
Content-Type: application/json

{
  "signedDate": "2024-01-01",
  "amount": 5000,
  "rate": 6.0,
  "duration": 6,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "BUSINESS",
  "currency": "TND",
  "penaltyRate": 10.0,
  "penaltyType": "FIXED",
  "gracePeriodDays": 0
}
```

**Step 2: Create Overdue Payment (5 days overdue)**
```http
POST /api/echeanciers/contrat/2
Content-Type: application/json

{
  "dueDate": "2024-03-10",
  "amountDue": 1000,
  "principalAmount": 950,
  "interestAmount": 50,
  "penaltyAmount": 0,
  "status": "OVERDUE"
}
```

**Step 3: Calculate Penalty**
```http
POST /api/penalties/calculate/2
```

**Expected Result:**
- penaltyAmount = 50.000 (10 TND/day * 5 days)

---

### Scenario 4: Grace Period Test

**Step 1: Create Contract with 3-day Grace Period**
```http
POST /api/contrats/credit/3
Content-Type: application/json

{
  "signedDate": "2024-01-01",
  "amount": 8000,
  "rate": 5.0,
  "duration": 12,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "PERSONAL",
  "currency": "TND",
  "penaltyRate": 5.0,
  "penaltyType": "PERCENTAGE",
  "gracePeriodDays": 3
}
```

**Step 2: Create Payment (2 days overdue - within grace period)**
```http
POST /api/echeanciers/contrat/3
Content-Type: application/json

{
  "dueDate": "2024-03-25",
  "amountDue": 1000,
  "principalAmount": 900,
  "interestAmount": 100,
  "penaltyAmount": 0,
  "status": "OVERDUE"
}
```

**Step 3: Calculate Penalty**
```http
POST /api/penalties/calculate/3
```

**Expected Result:**
- penaltyAmount = 0.000 (within grace period)
- No penalty applied

---

### Scenario 5: Tiered Penalty Test

**Step 1: Create Contract with Tiered Penalty**
```http
POST /api/contrats/credit/4
Content-Type: application/json

{
  "signedDate": "2024-01-01",
  "amount": 15000,
  "rate": 7.0,
  "duration": 24,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "BUSINESS",
  "currency": "TND",
  "penaltyRate": 0,
  "penaltyType": "TIERED",
  "gracePeriodDays": 0
}
```

**Step 2: Create Payment (45 days overdue)**
```http
POST /api/echeanciers/contrat/4
Content-Type: application/json

{
  "dueDate": "2024-02-01",
  "amountDue": 1000,
  "principalAmount": 900,
  "interestAmount": 100,
  "penaltyAmount": 0,
  "status": "OVERDUE"
}
```

**Step 3: Calculate Penalty**
```http
POST /api/penalties/calculate/4
```

**Expected Result:**
- Days overdue: 45 (31-60 days tier)
- penaltyAmount = 50.000 (1000 * 5%)

---

### Scenario 6: Automatic Status Update (PENDING → OVERDUE)

**Step 1: Create Payment with Future Due Date**
```http
POST /api/echeanciers/contrat/1
Content-Type: application/json

{
  "dueDate": "2024-03-20",
  "amountDue": 1000,
  "principalAmount": 900,
  "interestAmount": 100,
  "penaltyAmount": 0,
  "status": "PENDING"
}
```

**Step 2: Wait until due date passes, then run daily job**
```http
POST /api/penalties/run-daily-job
```

**Expected Result:**
- Payment status changes from PENDING to OVERDUE
- overdueDate is set to current date
- Penalty calculation begins

---

### Scenario 7: Daily Penalty Accumulation

**Step 1: Create overdue payment**
```http
POST /api/echeanciers/contrat/1
Content-Type: application/json

{
  "dueDate": "2024-03-01",
  "amountDue": 1000,
  "principalAmount": 900,
  "interestAmount": 100,
  "penaltyAmount": 0,
  "status": "OVERDUE"
}
```

**Step 2: Calculate penalty on Day 1**
```http
POST /api/penalties/calculate/5
```

**Step 3: Check penalty history**
```http
GET /api/penalties/history/5
```

**Step 4: Wait 1 day, calculate again**
```http
POST /api/penalties/calculate/5
```

**Step 5: Check penalty history again**
```http
GET /api/penalties/history/5
```

**Expected Result:**
- Penalty increases each day
- Penalty history shows progression
- Each calculation creates a new history entry

---

### Scenario 8: Penalty Cap Test

**Step 1: Create payment with long overdue period**
```http
POST /api/echeanciers/contrat/1
Content-Type: application/json

{
  "dueDate": "2023-01-01",
  "amountDue": 1000,
  "principalAmount": 900,
  "interestAmount": 100,
  "penaltyAmount": 0,
  "status": "OVERDUE"
}
```

**Step 2: Calculate penalty**
```http
POST /api/penalties/calculate/6
```

**Expected Result:**
- Penalty is capped at 50% of amount due
- Maximum penalty = 500 TND (even if calculation exceeds this)

---

## Testing the Scheduled Job

### Option 1: Manual Trigger (Recommended for Testing)
```http
POST /api/penalties/run-daily-job
```

### Option 2: Change Schedule to Every 5 Minutes

Edit `PenaltyScheduledTask.java`:
```java
// Comment out the daily schedule
// @Scheduled(cron = "0 0 1 * * *")

// Uncomment the test schedule
@Scheduled(cron = "0 */5 * * * *")
public void updatePenaltiesEvery5Minutes() {
    log.info("Running test penalty calculation (every 5 minutes)");
    updateDailyPenalties();
}
```

### Option 3: Wait for 1:00 AM
The job runs automatically every day at 1:00 AM.

---

## Verification Checklist

### After Creating Contract
- [ ] Contract has penaltyRate set
- [ ] Contract has penaltyType set
- [ ] Contract has gracePeriodDays set

### After Creating Overdue Payment
- [ ] Payment status is OVERDUE
- [ ] overdueDate is set
- [ ] penaltyAmount is 0 initially

### After Calculating Penalty
- [ ] penaltyAmount is updated correctly
- [ ] daysOverdue is calculated
- [ ] Penalty history entry is created

### After Running Daily Job
- [ ] PENDING payments past due date become OVERDUE
- [ ] All OVERDUE payments have updated penalties
- [ ] Logs show successful execution

---

## Common Test Data

### Test Contract 1: Percentage Penalty
```json
{
  "penaltyRate": 5.0,
  "penaltyType": "PERCENTAGE",
  "gracePeriodDays": 3
}
```

### Test Contract 2: Fixed Penalty
```json
{
  "penaltyRate": 10.0,
  "penaltyType": "FIXED",
  "gracePeriodDays": 0
}
```

### Test Contract 3: Tiered Penalty
```json
{
  "penaltyRate": 0,
  "penaltyType": "TIERED",
  "gracePeriodDays": 0
}
```

---

## Expected Penalty Calculations

| Scenario | Amount | Type | Rate | Days | Grace | Expected Penalty |
|----------|--------|------|------|------|-------|------------------|
| 1 | 1000 | PERCENTAGE | 5% | 30 | 0 | 50.000 |
| 2 | 1000 | PERCENTAGE | 5% | 60 | 0 | 100.000 |
| 3 | 1000 | FIXED | 10 | 5 | 0 | 50.000 |
| 4 | 1000 | FIXED | 10 | 10 | 0 | 100.000 |
| 5 | 1000 | PERCENTAGE | 5% | 2 | 3 | 0.000 |
| 6 | 1000 | TIERED | - | 15 | 0 | 20.000 |
| 7 | 1000 | TIERED | - | 45 | 0 | 50.000 |
| 8 | 1000 | TIERED | - | 90 | 0 | 100.000 |
| 9 | 1000 | PERCENTAGE | 5% | 365 | 0 | 500.000 (capped) |

---

## Troubleshooting

### Penalty Not Calculating
- Check if contract has penalty configuration
- Verify payment status is OVERDUE
- Check if within grace period
- Verify due date is in the past

### Scheduled Job Not Running
- Verify @EnableScheduling is present in FinanciaApplication
- Check application logs for scheduled job execution
- Ensure application is running continuously

### Penalty History Not Saving
- Check database connection
- Verify PenaltyHistory entity is properly configured
- Check for transaction errors in logs

---

## Database Verification

### Check Penalty Configuration
```sql
SELECT id, penalty_rate, penalty_type, grace_period_days 
FROM contrat 
WHERE id = 1;
```

### Check Payment Penalties
```sql
SELECT id, due_date, amount_due, penalty_amount, days_overdue, status 
FROM echeancier_payement 
WHERE status = 'OVERDUE';
```

### Check Penalty History
```sql
SELECT * FROM penalty_history 
WHERE echeancier_payement_id = 1 
ORDER BY calculation_date DESC;
```

---

## Success Criteria

✅ Contracts can be created with penalty configuration  
✅ Penalties calculate correctly for all three types  
✅ Grace period is respected  
✅ Penalty cap (50%) is enforced  
✅ Payment status auto-updates from PENDING to OVERDUE  
✅ Daily scheduled job runs successfully  
✅ Penalty history is logged  
✅ Manual penalty calculation works  
✅ Batch penalty update works  

---

## Next Steps

After successful testing:
1. Monitor scheduled job in production
2. Set up alerts for failed penalty calculations
3. Review penalty history regularly
4. Consider adding email notifications for overdue payments
5. Implement payment allocation strategy
6. Add reporting dashboard for penalties

---

## Support

For issues or questions:
- Check application logs: `logs/application.log`
- Review penalty calculation logic in `PenaltyCalculationService`
- Verify database schema matches entity definitions
