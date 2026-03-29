package tn.esprit.financia.entities.enums;

public enum PenaltyType {
    PERCENTAGE,  // Penalty as % of amount due (e.g., 5% monthly)
    FIXED,       // Fixed amount per day (e.g., 10 TND per day)
    TIERED       // Different rates based on days overdue
}
