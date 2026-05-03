export type SavingsAccountType = 'CLASSIC' | 'LOCKED' | 'GOAL_BASED';
export type SavingsAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
export type SavingsGoalStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type SavingsTransactionType = 'DEPOSIT' | 'WITHDRAWAL';
export type SavingsTransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface SavingsUserRef {
  idUser: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface SavingsAccount {
  id: number;
  accountNumber: string;
  type: SavingsAccountType;
  balance: number;
  status: SavingsAccountStatus;
  interestRate?: number | null;
  accumulatedInterest?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  user?: SavingsUserRef | null;
  goal?: SavingsGoal | null;
}

export interface SavingsAccountCreateRequest {
  type: SavingsAccountType;
  balance?: number | null;
}

export interface SavingsAccountUpdateRequest {
  type: SavingsAccountType;
}

export interface SavingsAccountStatusRequest {
  status: SavingsAccountStatus;
}

export interface SavingsAccountActionRequest {
  amount: number;
  description?: string;
}

export interface SavingsGoal {
  id: number;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description?: string | null;
  status: SavingsGoalStatus;
  completionRate?: number;
  savingsAccount?: {
    id: number;
    accountNumber?: string;
    type?: SavingsAccountType;
    status?: SavingsAccountStatus;
  } | null;
}

export interface SavingsGoalCreateRequest {
  targetAmount: number;
  currentAmount?: number;
  deadline: string;
  description?: string;
  savingsAccount: {
    id: number;
  };
}

export interface SavingsGoalUpdateRequest {
  currentAmount: number;
}

export interface GoalPredictionResult {
  goalId: number;
  verdict: string;
  advice: string;
  predictedCompletionDate?: string | null;
  completionProbability?: number;
  message?: string | null;
}

export interface SavingsTransaction {
  id: number;
  type: SavingsTransactionType;
  amount: number;
  transactionDate?: string | null;
  reference?: string | null;
  description?: string | null;
  status: SavingsTransactionStatus;
  anomalyScore?: number;
  flagged?: boolean;
  savingsAccount?: {
    id: number;
    accountNumber?: string;
  } | null;
}

export interface SavingsTransactionCreateRequest {
  type: SavingsTransactionType;
  amount: number;
  description?: string;
  status?: SavingsTransactionStatus;
  savingsAccount: {
    id: number;
  };
}

export interface SavingsTransactionUpdateRequest {
  status: SavingsTransactionStatus;
}
