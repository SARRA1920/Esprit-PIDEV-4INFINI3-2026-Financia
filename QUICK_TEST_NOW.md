# Quick Test Guide - Overdue SMS for User 2

**Time:** 16:51  
**User:** id_user = 2 (confirmed exists)  
**Twilio:** ✅ Configured and enabled

---

## 🚀 RESTART APPLICATION FIRST!

**Important:** Restart your Spring Boot application to load the new Twilio credentials.

```bash
# Stop the application if running, then restart
```

---

## Step-by-Step Testing (Copy & Paste Ready)

### STEP 1: Create Credit for User 2

**Swagger:** `POST /api/credits`

```json
{
  "amount": 10000,
  "duration": 12,
  "rate": 5.5,
  "status": "APPROVED",
  "userId": 2
}
```

📝 **Note the credit ID from response** (e.g., `"id": 5`)

---

### STEP 2: Create Contract

**Swagger:** `POST /api/contrats/credit/{creditId}`  
Replace `{creditId}` with ID from Step 1

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

📝 **Note the contract ID from response** (e.g., `"id": 8`)

---

### STEP 3: Create LATE Payment (Automatic OVERDUE Detection!)

**Swagger:** `POST /api/echeanciers/contrat/{contratId}`  
Replace `{contratId}` with ID from Step 2

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

**✨ MAGIC HAPPENS HERE!**
- You set status = "PENDING"
- System detects dueDate (March 25) is in the PAST
- **Automatically changes status to OVERDUE**
- **Automatically sends SMS to user 2!** 📱

**Why March 25?** It's 4 days ago (today is March 29), so it's already late!

📝 **Note the payment ID from response** (e.g., `"id": 12`)

**Expected Response:**
```json
{
  "id": 12,
  "dueDate": "2026-03-25",
  "amountDue": 900.000,
  "status": "OVERDUE",  ← Automatically changed!
  "overdueDate": "2026-03-29",
  "daysOverdue": 4
}
```

---

### ~~STEP 4: Trigger Overdue Check & SMS~~ ❌ NOT NEEDED ANYMORE!

**This step is now automatic!** SMS was already sent in Step 3.

You can skip to Step 5 to verify.

---

### STEP 4 (Optional): Manually Calculate Penalties

If you want to calculate penalties and get penalty history:

**Swagger:** `POST /api/penalties/calculate/{echeancierPayementId}`

Replace `{echeancierPayementId}` with payment ID from Step 3

This will calculate and apply penalties based on the contract's penalty configuration.

---

### STEP 5: Verify Payment is Now OVERDUE

**Swagger:** `GET /api/echeanciers/{id}`  
Replace `{id}` with payment ID from Step 3

**Check the response:**
```json
{
  "status": "OVERDUE",  ← Should be OVERDUE now!
  "overdueDate": "2026-03-29",
  "daysOverdue": 4,
  "penaltyAmount": 1.500  ← Penalty calculated!
}
```

---

### STEP 6: Check Penalty History

**Swagger:** `GET /api/penalties/history/{echeancierPayementId}`  
Replace `{echeancierPayementId}` with payment ID from Step 3

**Expected:**
```json
[
  {
    "calculationDate": "2026-03-29",
    "daysOverdue": 4,
    "penaltyAmount": 1.500,
    "previousPenaltyAmount": 0.000,
    "calculationMethod": "PERCENTAGE"
  }
]
```

---

## 📱 SMS Verification

### Check Console Logs

Look for one of these messages:

**If SMS sent successfully:**
```
SMS sent successfully to +216XXXXXXXX - SID: SMXXXXXXXXX
```

**If simulated (testing mode):**
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

### SMS Content (What User 2 Receives)

```
Bonjour [FirstName],

Votre paiement du 25/03/2026 est maintenant en retard.
Montant dû: 900.000 TND

Merci de régulariser votre situation rapidement pour éviter des pénalités supplémentaires.

Financia
```

---

## 🔍 Troubleshooting

### SMS Not Sent?

1. **Check application logs** for SMS-related messages
2. **Verify user 2 has phone number:**
   ```
   GET /api/users/2
   ```
   Look for `"phone": "+216XXXXXXXX"`

3. **Check Twilio credentials** are correct in application.properties

4. **Restart application** after updating properties

### Payment Not Marked Overdue?

- Verify `dueDate` is "2026-03-25" (in the past)
- Verify `status` is "PENDING" when created
- Check response from `/api/penalties/run-daily-job`

---

## ✅ Success Checklist

- [ ] Application restarted with new Twilio config
- [ ] Credit created for user 2
- [ ] Contract created with penalty config
- [ ] Payment created with past due date (March 25)
- [ ] **SMS automatically sent when payment created!** 📱
- [ ] Payment status automatically changed to OVERDUE
- [ ] Penalty calculated (optional step)
- [ ] SMS sent (check logs)

---

## 🎯 Quick Summary

**Total Steps:** 3 main API calls (+ 2 optional verification)  
**Expected Time:** 2-3 minutes  
**SMS Trigger:** ✨ **AUTOMATIC** when creating payment with past due date!  
**User Phone:** Must be valid Tunisian number (+216...)

**The system now automatically:**
1. Detects if dueDate is in the past
2. Changes status from PENDING → OVERDUE
3. Sends SMS immediately

**Ready to test? Start with Step 1!** 🚀
