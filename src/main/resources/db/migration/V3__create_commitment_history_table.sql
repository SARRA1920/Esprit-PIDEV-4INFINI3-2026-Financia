-- Create CommitmentHistory table for immutable audit trail
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

-- Add indexes for performance
CREATE INDEX idx_commitment_history_partenaire_fond_id 
    ON commitment_history(partenaire_fond_id);

CREATE INDEX idx_commitment_history_recorded_at 
    ON commitment_history(recorded_at);

CREATE INDEX idx_commitment_history_event_type 
    ON commitment_history(event_type);

-- Composite index for common query pattern (by partenaire_fond_id ordered by recorded_at)
CREATE INDEX idx_commitment_history_pf_recorded 
    ON commitment_history(partenaire_fond_id, recorded_at);
