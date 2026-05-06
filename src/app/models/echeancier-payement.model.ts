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
  createdAt: string;
  updatedAt: string;
}

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
