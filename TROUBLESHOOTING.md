# Troubleshooting Guide - Fund Management Features

## Problem: All API endpoints return 500 Internal Server Error

### Root Cause
The database schema doesn't match the entity definitions because Flyway migrations haven't been applied.

### Solution
Apply the database migrations manually:

1. **Stop the application** (if running)

2. **Apply migrations using one of these methods:**

   **Method A: MySQL Workbench**
   - Open MySQL Workbench
   - Connect to localhost:3306 (user: root, no password)
   - Select the `Financia` database
   - Open `apply_migrations_manually.sql`
   - Click "Execute" (lightning bolt icon)
   - Check for success messages

   **Method B: Command Line** (if mysql is in PATH)
   ```bash
   mysql -u root -h localhost -P 3306 Financia < apply_migrations_manually.sql
   ```

3. **Verify migrations were applied:**
   ```sql
   USE Financia;
   
   -- Check fond table has committed_amount column
   DESCRIBE fond;
   
   -- Check partenaire_fond has new columns
   DESCRIBE partenaire_fond;
   
   -- Check commitment_history table exists
   DESCRIBE commitment_history;
   ```

4. **Restart the application:**
   ```bash
   mvn spring-boot:run
   ```

5. **Test an endpoint:**
   ```
   GET http://localhost:8083/api/fonds
   ```

---

## Problem: Postman returns 400 Bad Request

### Possible Causes

1. **URL has newline characters**
   - Check your Postman URL field for `%0A` or line breaks
   - Copy-paste can sometimes introduce hidden characters
   - **Solution**: Retype the URL manually in Postman

2. **Wrong endpoint path**
   - Use `/api/fonds` NOT `/api/funds`
   - **Solution**: Verify the correct endpoint from POSTMAN_TESTING_GUIDE.md

3. **Missing or invalid JSON body**
   - For POST requests, ensure Content-Type is `application/json`
   - Validate your JSON syntax
   - **Solution**: Check the example payloads in POSTMAN_TESTING_GUIDE.md

---

## Problem: Postman returns 404 Not Found

### Possible Causes

1. **Wrong fondId or partenaireFondId**
   - The ID doesn't exist in the database
   - **Solution**: First run `GET http://localhost:8083/api/fonds` to see available IDs

2. **Wrong endpoint path**
   - Check for typos in the URL
   - **Solution**: Copy the exact URL from POSTMAN_TESTING_GUIDE.md

---

## Problem: Application won't start

### Check These:

1. **Port 8083 already in use**
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :8083
   ```
   **Solution**: Kill the process or change the port in application.properties

2. **MySQL not running**
   - Check if MySQL service is running
   - **Solution**: Start MySQL service

3. **Database connection error**
   - Verify MySQL is on localhost:3306
   - Verify database name is `Financia`
   - Verify username is `root` with no password
   - **Solution**: Update application.properties if your setup is different

---

## Problem: Flyway migrations not running automatically

### Why This Happens
Flyway might fail silently if:
- The database user doesn't have ALTER TABLE permissions
- There's a syntax error in migration files
- The flyway_schema_history table is corrupted

### Solution
Apply migrations manually using `apply_migrations_manually.sql` as described above.

---

## Verification Checklist

After applying migrations, verify everything is working:

- [ ] Application starts without errors
- [ ] `GET http://localhost:8083/api/fonds` returns 200 OK
- [ ] Database has `committed_amount` column in `fond` table
- [ ] Database has `payment_date`, `payment_amount`, `default_date` in `partenaire_fond` table
- [ ] Database has `commitment_history` table
- [ ] Can create a new fond with `committedAmount: 0.0`
- [ ] Can get allocation metrics for a fond

---

## Still Having Issues?

1. Check the application logs in the terminal where you ran `mvn spring-boot:run`
2. Look for SQL errors or constraint violations
3. Verify your database schema matches the entity definitions
4. Check that you're using the correct endpoint paths (`/api/fonds` not `/api/funds`)
