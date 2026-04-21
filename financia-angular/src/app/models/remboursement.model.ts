export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface Remboursement {
  id: number;
  amount: number;
  dueDate?: string | null; // LocalDate (yyyy-MM-dd)
  paymentDate?: string | null; // LocalDateTime (ISO)
  lateDays?: number | null;
  status?: PaymentStatus | string;
  createdAt?: string | null; // Instant (ISO)
}

export interface StripeCheckoutSessionDto {
  sessionId: string;
  checkoutUrl: string;
}

export interface PaymentRequestDto {
  paymentDate: string; // LocalDateTime (ISO)
}

