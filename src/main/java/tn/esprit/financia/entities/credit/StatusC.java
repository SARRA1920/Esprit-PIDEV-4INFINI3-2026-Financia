package tn.esprit.financia.entities.credit;

public enum StatusC {
    PENDING,
    /** Offre automatique émise — en attente de réponse client avant la date limite. */
    OFFER_PENDING,
    APPROVED,
    REJECTED,
    ACTIVE,
    CLOSED
}

