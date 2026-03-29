# Simple Swagger Test - Automatic SMS

## ✅ What We Know:
- User 2 exists: Anas
- Phone: +216 20 285 074
- Credit created: ID = 9
- Application is running

## 🎯 Test in Swagger Now

Open: http://localhost:8083/swagger-ui.html

---

### STEP 1: Create Contract for Credit 9

**Endpoint:** `POST /api/contrats/credit/9`

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

📝 **Note the contract ID from response**

---

### STEP 2: Create Payment with Past Due Date

**Endpoint:** `POST /api/echeanciers/contrat/{contractId}`

Replace `{contractId}` with ID from Step 1

**Request Body:**
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

### ✨ MAGIC HAPPENS HERE!

**Expected Response:**
```json
{
  "id": 12,
  "dueDate": "2026-03-25",
  "amountDue": 900.000,
  "principalAmount": 800.000,
  "interestAmount": 100.000,
  "penaltyAmount": 0.000,
  "status": "OVERDUE",  ← Automatically changed!
  "overdueDate": "2026-03-29",
  "daysOverdue": 4
}
```

### 📱 SMS SENT AUTOMATICALLY!

Check your application console for:
```
Payment due date 2026-03-25 is in the past. Automatically marking as OVERDUE
Overdue SMS sent to user 2 for payment 12
SMS sent successfully to +21620285074 - SID: SMXXXXXXXXX
```

Or if testing mode:
```
=== SIMULATED SMS ===
To: +21620285074
Message:
Bonjour Anas,
Votre paiement du 2026-03-25 est maintenant en retard.
Montant dû: 900.000 TND
...
====================
```

---

### STEP 3 (Optional): Calculate Penalties

**Endpoint:** `POST /api/penalties/calculate/{paymentId}`

Replace `{paymentId}` with ID from Step 2

---

### STEP 4 (Optional): Check Penalty History

**Endpoint:** `GET /api/penalties/history/{paymentId}`

---

## 🎉 Success Indicators:

✅ Payment status = "OVERDUE" (not "PENDING")  
✅ overdueDate = "2026-03-29"  
✅ daysOverdue = 4  
✅ SMS log in console  

## 📋 Summary:

- Credit ID: 9
- User: Anas (ID: 2)
- Phone: +216 20 285 074
- SMS: Automatic when payment created with past due date

**Just 2 steps in Swagger to test everything!** 🚀
