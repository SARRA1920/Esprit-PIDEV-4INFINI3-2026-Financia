# Run Automatic SMS Test with Commands

## Prerequisites

1. ✅ Application is running on `http://localhost:8083`
2. ✅ Twilio credentials configured in `application.properties`
3. ✅ User with id=2 exists in database
4. ✅ Application restarted after code changes

---

## Option 1: PowerShell Script (Windows)

### Run the script:
```powershell
.\test-automatic-sms.ps1
```

### What it does:
1. Verifies user 2 exists
2. Creates credit for user 2
3. Creates contract with penalty config
4. Creates payment with past due date
5. **SMS automatically sent!** 📱
6. Verifies payment status changed to OVERDUE
7. Calculates penalties
8. Shows penalty history

---

## Option 2: Bash Script (Linux/Mac)

### Make it executable:
```bash
chmod +x test-automatic-sms.sh
```

### Run the script:
```bash
./test-automatic-sms.sh
```

---

## Option 3: Manual cURL Commands

### Step 1: Verify User 2
```bash
curl -X GET http://localhost:8083/api/users/2
```

### Step 2: Create Credit
```bash
curl -X POST http://localhost:8083/api/credits \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "duration": 12,
    "rate": 5.5,
    "status": "APPROVED",
    "userId": 2
  }'
```
**Note the credit ID from response!**

### Step 3: Create Contract
Replace `{CREDIT_ID}` with ID from Step 2:
```bash
curl -X POST http://localhost:8083/api/contrats/credit/{CREDIT_ID} \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```
**Note the contract ID from response!**

### Step 4: Create Payment (SMS SENT HERE!)
Replace `{CONTRACT_ID}` with ID from Step 3:
```bash
curl -X POST http://localhost:8083/api/echeanciers/contrat/{CONTRACT_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "dueDate": "2026-03-25",
    "amountDue": 900,
    "principalAmount": 800,
    "interestAmount": 100,
    "penaltyAmount": 0,
    "status": "PENDING"
  }'
```

**✨ SMS AUTOMATICALLY SENT!**

Check the response - status should be "OVERDUE"!

### Step 5: Verify Payment
Replace `{PAYMENT_ID}` with ID from Step 4:
```bash
curl -X GET http://localhost:8083/api/echeanciers/{PAYMENT_ID}
```

### Step 6: Calculate Penalties
```bash
curl -X POST http://localhost:8083/api/penalties/calculate/{PAYMENT_ID}
```

### Step 7: Check Penalty History
```bash
curl -X GET http://localhost:8083/api/penalties/history/{PAYMENT_ID}
```

---

## Expected Output

### Payment Response (Step 4):
```json
{
  "id": 12,
  "dueDate": "2026-03-25",
  "amountDue": 900.000,
  "principalAmount": 800.000,
  "interestAmount": 100.000,
  "penaltyAmount": 0.000,
  "status": "OVERDUE",
  "overdueDate": "2026-03-29",
  "daysOverdue": 4
}
```

### Application Logs:
Look for:
```
Payment due date 2026-03-25 is in the past. Automatically marking as OVERDUE
Overdue SMS sent to user 2 for payment 12
SMS sent successfully to +216XXXXXXXX - SID: SMXXXXXXXXX
```

Or if testing mode:
```
=== SIMULATED SMS ===
To: +216XXXXXXXX
Message:
Bonjour [Name],
Votre paiement du 25/03/2026 est maintenant en retard.
Montant dû: 900.000 TND
...
====================
```

---

## Troubleshooting

### Script fails with "connection refused"
- Make sure application is running on port 8083
- Check: `http://localhost:8083/swagger-ui.html`

### SMS not sent
- Check application logs for SMS messages
- Verify Twilio credentials in `application.properties`
- Verify user 2 has a phone number

### Payment status not OVERDUE
- Make sure you restarted the application after code changes
- Verify dueDate is "2026-03-25" (in the past)
- Check application logs for automatic detection message

---

## Quick Test (One-liner)

If you just want to test the payment creation:

```bash
curl -X POST http://localhost:8083/api/echeanciers/contrat/1 \
  -H "Content-Type: application/json" \
  -d '{"dueDate":"2026-03-25","amountDue":900,"principalAmount":800,"interestAmount":100,"penaltyAmount":0,"status":"PENDING"}'
```

Replace `1` with your actual contract ID.

---

## Success Indicators

✅ Payment created with status = "OVERDUE"  
✅ overdueDate set to today  
✅ daysOverdue = 4  
✅ SMS log message in console  
✅ No errors in application logs
