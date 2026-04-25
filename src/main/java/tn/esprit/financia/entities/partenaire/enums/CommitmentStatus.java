package tn.esprit.financia.entities.partenaire.enums;

public enum CommitmentStatus {
    PENDING,      // Initial state when commitment is created
    COMMITTED,    // Commitment is committed (same as ACTIVE)
    ACTIVE,       // Commitment is active
    PAID,         // Payment has been processed
    DEFAULTED,    // Commitment has defaulted
    COMPLETED,    // Commitment completed successfully
    CANCELLED     // Commitment was cancelled
}