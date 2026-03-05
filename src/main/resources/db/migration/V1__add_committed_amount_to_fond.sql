-- Add committedAmount column to Fond table
ALTER TABLE fond
ADD COLUMN committed_amount DOUBLE DEFAULT 0.0 NOT NULL
COMMENT 'Total amount committed by partners to this fund';

-- Add index on committed_amount for performance
CREATE INDEX idx_fond_committed_amount ON fond(committed_amount);
