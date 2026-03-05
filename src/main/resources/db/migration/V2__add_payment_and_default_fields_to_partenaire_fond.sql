-- Add payment tracking fields to PartenaireFond table
ALTER TABLE partenaire_fond
ADD COLUMN payment_date DATE NULL
COMMENT 'Date when payment was processed';

ALTER TABLE partenaire_fond
ADD COLUMN payment_amount DOUBLE NULL
COMMENT 'Amount paid by partner';

ALTER TABLE partenaire_fond
ADD COLUMN default_date DATE NULL
COMMENT 'Date when commitment was marked as defaulted';

-- Add indexes on foreign keys for performance
CREATE INDEX idx_partenaire_fond_id_fond ON partenaire_fond(id_fond);
CREATE INDEX idx_partenaire_fond_id_partenaire ON partenaire_fond(id_partenaire);

-- Add index on commitment_status for filtering queries
CREATE INDEX idx_partenaire_fond_commitment_status ON partenaire_fond(commitment_status);
