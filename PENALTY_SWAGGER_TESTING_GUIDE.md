# Penalty Calculation - Swagger Testing Guide

## Access Swagger UI

Open your browser and navigate to:
```
http://localhost:8083/swagger-ui.html
```

Or try:
```
http://localhost:8083/swagger-ui/index.html
```

---

## Test Scenario 1: Setup Contract with Penalty Configuration

### Step 1: Update Contract with PERCENTAGE Penalty

1. Find **contrat-controller** section in Swagger
2. Click on **PUT /api/contrats/{id}**
3. Click **Try it out**
4. Enter **id**: `1`
5. Enter Request Body:

```json
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
```

6. Click **Execute**
7. Check Response - should show:
   - `penaltyRate`: 5.0
   - `penaltyType`: "PERCENTAGE"
   - `gracePeriodDays`: 3

---

## Test Scenario 2: Create Overdue Payment

### Step 2: Create a New Overdue Payment

1. Find **echeancier-payement-controller** section
2. Click on **POST /api/echeanciers/contrat/{contratId}**
3. Click **Try it out**
4. Enter **contratId**: `1`
5. Enter Request Body:

```json
{
  "dueDate": "2026-03-01",
  "amountDue": 1000,
  "principalAmount": 900,
  "interestAmount": 100,
  "penaltyAmount": 0,
  "status": "OVERDUE"
}
```

6. Click **Execute**
7. Note the **id** from the response (e.g., `15`)

---

## Test Scenario 3: Calculate Penalty

### Step 3: Calculate Penalty for the Payment

1. Find **penalty-controller** section
2. Click on **POST /api/penalties/calculate/{echeancierPayementId}**
3. Click **Try it out**
4. Enter **echeancierPayementId**: `15` (use the ID from Step 2)
5. Click **Execute**
6. Check Response:

```json
{
  "message": "Penalty calculated successfully for payment ID: 15"
}
```

---

## Test Scenario 4: Verify Penalty Amount

### Step 4: Get Payment Details

1. Find **echeancier-payement-controller** section
2. Click on **GET /api/echeanciers/{id}**
3. Click **Try it out**
4. Enter **id**: `15`
5. Click **Execute**
6. Check Response - should show:
   - `amountDue`: 1000.000
   - `penaltyAmount`: ~38.333 (calculated based on days overdue)
   - `daysOverdue`: ~26 (from March 1 to March 27)
   - `status`: "OVERDUE"

**Calculation Explanation:**
- Amount Due: 1000 TND
- Penalty Rate: 5% monthly
- Days Overdue: 26 days
- Grace Period: 3 days
- Effective Days: 23 days
- Formula: 1000 × (5/100) × (23/30) = 38.33 TND

---

## Test Scenario 5: View Penalty History

### Step 5: Get Penalty History

1. Find **penalty-controller** section
2. Click on **GET /api/penalties/history/{echeancierPayementId}**
3. Click **Try it out**
4. Enter **echeancierPayementId**: `15`
5. Click **Execute**
6. Check Response - should show array of history entries:

```json
[
  {
    "id": 1,
    "calculationDate": "2026-03-27",
    "daysOverdue": 23,
    "penaltyAmount": 38.333,
    "previousPenaltyAmount": 0.000,
    "calculationMethod": "PERCENTAGE",
    "createdAt": "2026-03-27T15:00:00Z"
  }
]
```

---

## Test Scenario 6: Test FIXED Penalty Type

### Step 6A: Update Contract to FIXED Penalty

1. Find **contrat-controller** section
2. Click on **PUT /api/contrats/{id}**
3. Click **Try it out**
4. Enter **id**: `1`
5. Enter Request Body:

```json
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
```

6. Click **Execute**

### Step 6B: Recalculate Penalty

1. Find **penalty-controller** section
2. Click on **POST /api/penalties/calculate/{echeancierPayementId}**
3. Enter **echeancierPayementId**: `15`
4. Click **Execute**

### Step 6C: Verify New Penalty

1. Click on **GET /api/echeanciers/{id}**
2. Enter **id**: `15`
3. Click **Execute**
4. Check `penaltyAmount` - should be ~260 TND (10 TND/day × 26 days)

---

## Test Scenario 7: Test TIERED Penalty Type

### Step 7A: Update Contract to TIERED Penalty

1. Find **contrat-controller** section
2. Click on **PUT /api/contrats/{id}**
3. Enter **id**: `1`
4. Enter Request Body:

```json
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
```

5. Click **Execute**

### Step 7B: Recalculate Penalty

1. Click on **POST /api/penalties/calculate/{echeancierPayementId}**
2. Enter **echeancierPayementId**: `15`
3. Click **Execute**

### Step 7C: Verify Tiered Penalty

1. Click on **GET /api/echeanciers/{id}**
2. Enter **id**: `15`
3. Click **Execute**
4. Check `penaltyAmount` - should be 20 TND (2% for 0-30 days: 1000 × 0.02)

**Tiered Rates:**
- 0-30 days: 2% of amount due
- 31-60 days: 5% of amount due
- 61+ days: 10% of amount due

---

## Test Scenario 8: Batch Penalty Calculation

### Step 8: Calculate All Penalties

1. Find **penalty-controller** section
2. Click on **POST /api/penalties/calculate-all**
3. Click **Try it out**
4. Click **Execute**
5. Check Response:

```json
{
  "message": "Penalty calculation completed",
  "paymentsMarkedOverdue": 0,
  "penaltiesUpdated": 1
}
```

---

## Test Scenario 9: Manual Daily Job Trigger

### Step 9: Run Daily Job

1. Find **penalty-controller** section
2. Click on **POST /api/penalties/run-daily-job**
3. Click **Try it out**
4. Click **Execute**
5. Check Response:

```json
{
  "message": "Daily penalty job executed successfully",
  "paymentsMarkedOverdue": 0,
  "penaltiesUpdated": 1
}
```

---

## Test Scenario 10: Test Grace Period

### Step 10A: Create Recent Overdue Payment (Within Grace Period)

1. Find **echeancier-payement-controller** section
2. Click on **POST /api/echeanciers/contrat/{contratId}**
3. Enter **contratId**: `1`
4. Enter Request Body (due date 2 days ago):

```json
{
  "dueDate": "2026-03-25",
  "amountDue": 500,
  "principalAmount": 450,
  "interestAmount": 50,
  "penaltyAmount": 0,
  "status": "OVERDUE"
}
```

5. Click **Execute**
6. Note the new payment **id**

### Step 10B: Update Contract with Grace Period

1. Click on **PUT /api/contrats/{id}**
2. Enter **id**: `1`
3. Enter Request Body:

```json
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
  "gracePeriodDays": 5
}
```

4. Click **Execute**

### Step 10C: Calculate Penalty

1. Click on **POST /api/penalties/calculate/{echeancierPayementId}**
2. Enter the new payment **id**
3. Click **Execute**

### Step 10D: Verify No Penalty (Within Grace Period)

1. Click on **GET /api/echeanciers/{id}**
2. Enter the new payment **id**
3. Click **Execute**
4. Check `penaltyAmount` - should be 0.000 (within grace period)

---

## Test Scenario 11: View All Payments for a Contract

### Step 11: Get All Payments

1. Find **echeancier-payement-controller** section
2. Click on **GET /api/echeanciers/contrat/{contratId}**
3. Click **Try it out**
4. Enter **contratId**: `1`
5. Click **Execute**
6. Review all payments with their penalty amounts

---

## Test Scenario 12: Test Penalty Cap (50% Limit)

### Step 12A: Create Very Old Overdue Payment

1. Click on **POST /api/echeanciers/contrat/{contratId}**
2. Enter **contratId**: `1`
3. Enter Request Body (due date 1 year ago):

```json
{
  "dueDate": "2025-03-01",
  "amountDue": 1000,
  "principalAmount": 900,
  "interestAmount": 100,
  "penaltyAmount": 0,
  "status": "OVERDUE"
}
```

4. Click **Execute**
5. Note the payment **id**

### Step 12B: Calculate Penalty

1. Click on **POST /api/penalties/calculate/{echeancierPayementId}**
2. Enter the new payment **id**
3. Click **Execute**

### Step 12C: Verify Penalty Cap

1. Click on **GET /api/echeanciers/{id}**
2. Enter the payment **id**
3. Click **Execute**
4. Check `penaltyAmount` - should be capped at 500 TND (50% of 1000 TND)

---

## Quick Reference: All Penalty Endpoints

### Penalty Controller Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/penalties/calculate/{id}` | Calculate penalty for single payment |
| POST | `/api/penalties/calculate-all` | Calculate all overdue penalties |
| GET | `/api/penalties/history/{id}` | Get penalty history for payment |
| POST | `/api/penalties/run-daily-job` | Manually trigger daily job |

### Contract Controller (Penalty Config)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/contrats/{id}` | Update contract with penalty config |
| GET | `/api/contrats/{id}` | View contract penalty configuration |

### Payment Controller

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/echeanciers/contrat/{contratId}` | Create payment |
| GET | `/api/echeanciers/{id}` | Get payment with penalty |
| GET | `/api/echeanciers/contrat/{contratId}` | Get all payments for contract |
| PUT | `/api/echeanciers/{id}` | Update payment |

---

## Expected Results Summary

| Test | Penalty Type | Rate | Days | Expected Penalty |
|------|--------------|------|------|------------------|
| 1 | PERCENTAGE | 5% | 23 | ~38.33 TND |
| 2 | FIXED | 10/day | 26 | ~260 TND |
| 3 | TIERED | - | 26 | 20 TND (2%) |
| 4 | Grace Period | 5% | 2 | 0 TND |
| 5 | Penalty Cap | 5% | 365 | 500 TND (capped) |

---

## Troubleshooting in Swagger

### If you get 404 errors:
- Verify the application is running
- Check the correct port (8083)
- Ensure Swagger is enabled in your configuration

### If you get 500 errors:
- Check application logs in the console
- Verify the contract has penalty configuration
- Ensure payment status is OVERDUE
- Check that payment has amount > 0

### If penalty is 0:
- Verify payment status is OVERDUE (not PENDING)
- Check if within grace period
- Ensure contract has penaltyRate and penaltyType set
- Verify due date is in the past

### If endpoints are missing:
- Restart the application
- Clear browser cache
- Try accessing Swagger at different URL

---

## Tips for Swagger Testing

1. **Use "Try it out" button** - Makes fields editable
2. **Copy Response IDs** - Use them in subsequent requests
3. **Check Response Codes** - 200/201 = success, 400/500 = error
4. **View Response Body** - Contains detailed results
5. **Test in Order** - Follow the scenarios sequentially
6. **Save Test Data** - Keep track of IDs you create

---

## Success Criteria

✅ Contract updated with penalty configuration  
✅ Overdue payment created  
✅ Penalty calculated successfully  
✅ Penalty amount > 0 for overdue payments  
✅ Penalty history logged  
✅ All three penalty types work (PERCENTAGE, FIXED, TIERED)  
✅ Grace period respected  
✅ Penalty cap enforced  
✅ Batch calculation works  
✅ Daily job can be triggered  

---

## Next Steps After Testing

1. Monitor scheduled job at 1:00 AM
2. Create more test scenarios
3. Test with different contract amounts
4. Test with multiple overdue payments
5. Verify penalty history accumulation
6. Test payment status transitions

---

## Support

For issues:
- Check application logs
- Review `PENALTY_CALCULATION_TESTING_GUIDE.md`
- Verify database records
- Check penalty calculation logic in `PenaltyCalculationService`
