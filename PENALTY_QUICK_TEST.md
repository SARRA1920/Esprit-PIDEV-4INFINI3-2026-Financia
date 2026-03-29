# Quick Penalty Calculation Test

## Prerequisites
- Application running on http://localhost:8083
- Restart the application after the latest code changes

## Test Steps

### Step 1: Update Contract with Penalty Configuration

```powershell
$body = @'
{
  "signedDate": "2026-02-20",
  "amount": 50000,
  "rate": 7.5,
  "duration": 24,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "INITIAL",
  "penaltyRate": 5.0,
  "penaltyType": "PERCENTAGE",
  "gracePeriodDays": 3
}
'@
Invoke-RestMethod -Uri "http://localhost:8083/api/contrats/1" -Method Put -Body $body -ContentType "application/json"
```

**Expected**: Contract updated with penalty configuration

---

### Step 2: Create an Overdue Payment

```powershell
$body = @'
{
  "dueDate": "2026-03-01",
  "amountDue": 1000,
  "principalAmount": 900,
  "interestAmount": 100,
  "penaltyAmount": 0,
  "status": "OVERDUE"
}
'@
Invoke-RestMethod -Uri "http://localhost:8083/api/echeanciers/contrat/1" -Method Post -Body $body -ContentType "application/json"
```

**Expected**: Payment created with OVERDUE status

---

### Step 3: Calculate Penalty

```powershell
Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/calculate/4" -Method Post
```

**Note**: Replace `4` with the actual payment ID from Step 2

**Expected**: 
```json
{
  "message": "Penalty calculated successfully for payment ID: 4"
}
```

---

### Step 4: Verify Penalty Amount

```powershell
Invoke-RestMethod -Uri "http://localhost:8083/api/echeanciers/4" -Method Get
```

**Expected**: Payment with calculated penalty amount based on days overdue

**Calculation Example**:
- Amount Due: 1000 TND
- Penalty Rate: 5% monthly
- Days Overdue: ~26 days (from March 1 to March 27)
- Grace Period: 3 days
- Effective Days: 23 days
- Penalty = 1000 * (5/100) * (23/30) = 38.33 TND

---

### Step 5: View Penalty History

```powershell
Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/history/4" -Method Get
```

**Expected**: List of penalty calculations with dates and amounts

---

### Step 6: Test Batch Penalty Calculation

```powershell
Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/calculate-all" -Method Post
```

**Expected**:
```json
{
  "message": "Penalty calculation completed",
  "paymentsMarkedOverdue": 0,
  "penaltiesUpdated": 1
}
```

---

### Step 7: Test Daily Job Manually

```powershell
Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/run-daily-job" -Method Post
```

**Expected**:
```json
{
  "message": "Daily penalty job executed successfully",
  "paymentsMarkedOverdue": 0,
  "penaltiesUpdated": 1
}
```

---

## Test Different Penalty Types

### FIXED Penalty Test

```powershell
# Update contract with FIXED penalty (10 TND per day)
$body = @'
{
  "signedDate": "2026-02-20",
  "amount": 50000,
  "rate": 7.5,
  "duration": 24,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "INITIAL",
  "penaltyRate": 10.0,
  "penaltyType": "FIXED",
  "gracePeriodDays": 0
}
'@
Invoke-RestMethod -Uri "http://localhost:8083/api/contrats/1" -Method Put -Body $body -ContentType "application/json"

# Recalculate penalty
Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/calculate/4" -Method Post

# Check result (should be 10 * days_overdue)
Invoke-RestMethod -Uri "http://localhost:8083/api/echeanciers/4" -Method Get
```

---

### TIERED Penalty Test

```powershell
# Update contract with TIERED penalty
$body = @'
{
  "signedDate": "2026-02-20",
  "amount": 50000,
  "rate": 7.5,
  "duration": 24,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "INITIAL",
  "penaltyRate": 0,
  "penaltyType": "TIERED",
  "gracePeriodDays": 0
}
'@
Invoke-RestMethod -Uri "http://localhost:8083/api/contrats/1" -Method Put -Body $body -ContentType "application/json"

# Recalculate penalty
Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/calculate/4" -Method Post

# Check result (0-30 days = 2%, 31-60 days = 5%, 61+ days = 10%)
Invoke-RestMethod -Uri "http://localhost:8083/api/echeanciers/4" -Method Get
```

---

## Verification Checklist

- [ ] Contract has penalty configuration (penaltyRate, penaltyType, gracePeriodDays)
- [ ] Payment is created with OVERDUE status
- [ ] Penalty calculation endpoint works
- [ ] Penalty amount is calculated correctly
- [ ] Penalty history is logged
- [ ] Batch calculation works
- [ ] Daily job can be triggered manually
- [ ] Different penalty types work (PERCENTAGE, FIXED, TIERED)

---

## Troubleshooting

### If you get 500 errors:
1. Check application logs in the console
2. Verify the contract has penalty configuration
3. Ensure payment status is OVERDUE
4. Restart the application

### If penalty is 0:
1. Check if within grace period
2. Verify contract has penaltyRate and penaltyType set
3. Ensure payment status is OVERDUE (not PENDING or PAID)
4. Check if due date is in the past

---

## Expected Results Summary

| Test | Expected Penalty (approx) |
|------|---------------------------|
| PERCENTAGE (5%, 23 days) | 38.33 TND |
| FIXED (10 TND/day, 23 days) | 230.00 TND |
| TIERED (0-30 days, 1000 TND) | 20.00 TND |

---

## Next Steps After Testing

1. Monitor scheduled job at 1:00 AM
2. Create more test payments with different scenarios
3. Test grace period functionality
4. Test penalty cap (50% limit)
5. Verify penalty history tracking
