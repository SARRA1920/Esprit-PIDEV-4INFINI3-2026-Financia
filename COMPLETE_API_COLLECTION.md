# Complete API Collection - Financia Application

Base URL: `http://localhost:8083`

---

## 1. FOND APIs (`/api/fonds`)

### 1.1 Get All Fonds
```
GET http://localhost:8083/api/fonds
```

### 1.2 Get Fond by ID
```
GET http://localhost:8083/api/fonds/1
```

### 1.3 Create Fond
```
POST http://localhost:8083/api/fonds
Content-Type: application/json

{
  "name": "Investment Fund A",
  "description": "A fund for high-growth investments",
  "amount": 1000000.0,
  "committedAmount": 0.0,
  "status": "AVAILABLE"
}
```

### 1.4 Update Fond
```
PUT http://localhost:8083/api/fonds/1
Content-Type: application/json

{
  "name": "Updated Investment Fund A",
  "description": "Updated description",
  "amount": 1500000.0,
  "committedAmount": 500000.0,
  "status": "AVAILABLE"
}
```

### 1.5 Delete Fond
```
DELETE http://localhost:8083/api/fonds/1
```

### 1.6 Get Fonds by Status
```
GET http://localhost:8083/api/fonds/status/AVAILABLE
GET http://localhost:8083/api/fonds/status/FULLY_ALLOCATED
GET http://localhost:8083/api/fonds/status/CLOSED
```

### 1.7 Get Available Fonds
```
GET http://localhost:8083/api/fonds/available
```

### 1.8 Search Fonds
```
GET http://localhost:8083/api/fonds/search?name=investment
GET http://localhost:8083/api/fonds/search?minAmount=100000&maxAmount=500000
GET http://localhost:8083/api/fonds/search?name=fund&minAmount=50000
```

### 1.9 Get Fond Partners
```
GET http://localhost:8083/api/fonds/1/partners
```

### 1.10 Get Fond Statistics
```
GET http://localhost:8083/api/fonds/statistics
```

### 1.11 Get Fond Allocation Report
```
GET http://localhost:8083/api/fonds/1/allocation
```

### 1.12 Get Fond Metrics
```
GET http://localhost:8083/api/fonds/1/metrics
```

---

## 2. PARTENAIRE APIs (`/api/partenaires`)

### 2.1 Get All Partenaires
```
GET http://localhost:8083/api/partenaires
```

### 2.2 Get Partenaire by ID
```
GET http://localhost:8083/api/partenaires/1
```

### 2.3 Create Partenaire
```
POST http://localhost:8083/api/partenaires
Content-Type: application/json

{
  "name": "ABC Bank",
  "type": "BANK",
  "email": "contact@abcbank.com",
  "phone": "123-456-7890",
  "address": "123 Bank Street, City",
  "website": "http://www.abcbank.com",
  "status": "ACTIVE"
}
```

**Available Types**: `BANK`, `MICROFINANCE`, `GOVERNMENT_AGENCY`, `NGO`, `PRIVATE_INVESTOR`

**Available Status**: `ACTIVE`, `INACTIVE`, `PENDING_APPROVAL`

### 2.4 Update Partenaire
```
PUT http://localhost:8083/api/partenaires/1
Content-Type: application/json

{
  "name": "ABC Bank Updated",
  "type": "BANK",
  "email": "newcontact@abcbank.com",
  "phone": "123-456-7890",
  "address": "456 New Street, City",
  "website": "http://www.abcbank.com",
  "status": "ACTIVE"
}
```

### 2.5 Delete Partenaire
```
DELETE http://localhost:8083/api/partenaires/1
```

### 2.6 Get Partenaires by Type
```
GET http://localhost:8083/api/partenaires/type/BANK
GET http://localhost:8083/api/partenaires/type/NGO
GET http://localhost:8083/api/partenaires/type/PRIVATE_INVESTOR
```

### 2.7 Get Partenaires by Status
```
GET http://localhost:8083/api/partenaires/status/ACTIVE
GET http://localhost:8083/api/partenaires/status/INACTIVE
GET http://localhost:8083/api/partenaires/status/PENDING_APPROVAL
```

### 2.8 Get Active Partenaires
```
GET http://localhost:8083/api/partenaires/active
```

### 2.9 Search Partenaires
```
GET http://localhost:8083/api/partenaires/search?name=bank
GET http://localhost:8083/api/partenaires/search?email=contact
GET http://localhost:8083/api/partenaires/search?name=abc&email=bank
```

### 2.10 Get Partenaire Funds
```
GET http://localhost:8083/api/partenaires/1/funds
```

### 2.11 Get Partenaire Performance Metrics
```
GET http://localhost:8083/api/partenaires/1/performance
```

### 2.12 Update Partenaire Status
```
PUT http://localhost:8083/api/partenaires/1/status
```

### 2.13 Get Partenaire Statistics
```
GET http://localhost:8083/api/partenaires/statistics
```

---

## 3. PARTENAIRE-FOND APIs (`/api/partenaire-fonds`)

### 3.1 Get All PartenaireFonds
```
GET http://localhost:8083/api/partenaire-fonds
```

### 3.2 Get PartenaireFond by ID
```
GET http://localhost:8083/api/partenaire-fonds/1
```

### 3.3 Create PartenaireFond (Commitment)
```
POST http://localhost:8083/api/partenaire-fonds
Content-Type: application/json

{
  "partenaire": {
    "idPartenaire": 4
  },
  "fond": {
    "idFond": 4
  },
  "committedAmount": 50000.0,
  "commitmentDate": "2023-01-15",
  "commitmentStatus": "COMMITTED"
}
```

**Available Commitment Status**: `PENDING`, `COMMITTED`, `ACTIVE`, `PAID`, `DEFAULTED`, `COMPLETED`, `CANCELLED`

### 3.4 Update PartenaireFond
```
PUT http://localhost:8083/api/partenaire-fonds/1
Content-Type: application/json

{
  "partenaire": {
    "idPartenaire": 4
  },
  "fond": {
    "idFond": 4
  },
  "committedAmount": 75000.0,
  "commitmentDate": "2023-01-15",
  "commitmentStatus": "PAID",
  "paymentAmount": 75000.0,
  "paymentDate": "2023-02-01"
}
```

### 3.5 Delete PartenaireFond
```
DELETE http://localhost:8083/api/partenaire-fonds/1
```

### 3.6 Get PartenaireFonds by Fond
```
GET http://localhost:8083/api/partenaire-fonds/fond/1
```

### 3.7 Get PartenaireFonds by Partenaire
```
GET http://localhost:8083/api/partenaire-fonds/partenaire/1
```

### 3.8 Get PartenaireFonds by Status
```
GET http://localhost:8083/api/partenaire-fonds/status/COMMITTED
GET http://localhost:8083/api/partenaire-fonds/status/PAID
GET http://localhost:8083/api/partenaire-fonds/status/DEFAULTED
```

### 3.9 Get Committed PartenaireFonds
```
GET http://localhost:8083/api/partenaire-fonds/committed
```

### 3.10 Get Paid PartenaireFonds
```
GET http://localhost:8083/api/partenaire-fonds/paid
```

### 3.11 Get Defaulted PartenaireFonds
```
GET http://localhost:8083/api/partenaire-fonds/defaulted
```

### 3.12 Get PartenaireFond Statistics
```
GET http://localhost:8083/api/partenaire-fonds/statistics
```

---

## 4. COMMITMENT LIFECYCLE APIs (`/api/commitments`)

### 4.1 Process Payment
```
POST http://localhost:8083/api/commitments/1/payment
Content-Type: application/json

{
  "paymentAmount": 50000.0,
  "paymentDate": "2023-02-15"
}
```

### 4.2 Mark as Defaulted
```
POST http://localhost:8083/api/commitments/1/default
Content-Type: application/json

{
  "defaultDate": "2023-03-01",
  "reason": "Partner failed to meet payment obligations"
}
```

### 4.3 Get Commitment History
```
GET http://localhost:8083/api/commitments/1/history
```

---

## 5. CREDIT APIs (`/api/credits`)

### 5.1 Get All Credits
```
GET http://localhost:8083/api/credits
```

### 5.2 Get Credit by ID
```
GET http://localhost:8083/api/credits/1
```

### 5.3 Create Credit for User
```
POST http://localhost:8083/api/credits/user/1
Content-Type: application/json

{
  "amount": 10000.0,
  "interestRate": 5.5,
  "duration": 12,
  "statusC": "PENDING"
}
```

### 5.4 Get Credits by User
```
GET http://localhost:8083/api/credits/user/1
```

---

## 6. REMBOURSEMENT APIs (`/api/remboursements`)

### 6.1 Get All Remboursements
```
GET http://localhost:8083/api/remboursements
```

### 6.2 Get Remboursement by ID
```
GET http://localhost:8083/api/remboursements/1
```

### 6.3 Create Remboursement for Credit
```
POST http://localhost:8083/api/remboursements/credit/1
Content-Type: application/json

{
  "amount": 1000.0,
  "paymentDate": "2023-02-01",
  "paymentStatus": "COMPLETED"
}
```

### 6.4 Get Remboursements by Credit
```
GET http://localhost:8083/api/remboursements/credit/1
```

---

## 7. USER APIs (`/api/users`)

### 7.1 Create User
```
POST http://localhost:8083/api/users
Content-Type: application/json

{
  "username": "john.doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "USER"
}
```

### 7.2 Update User
```
PUT http://localhost:8083/api/users/1
Content-Type: application/json

{
  "username": "john.doe.updated",
  "email": "john.updated@example.com",
  "password": "newPassword123",
  "role": "ADMIN"
}
```

### 7.3 Get User by ID
```
GET http://localhost:8083/api/users/1
```

### 7.4 Delete User
```
DELETE http://localhost:8083/api/users/1
```

---

## Testing Workflow Example

### Step 1: Create a Fond
```
POST http://localhost:8083/api/fonds
{
  "name": "Tech Innovation Fund",
  "description": "Fund for technology startups",
  "amount": 500000.0,
  "committedAmount": 0.0,
  "status": "AVAILABLE"
}
```
Response: `{ "idFond": 1, ... }`

### Step 2: Create a Partenaire
```
POST http://localhost:8083/api/partenaires
{
  "name": "Venture Capital Partners",
  "type": "PRIVATE_INVESTOR",
  "email": "contact@vcp.com",
  "phone": "555-1234",
  "address": "100 VC Street",
  "website": "http://www.vcp.com",
  "status": "ACTIVE"
}
```
Response: `{ "idPartenaire": 1, ... }`

### Step 3: Create a Commitment
```
POST http://localhost:8083/api/partenaire-fonds
{
  "partenaire": { "idPartenaire": 1 },
  "fond": { "idFond": 1 },
  "committedAmount": 100000.0,
  "commitmentDate": "2023-01-15",
  "commitmentStatus": "COMMITTED"
}
```
Response: `{ "id": 1, ... }`

### Step 4: Check Fond Metrics
```
GET http://localhost:8083/api/fonds/1/metrics
```
Response shows updated `committedAmount` and `allocationPercentage`

### Step 5: Process Payment
```
POST http://localhost:8083/api/commitments/1/payment
{
  "paymentAmount": 100000.0,
  "paymentDate": "2023-02-01"
}
```

### Step 6: View Commitment History
```
GET http://localhost:8083/api/commitments/1/history
```

---

## Response Examples

### Fond Statistics Response
```json
{
  "totalFonds": 5,
  "availableFonds": 3,
  "fullyAllocatedFonds": 1,
  "closedFonds": 1,
  "totalAmount": 5000000.0,
  "totalCommitted": 2500000.0,
  "totalRemaining": 2500000.0
}
```

### Partenaire Statistics Response
```json
{
  "totalPartenaires": 10,
  "activePartenaires": 8,
  "inactivePartenaires": 1,
  "pendingPartenaires": 1,
  "banks": 3,
  "microfinance": 2,
  "governmentAgencies": 1,
  "ngos": 2,
  "privateInvestors": 2
}
```

### PartenaireFond Statistics Response
```json
{
  "totalCommitments": 15,
  "committedCount": 8,
  "paidCount": 5,
  "defaultedCount": 2,
  "totalCommittedAmount": 1500000.0,
  "totalPaidAmount": 800000.0,
  "totalDefaultedAmount": 200000.0
}
```

---

## Notes

- All endpoints return JSON responses
- Authentication is not required (configured to permit all `/api/**` requests)
- Date format: `YYYY-MM-DD`
- All amounts are in double format
- Status and type values are case-sensitive enums


---

## 8. ADVANCED FOND UTILITY APIs

### 8.1 Get Top Allocated Fonds
```
GET http://localhost:8083/api/fonds/top-allocated?limit=5
```
Returns fonds with highest committed amounts

### 8.2 Get Under-Allocated Fonds
```
GET http://localhost:8083/api/fonds/under-allocated?threshold=50
```
Returns fonds with allocation percentage below threshold

### 8.3 Get Nearly Full Fonds
```
GET http://localhost:8083/api/fonds/nearly-full?threshold=90
```
Returns fonds with allocation percentage above threshold

### 8.4 Get Fond Utilization Details
```
GET http://localhost:8083/api/fonds/1/utilization
```
Returns detailed utilization metrics for a specific fond

### 8.5 Close Fond
```
PUT http://localhost:8083/api/fonds/1/close
```
Manually close a fond (no more commitments allowed)

### 8.6 Reopen Fond
```
PUT http://localhost:8083/api/fonds/1/reopen
```
Reopen a closed fond

---

## 9. ADVANCED PARTENAIRE UTILITY APIs

### 9.1 Get Top Contributors
```
GET http://localhost:8083/api/partenaires/top-contributors?limit=10
```
Returns partners with highest total commitments

### 9.2 Get Partner Commitment Summary
```
GET http://localhost:8083/api/partenaires/1/commitment-summary
```
Returns detailed commitment breakdown for a partner

### 9.3 Get Inactive Partners
```
GET http://localhost:8083/api/partenaires/inactive-partners?daysInactive=90
```
Returns partners with no commitments in the last X days

### 9.4 Activate Partner
```
PUT http://localhost:8083/api/partenaires/1/activate
```
Change partner status to ACTIVE

### 9.5 Deactivate Partner
```
PUT http://localhost:8083/api/partenaires/1/deactivate
```
Change partner status to INACTIVE

---

## 10. ADVANCED PARTENAIREFOND UTILITY APIs

### 10.1 Get Pending Payments
```
GET http://localhost:8083/api/partenaire-fonds/pending-payments
```
Returns all commitments awaiting payment

### 10.2 Get Overdue Payments
```
GET http://localhost:8083/api/partenaire-fonds/overdue-payments?daysOverdue=30
```
Returns commitments overdue by X days

### 10.3 Get Recent Payments
```
GET http://localhost:8083/api/partenaire-fonds/recent-payments?days=30
```
Returns payments made in the last X days

### 10.4 Get Commitments by Date Range
```
GET http://localhost:8083/api/partenaire-fonds/by-date-range?startDate=2023-01-01&endDate=2023-12-31
```
Returns commitments within date range

### 10.5 Get Payment Summary
```
GET http://localhost:8083/api/partenaire-fonds/payment-summary
```
Returns comprehensive payment statistics including rates

### 10.6 Get Commitment Timeline
```
GET http://localhost:8083/api/partenaire-fonds/1/timeline
```
Returns detailed timeline for a specific commitment

---

## Response Examples for New APIs

### Fond Utilization Response
```json
{
  "fondId": 1,
  "fondName": "Tech Innovation Fund",
  "totalAmount": 500000.0,
  "committedAmount": 350000.0,
  "remainingCapacity": 150000.0,
  "utilizationRate": 70.0,
  "totalPartners": 5,
  "activeCommitments": 3,
  "paidCommitments": 2,
  "defaultedCommitments": 0
}
```

### Top Contributors Response
```json
[
  {
    "partenaireId": 1,
    "partenaireName": "ABC Bank",
    "type": "BANK",
    "totalCommitted": 500000.0,
    "fundCount": 3
  },
  {
    "partenaireId": 2,
    "partenaireName": "XYZ Investor",
    "type": "PRIVATE_INVESTOR",
    "totalCommitted": 350000.0,
    "fundCount": 2
  }
]
```

### Payment Summary Response
```json
{
  "totalCommitments": 25,
  "pendingPayments": 10,
  "completedPayments": 12,
  "defaultedPayments": 3,
  "pendingAmount": 500000.0,
  "completedAmount": 800000.0,
  "defaultedAmount": 150000.0,
  "paymentRate": 48.0,
  "defaultRate": 12.0
}
```

### Commitment Timeline Response
```json
{
  "commitmentId": 1,
  "partnerName": "ABC Bank",
  "fundName": "Tech Innovation Fund",
  "committedAmount": 100000.0,
  "commitmentDate": "2023-01-15",
  "paymentDate": "2023-02-20",
  "defaultDate": null,
  "currentStatus": "PAID",
  "daysSinceCommitment": 45,
  "daysToPayment": 36
}
```

### Partner Commitment Summary Response
```json
{
  "partenaireId": 1,
  "partenaireName": "ABC Bank",
  "totalCommitted": 500000.0,
  "totalPaid": 300000.0,
  "totalPending": 150000.0,
  "totalDefaulted": 50000.0,
  "totalCommitments": 5,
  "activeFunds": 2
}
```

---

## Use Cases for New APIs

### 1. Fund Manager Dashboard
- `GET /api/fonds/statistics` - Overview metrics
- `GET /api/fonds/nearly-full` - Funds needing attention
- `GET /api/fonds/under-allocated` - Funds needing promotion

### 2. Payment Tracking
- `GET /api/partenaire-fonds/pending-payments` - Track unpaid commitments
- `GET /api/partenaire-fonds/overdue-payments` - Identify late payments
- `GET /api/partenaire-fonds/payment-summary` - Overall payment health

### 3. Partner Management
- `GET /api/partenaires/top-contributors` - Identify key partners
- `GET /api/partenaires/inactive-partners` - Re-engage dormant partners
- `GET /api/partenaires/{id}/commitment-summary` - Partner performance review

### 4. Reporting & Analytics
- `GET /api/partenaire-fonds/by-date-range` - Period-based reports
- `GET /api/fonds/{id}/utilization` - Fund performance analysis
- `GET /api/partenaire-fonds/{id}/timeline` - Commitment lifecycle tracking
