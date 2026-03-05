# Quick Start - Testing Fund Management Features

## ⚠️ CRITICAL FIRST STEP: Apply Database Migrations

**The application will NOT work until you apply the database migrations!**

### Option 1: Use MySQL Workbench or Command Line
1. Open MySQL Workbench or your MySQL client
2. Connect to your database (localhost:3306, user: root, no password)
3. Open the file `apply_migrations_manually.sql` from the project root
4. Execute the entire script
5. Verify the changes were applied by running the verification queries at the end

### Option 2: Use Command Line (if mysql is in PATH)
```bash
mysql -u root -h localhost -P 3306 Financia < apply_migrations_manually.sql
```

### What These Migrations Do:
- Add `committed_amount` column to `fond` table
- Add `payment_date`, `payment_amount`, `default_date` columns to `partenaire_fond` table
- Create new `commitment_history` table for audit trail

**After applying migrations, restart the application!**

---

## ✅ Application Running
- **URL**: http://localhost:8083
- **Status**: Running
- **Authentication**: Not required

---

## 📍 Correct Endpoints

### Fund Allocation
```
GET  http://localhost:8083/api/fonds/{fondId}/allocation
GET  http://localhost:8083/api/fonds/{fondId}/metrics
```

### Commitment Lifecycle
```
POST http://localhost:8083/api/commitments/{partenaireFondId}/payment
POST http://localhost:8083/api/commitments/{partenaireFondId}/default
```

### Commitment History
```
GET  http://localhost:8083/api/commitments/{partenaireFondId}/history
```

---

## 🧪 Quick Test in Postman

### 1. First, check if you have any fonds:
```
GET http://localhost:8083/api/fonds
```

### 2. If you have fonds, test the allocation endpoint:
```
GET http://localhost:8083/api/fonds/1/metrics
```

### 3. If you get 404, create a test fond first:
```
POST http://localhost:8083/api/fonds
Content-Type: application/json

{
  "name": "Test Fund",
  "description": "Test fund for allocation",
  "amount": 1000000.0,
  "committedAmount": 0.0,
  "status": "AVAILABLE"
}
```

---

## ⚠️ Important Notes

- Use `/api/fonds` NOT `/api/funds`
- The path variable is `fondId` in the URL
- Make sure you have data in the database before testing allocation reports
- The `committedAmount` field must not be NULL

---

## 📖 Full Documentation

See `POSTMAN_TESTING_GUIDE.md` for complete testing scenarios and examples.
