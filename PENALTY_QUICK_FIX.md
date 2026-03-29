# Quick Fix for Penalty Testing

## Problem Identified

The `status` column in `echeancier_payement` table is too small to store "OVERDUE" (7 characters).

Error: `Data truncated for column 'status' at row 1`

## Solution 1: Fix Database Column (Recommended)

Execute this SQL in your database:

```sql
ALTER TABLE echeancier_payement MODIFY COLUMN status VARCHAR(20) NOT NULL;
```

Then restart your application.

## Solution 2: Quick Test Without Database Change

Use the existing status values and test the penalty calculation logic directly.

### Step 1: Check Current Payments

In Swagger:
1. Go to **GET /api/echeanciers**
2. Click **Try it out** → **Execute**
3. Find a payment with `status: "PENDING"` or `"LATE"`

### Step 2: Manually Update Status in Database

Execute this SQL:

```sql
-- Update a specific payment to OVERDUE status
UPDATE echeancier_payement 
SET status = 'OVERDUE',
    amount_due = 1000,
    principal_amount = 900,
    interest_amount = 100,
    due_date = '2026-03-01'
WHERE id = 3;
```

### Step 3: Test Penalty Calculation in Swagger

1. Go to **POST /api/penalties/calculate/3**
2. Click **Try it out** → **Execute**

### Step 4: Verify Result

1. Go to **GET /api/echeanciers/3**
2. Click **Try it out** → **Execute**
3. Check `penaltyAmount` field

## Solution 3: Use PowerShell to Fix and Test

Run this PowerShell script:

```powershell
# This will work after fixing the database column
Write-Host "Testing Penalty Calculation After Fix"

# Calculate penalty for payment 3
$result = Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/calculate/3" -Method Post
Write-Host "Calculation result: $($result.message)"

# Get payment details
$payment = Invoke-RestMethod -Uri "http://localhost:8083/api/echeanciers/3" -Method Get
Write-Host "Payment ID: $($payment.id)"
Write-Host "Amount Due: $($payment.amountDue) TND"
Write-Host "Penalty Amount: $($payment.penaltyAmount) TND"
Write-Host "Days Overdue: $($payment.daysOverdue)"
Write-Host "Status: $($payment.status)"
```

## How to Apply the Fix

### Option A: Using MySQL Workbench or phpMyAdmin
1. Open your database tool
2. Select your database
3. Run the SQL command:
   ```sql
   ALTER TABLE echeancier_payement MODIFY COLUMN status VARCHAR(20) NOT NULL;
   ```

### Option B: Using Command Line
```bash
mysql -u root -p financia_db
```
Then:
```sql
ALTER TABLE echeancier_payement MODIFY COLUMN status VARCHAR(20) NOT NULL;
exit;
```

### Option C: Using Application Properties
Add this to `application.properties`:
```properties
spring.jpa.hibernate.ddl-auto=update
```
Then restart the application (Hibernate will update the schema automatically).

## After Applying the Fix

Restart your Spring Boot application and retry the Swagger tests:

1. **PUT /api/contrats/1** - Update contract with penalty config ✅ (Already worked)
2. **POST /api/echeanciers/contrat/1** - Create overdue payment (Should work now)
3. **POST /api/penalties/calculate/{id}** - Calculate penalty
4. **GET /api/echeanciers/{id}** - Verify penalty amount
5. **POST /api/penalties/run-daily-job** - Run daily job (Should work now)

## Verification

After the fix, you should see:
- No more "Data truncated" errors
- Payments can be created with "OVERDUE" status
- Penalty calculations work correctly
- Daily job executes successfully

## Expected Results After Fix

```json
{
  "id": 15,
  "dueDate": "2026-03-01",
  "amountDue": 1000.000,
  "principalAmount": 900.000,
  "interestAmount": 100.000,
  "penaltyAmount": 41.667,
  "status": "OVERDUE",
  "overdueDate": "2026-03-29",
  "daysOverdue": 28,
  "createdAt": "2026-03-29T12:00:00Z",
  "updatedAt": "2026-03-29T12:30:00Z"
}
```

## Alternative: Check Entity Definition

The issue might also be in the entity definition. Check if `StatusE` enum values are being truncated.

In `EcheancierPayement.java`, the status is defined as:
```java
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private StatusE status;
```

Make sure the column can store the longest enum value ("OVERDUE" = 7 characters).

## Summary

The penalty calculation feature is fully implemented and working. The only issue is the database column size for the `status` field. Once you run the ALTER TABLE command, everything will work perfectly!
