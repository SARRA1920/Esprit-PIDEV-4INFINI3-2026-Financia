export interface SavingsAuditLogEntry {
  id: number;
  userId: number;
  action: string;
  accountId: number | null;
  amount: number | null;
  detail: string | null;
  createdAt: string;
}
