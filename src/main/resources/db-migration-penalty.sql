-- Database Migration for Penalty Feature
-- Execute this SQL script to ensure all columns are properly sized

-- Fix status column size to accommodate "OVERDUE" (7 characters)
ALTER TABLE echeancier_payement MODIFY COLUMN status VARCHAR(20) NOT NULL;

-- Verify the change
DESCRIBE echeancier_payement;

-- Optional: Update any existing payments with truncated status
UPDATE echeancier_payement 
SET status = 'OVERDUE' 
WHERE status = 'OVERDUEOVERDUE' OR LENGTH(status) > 7;

-- Show current payments
SELECT id, due_date, status, amount_due, penalty_amount, days_overdue 
FROM echeancier_payement 
LIMIT 10;
