export interface CreditRequest {
  amount: number;
  durationMonths: number;
  startDate?: string | null;
}

/** Corps PUT /api/credits/{id} — champs optionnels (aligné sur CreditServiceImpl#update). */
export interface CreditUpdateBody {
  amount?: number;
  durationMonths?: number;
  startDate?: string | null;
  endDate?: string | null;
  /** Le backend n’accepte que ACTIVE ou CLOSED pour une mise à jour manuelle. */
  status?: 'ACTIVE' | 'CLOSED';
}

export interface Credit {
  id: number;
  /** Présent sur les réponses admin / liste (voir {@code Credit#getUserId} côté Spring). */
  userId?: number;
  /** Prénom + nom du client (réponse admin). */
  clientName?: string | null;
  amount: number;
  durationMonths: number;
  interestRate?: number;
  riskScore?: number;
  status?: string;
  remainingAmount?: number;
  paidAmount?: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
  /** ISO instant — fin du délai pour répondre à l’offre (statut OFFER_PENDING). */
  offerExpiresAt?: string | null;
}

/** Réponse API GET /api/credits/user/{id}/blocking-info */
export interface BlockingCreditResponse {
  blocking: boolean;
  credit: Credit | null;
}
