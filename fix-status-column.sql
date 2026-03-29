-- Fix the status column size in echeancier_payement table
-- This allows storing "OVERDUE" status (7 characters)

-- Check current column definition
DESCRIBE echeancier_payement;

-- Alter the column to allow longer status values
ALTER TABLE echeancier_payement MODIFY COLUMN status VARCHAR(20) NOT NULL;

-- Verify the change
DESCRIBE echeancier_payement;

-- Update existing payments to use proper status
UPDATE echeancier_payement 
SET status = 'OVERDUE' 
WHERE due_date < CURDATE() AND status = 'PENDING';

-- Check the updated records
SELECT id, due_date, status, amount_due, penalty_amount 
FROM echeancier_payement;
