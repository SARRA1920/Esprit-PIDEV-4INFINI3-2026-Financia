-- ============================================
-- MANUAL DATABASE MIGRATION SCRIPT
-- ============================================
-- This script applies all pending Flyway migrations manually
-- Run this in your MySQL client or workbench

USE Financia;

-- ============================================
-- V1: Add committed_amount to fond table
-- ============================================
ALTER TABLE fond
ADD COLUMN committed_amount DOUBLE DEFAULT 0.0 NOT NULL
COMMENT 'Total amount committed by partners to this fund';

CREATE INDEX idx_fond_committed_amount ON fond(committed_amount);

-- ============================================
-- V2: Add payment and default fields to partenaire_fond
-- ============================================
ALTER TABLE partenaire_fond
ADD COLUMN payment_date DATE NULL
COMMENT 'Date when payment was processed';

ALTER TABLE partenaire_fond
ADD COLUMN payment_amount DOUBLE NULL
COMMENT 'Amount paid by partner';

ALTER TABLE partenaire_fond
ADD COLUMN default_date DATE NULL
COMMENT 'Date when commitment was marked as defaulted';

CREATE INDEX idx_partenaire_fond_id_fond ON partenaire_fond(id_fond);
CREATE INDEX idx_partenaire_fond_id_partenaire ON partenaire_fond(id_partenaire);
CREATE INDEX idx_partenaire_fond_commitment_status ON partenaire_fond(commitment_status);

-- ============================================
-- V3: Create commitment_history table
-- ============================================
CREATE TABLE commitment_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    partenaire_fond_id BIGINT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    event_type VARCHAR(50) NOT NULL,
    payment_amount DOUBLE NULL,
    event_date DATE NULL,
    reason VARCHAR(500) NULL,
    recorded_at DATETIME(6) NOT NULL,
    
    CONSTRAINT fk_commitment_history_partenaire_fond
        FOREIGN KEY (partenaire_fond_id)
        REFERENCES partenaire_fond(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Immutable audit trail of all commitment changes';

CREATE INDEX idx_commitment_history_partenaire_fond_id 
    ON commitment_history(partenaire_fond_id);

CREATE INDEX idx_commitment_history_recorded_at 
    ON commitment_history(recorded_at);

CREATE INDEX idx_commitment_history_event_type 
    ON commitment_history(event_type);

CREATE INDEX idx_commitment_history_pf_recorded 
    ON commitment_history(partenaire_fond_id, recorded_at);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the migrations were applied successfully

-- Check fond table structure
DESCRIBE fond;

-- Check partenaire_fond table structure
DESCRIBE partenaire_fond;

-- Check commitment_history table exists
DESCRIBE commitment_history;

-- Show all tables
SHOW TABLES;
