export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

/** Aligné sur l’entité Spring + champs JSON {@code creditId} / {@code clientName}. */
export interface Remboursement {
  id: number;
  creditId?: number;
  clientName?: string | null;
  amount: number;
  dueDate?: string | null;
  paymentDate?: string | null;
  lateDays?: number | null;
  status?: PaymentStatus | string;
  createdAt?: string | null;
}

export interface RemboursementUpdateBody {
  amount?: number;
  dueDate?: string | null;
  paymentDate?: string | null;
  lateDays?: number | null;
  status?: PaymentStatus | string;
}

export interface RemboursementCreateBody {
  amount: number;
  dueDate?: string | null;
}

/** Réponse POST /api/payments/stripe/checkout/remboursements/{id} */
export interface StripeCheckoutSessionDto {
  sessionId?: string;
  checkoutUrl?: string;
}
