# Complete End-to-End Overdue SMS Testing Guide

## Objective
Test the complete flow: User → Credit → Contract → Payment Schedule → Overdue Status → Automatic SMS

**Test User:** id_user = 2  
**Current Time:** 16:51 (We'll manually trigger the daily job)

---

## Prerequisites Check

### 1. Verify User Exists (id_user = 2)
```
GET /api/users/2
```

**What to check:**
- User exists
- Has a valid phone number (format: +216XXXXXXXX or will be auto-formatted)
- Note the user's firstName and phone for verification

---

## Step-by-Step Testing Flow

### STEP 1: Create a Credit for User 2

**Endpoint:** `POST /api/credits`

**Request Body:**
```json
{
  "amount": 10000,
  "duration": 12,
  "rate": 5.5,
  "status": "APPROVED",
  "userId": 2
}
```

**Expected Response:** 
- Status: 201 Created
- Note the `id` of the created credit (e.g., credit_id = 5)

---

### STEP 2: Create a Contract for the Credit

**Endpoint:** `POST /api/contrats/credit/{creditId}`

Replace `{creditId}` with the ID from Step 1.

**Request Body:**
```json
{
  "signedDate": "2026-03-20",
  "amount": 10000,
  "rate": 5.5,
  "duration": 12,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "PERSONAL",
  "currency": "TND",
  "penaltyRate": 5.00,
  "penaltyType": "PERCENTAGE",
  "gracePeriodDays": 3
}
```

**Penalty Configuration Explained:**
- `penaltyRate: 5.00` = 5% monthly penalty
- `penaltyType: PERCENTAGE` = Calculated as % of amount due
- `gracePeriodDays: 3` = Penalties start 3 days after due date

**Expected Response:**
- Status: 201 Created
- Note the `id` of the created contract (e.g., contrat_id = 8)
- Email should be sent to user

---

### STEP 3: Create an OVERDUE Payment (Past Due Date)

**Endpoint:** `POST /api/echeanciers/contrat/{contratId}`

Replace `{contratId}` with the ID from Step 2.

**Request Body (Payment that's already late):**
```json
{
  "dueDate": "2026-03-25",
  "amountDue": 900,
  "principalAmount": 800,
  "interestAmount": 100,
  "penaltyAmount": 0,
  "status": "PENDING"
}
```

**Important:** 
- `dueDate: "2026-03-25"` is in the PAST (today is March 29, 2026)
- Status is `PENDING` (will be changed to OVERDUE by the job)

**Expected Response:**
- Status: 201 Created
- Note the `id` of the payment (e.g., echeancier_id = 12)

---

### STEP 4: Manually Trigger the Daily Overdue Job

**Endpoint:** `POST /api/penalties/run-daily-job`

**No request body needed**

**What this does:**
1. Finds all PENDING payments with due date < today
2. Changes status to OVERDUE
3. Sets overdueDate to today
4. **Automatically sends SMS to user**
5. Calculates initial penalties

**Expected Response:**
```json
{
  "message": "Daily penalty job executed successfully",
  "paymentsMarkedOverdue": 1,
  "penaltiesUpdated": 1
}
```

**SMS Should Be Sent To User 2:**
```
Bonjour [FirstName],

Votre paiement du 25/03/2026 est maintenant en retard.
Montant dû: 900.000 TND

Merci de régulariser votre situation rapidement pour éviter des pénalités supplémentaires.

Financia
```

---

### STEP 5: Verify Payment Status Changed

**Endpoint:** `GET /api/echeanciers/{echeancier_id}`

Replace `{echeancier_id}` with the ID from Step 3.

**Expected Response:**
```json
{
  "id": 12,
  "dueDate": "2026-03-25",
  "amountDue": 900.000,
  "principalAmount": 800.000,
  "interestAmount": 100.000,
  "penaltyAmount": 15.000,
  "status": "OVERDUE",
  "overdueDate": "2026-03-29",
  "daysOverdue": 4
}
```

**What to verify:**
- ✅ Status changed from PENDING → OVERDUE
- ✅ overdueDate is set to today (2026-03-29)
- ✅ daysOverdue = 4 (March 25 to March 29)
- ✅ penaltyAmount calculated (should be > 0)

---

### STEP 6: Check Penalty Calculation Details

**Endpoint:** `GET /api/penalties/history/{echeancier_id}`

**Expected Response:**
```json
[
  {
    "id": 1,
    "calculationDate": "2026-03-29",
    "daysOverdue": 4,
    "penaltyAmount": 15.000,
    "previousPenaltyAmount": 0.000,
    "calculationMethod": "PERCENTAGE"
  }
]
```

**Penalty Calculation Breakdown:**
- Contract has 5% monthly penalty rate
- Daily rate = 5% / 30 = 0.1667% per day
- Grace period = 3 days
- Actual penalty days = 4 - 3 = 1 day (grace period applied)
- Penalty = 900 × 0.05 / 30 × 1 = 1.500 TND

---

## SMS Configuration Notes

### Current Configuration Status:
```properties
twilio.enabled=true
twilio.account.sid=AC5550b799fb4c1eadbe36e1de931fefa4
twilio.auth.token=COLLEZ_VOTRE_AUTH_TOKEN_ICI
twilio.phone.number=COLLEZ_VOTRE_NUMERO_TWILIO_ICI
```

### If SMS is NOT Configured (Testing Mode):

If Twilio credentials are not set, the system will:
- ✅ Still work normally
- ✅ Log "SMS sending is disabled"
- ✅ Print simulated SMS in console logs
- ✅ Show what would have been sent

**Check console logs for:**
```
=== SIMULATED SMS ===
To: +216XXXXXXXX
Message:
Bonjour [Name],
...
====================
```

### To Enable Real SMS:

1. Get Twilio credentials from: https://console.twilio.com/
2. Update `application.properties`:
```properties
twilio.auth.token=your_actual_auth_token
twilio.phone.number=+1234567890
```
3. Restart the application

---

## Alternative: Manual Status Change (Without Daily Job)

If you want to test SMS without the daily job:

**Endpoint:** `PUT /api/echeanciers/{echeancier_id}`

**Request Body:**
```json
{
  "dueDate": "2026-03-25",
  "amountDue": 900,
  "principalAmount": 800,
  "interestAmount": 100,
  "penaltyAmount": 0,
  "status": "OVERDUE"
}
```

This will also trigger automatic SMS when status changes to OVERDUE.

---

## Troubleshooting

### SMS Not Sent?
1. Check console logs for "SMS sent successfully" or "SIMULATED SMS"
2. Verify user has phone number: `GET /api/users/2`
3. Check `twilio.enabled=true` in application.properties
4. If testing mode, look for simulated SMS in logs

### Payment Not Marked Overdue?
1. Verify dueDate is in the past (before 2026-03-29)
2. Verify status is PENDING before running job
3. Check response from `/api/penalties/run-daily-job`

### No Penalty Calculated?
1. Verify contract has penalty configuration (penaltyRate, penaltyType)
2. Check if grace period is still active
3. View penalty history: `GET /api/penalties/history/{echeancier_id}`

---

## Expected Complete Flow Summary

1. ✅ User 2 exists with phone number
2. ✅ Credit created for user 2
3. ✅ Contract created with penalty config
4. ✅ Payment created with past due date (PENDING)
5. ✅ Daily job triggered manually
6. ✅ Payment status → OVERDUE
7. ✅ SMS automatically sent to user 2
8. ✅ Penalty calculated and logged
9. ✅ Penalty history recorded

**Total Time:** ~5 minutes to complete all steps
