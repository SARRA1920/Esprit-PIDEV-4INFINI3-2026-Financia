# Postman Testing Guide - Fund Management Enhancements

## Application Info
- **Base URL**: `http://localhost:8083`
- **Authentication**: Not required (all `/api/**` endpoints are public)
- **Status**: ✅ Application is running

---

## 1. Fund Allocation Endpoints

### 1.1 Get Fund Allocation Report
**GET** `http://localhost:8083/api/fonds/{fondId}/allocation`

**Description**: Get detailed allocation report for a specific fund

**Example**:
```
GET http://localhost:8083/api/fonds/1/allocation
```

**Expected Response** (200 OK):
```json
{
  "fundId": 1,
  "fundName": "Tech Innovation Fund",
  "totalAmount": 1000000.0,
  "committedAmount": 750000.0,
  "allocationPercentage": 75.0,
  "remainingCapacity": 250000.0,
  "status": "AVAILABLE",
  "partners": [
    {
      "partnerId": 1,
      "partnerName": "Partner A",
      "committedAmount": 500000.0,
      "commitmentStatus": "PAID",
      "commitmentDate": "2024-01-15"
    }
  ]
}
```

---

## 2. Commitment Lifecycle Endpoints

### 2.1 Process Payment
**POST** `http://localhost:8083/api/commitments/{partenaireFondId}/payment`

**Description**: Mark a commitment as paid and record payment details

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "paymentAmount": 500000.0,
  "paymentDate": "2024-03-05"
}
```

**Example**:
```
POST http://localhost:8083/api/commitments/1/payment
```

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "partenaire": { ... },
  "fond": { ... },
  "committedAmount": 500000.0,
  "commitmentStatus": "PAID",
  "paymentAmount": 500000.0,
  "paymentDate": "2024-03-05",
  "commitmentDate": "2024-01-15"
}
```

**Validation Errors** (400 Bad Request):
- Payment amount must be positive
- Payment date is required

---

### 2.2 Mark as Defaulted
**POST** `http://localhost:8083/api/commitments/{partenaireFondId}/default`

**Description**: Mark a commitment as defaulted

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "defaultDate": "2024-03-05",
  "reason": "Payment not received after 90 days"
}
```

**Example**:
```
POST http://localhost:8083/api/commitments/2/default
```

**Expected Response** (200 OK):
```json
{
  "id": 2,
  "partenaire": { ... },
  "fond": { ... },
  "committedAmount": 250000.0,
  "commitmentStatus": "DEFAULTED",
  "defaultDate": "2024-03-05",
  "commitmentDate": "2024-02-01"
}
```

---

## 3. Commitment History Endpoints

### 3.1 Get Commitment History
**GET** `http://localhost:8083/api/commitments/{partenaireFondId}/history`

**Description**: Get complete history of status changes for a commitment

**Example**:
```
GET http://localhost:8083/api/commitments/1/history
```

**Expected Response** (200 OK):
```json
[
  {
    "id": 1,
    "partenaireFond": { ... },
    "previousStatus": "COMMITTED",
    "newStatus": "PAID",
    "changeDate": "2024-03-05T10:30:00",
    "changeReason": "Payment processed",
    "changedBy": "system"
  },
  {
    "id": 2,
    "partenaireFond": { ... },
    "previousStatus": null,
    "newStatus": "COMMITTED",
    "changeDate": "2024-01-15T09:00:00",
    "changeReason": "Initial commitment",
    "changedBy": "admin"
  }
]
```

---

## 4. Testing Workflow

### Step 1: Create Test Data (if needed)

First, ensure you have funds and partners in the database. You can use existing endpoints:

**Create a Fund**:
```
POST http://localhost:8083/api/fonds
Content-Type: application/json

{
  "name": "Green Energy Fund",
  "description": "Investment in renewable energy",
  "amount": 2000000.0,
  "status": "AVAILABLE"
}
```

**Create a Partner**:
```
POST http://localhost:8083/api/partenaires
Content-Type: application/json

{
  "name": "EcoInvest Corp",
  "type": "INVESTOR",
  "email": "contact@ecoinvest.com",
  "phone": "+1234567890",
  "address": "123 Green St",
  "website": "www.ecoinvest.com",
  "status": "ACTIVE"
}
```

**Create a Commitment** (PartenaireFond):
```
POST http://localhost:8083/api/partenaire-fonds
Content-Type: application/json

{
  "partenaire": { "idPartenaire": 1 },
  "fond": { "idFond": 1 },
  "committedAmount": 500000.0,
  "commitmentStatus": "COMMITTED",
  "commitmentDate": "2024-03-05"
}
```

### Step 2: Test Fund Allocation Report

```
GET http://localhost:8083/api/fonds/1/allocation
```

This should show the fund's allocation status and list of partners.

You can also get just the metrics:
```
GET http://localhost:8083/api/fonds/1/metrics
```

### Step 3: Process a Payment

```
POST http://localhost:8083/api/commitments/1/payment
Content-Type: application/json

{
  "paymentAmount": 500000.0,
  "paymentDate": "2024-03-05"
}
```

### Step 4: Check History

```
GET http://localhost:8083/api/commitments/1/history
```

You should see a history entry showing the status change from COMMITTED to PAID.

### Step 5: Check Updated Allocation Report

```
GET http://localhost:8083/api/fonds/1/allocation
```

The report should now show the updated commitment status as PAID.

---

## 5. Error Scenarios to Test

### 5.1 Invalid Fund ID
```
GET http://localhost:8083/api/fonds/99999/allocation
```
**Expected**: 404 Not Found

### 5.2 Invalid Commitment ID
```
POST http://localhost:8083/api/commitments/99999/payment
```
**Expected**: 404 Not Found

### 5.3 Invalid Payment Amount
```
POST http://localhost:8083/api/commitments/1/payment
Content-Type: application/json

{
  "paymentAmount": -100.0,
  "paymentDate": "2024-03-05"
}
```
**Expected**: 400 Bad Request with validation error

### 5.4 Missing Required Fields
```
POST http://localhost:8083/api/commitments/1/payment
Content-Type: application/json

{
  "paymentAmount": 500000.0
}
```
**Expected**: 400 Bad Request (missing paymentDate)

---

## 6. Advanced Testing Scenarios

### 6.1 Test Fund Status Auto-Update

1. Create a fund with amount = 1,000,000
2. Create commitments totaling 1,000,000
3. Check allocation report - status should be FULLY_ALLOCATED

### 6.2 Test Commitment Immutability

1. Create a commitment and mark it as PAID
2. Try to mark the same commitment as DEFAULTED
3. Should fail with InvalidStatusTransitionException

### 6.3 Test History Tracking

1. Create a commitment (COMMITTED)
2. Mark as PAID
3. Check history - should have 2 entries
4. Each entry should have correct previousStatus and newStatus

---

## 7. Postman Collection Import

You can create a Postman collection with these requests. Here's a sample structure:

```
Financia - Fund Management
├── Fund Allocation
│   ├── Get Allocation Report
│   └── Get Allocation Metrics
├── Commitment Lifecycle
│   ├── Process Payment
│   └── Mark as Defaulted
└── Commitment History
    └── Get History
```

---

## 8. Common Issues & Solutions

### Issue: Connection Refused
**Solution**: Ensure the application is running on port 8083

### Issue: 404 Not Found
**Solution**: Check that the fund/commitment ID exists in the database

### Issue: 400 Bad Request
**Solution**: Verify request body matches the expected format and all required fields are present

### Issue: 500 Internal Server Error
**Solution**: Check application logs for detailed error messages

---

## 9. Database Verification

After testing, you can verify the changes in the database:

```sql
-- Check fund committed amounts
SELECT id_fond, name, amount, committed_amount, status 
FROM fond;

-- Check commitment statuses
SELECT id, id_partenaire, id_fond, committed_amount, 
       commitment_status, payment_date, payment_amount 
FROM partenaire_fond;

-- Check commitment history
SELECT * FROM commitment_history 
ORDER BY change_date DESC;
```

---

## Notes

- All endpoints return JSON responses
- Dates should be in ISO format: `YYYY-MM-DD`
- Amounts are in double precision
- The application automatically tracks history for all status changes
- Fund status is automatically updated based on committed amounts
