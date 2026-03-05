-- Check if committed_amount column exists in fond table
SHOW COLUMNS FROM fond LIKE 'committed_amount';

-- Check Flyway migration history
SELECT * FROM flyway_schema_history ORDER BY installed_rank;

-- Check current fond table structure
DESCRIBE fond;

-- Check if there are any fonds
SELECT * FROM fond;
