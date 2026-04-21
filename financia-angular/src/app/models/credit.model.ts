export interface CreditRequest {
  amount: number;
  durationMonths: number;
  startDate?: string | null;
}

/** Statuts qui bloquent une nouvelle demande (aligné sur CreditServiceImpl). */
export const CREDIT_STATUSES_BLOCKING_NEW_REQUEST: ReadonlyArray<string> = [
  'PENDING',
  'APPROVED',
  'ACTIVE',
];

export interface Credit {
  id: number;
  amount: number;
  durationMonths: number;
  interestRate?: number;
  riskScore?: number;
  status?: string;
  remainingAmount?: number;
  paidAmount?: number;
  startDate?: string;
  endDate?: string;
}

export function findBlockingCredit(credits: Credit[]): Credit | undefined {
  return credits.find((c) =>
    CREDIT_STATUSES_BLOCKING_NEW_REQUEST.includes(String(c.status ?? '').toUpperCase())
  );
}

/** Réponse API GET /api/credits/user/{id}/blocking-info */
export interface BlockingCreditResponse {
  blocking: boolean;
  credit: Credit | null;
}
