export interface EcheancierPayement {
  id: number;
  dueDate: string;
  amountDue: number;
  principalAmount: number;
  interestAmount: number;
  penaltyAmount: number;
  status: 'PENDING' | 'PAID' | 'LATE' | 'OVERDUE';
  overdueDate?: string;
  daysOverdue?: number;
  paidAt?: string;
  contratId?: number;
  createdAt: string;
  updatedAt: string;
}

/** Statuts possibles d'un échéancier */
export type EcheancierStatus = EcheancierPayement['status'];

/** Labels français pour chaque statut */
export const ECHEANCIER_STATUS_LABELS: Record<EcheancierStatus, string> = {
  PENDING: 'En attente',
  PAID: 'Payé',
  LATE: 'En retard',
  OVERDUE: 'Échu',
};

export interface EcheancierPayementDTO {
  dueDate: string;
  amountDue: number;
  principalAmount: number;
  interestAmount: number;
  penaltyAmount: number;
  status: 'PENDING' | 'PAID' | 'LATE' | 'OVERDUE';
}

export interface PenaltyHistory {
  id: number;
  calculationDate: string;
  daysOverdue: number;
  penaltyAmount: number;
  previousPenaltyAmount: number;
  calculationMethod: string;
  createdAt: string;
}

export interface QuarterlyLateStats {
  year: number;
  quarter: number;
  label: string;
  totalPayments: number;
  latePayments: number;
  overduePayments: number;
  lateRate: number;
  totalPenalties: number;
}
