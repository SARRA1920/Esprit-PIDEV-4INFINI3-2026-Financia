export interface Contrat {
  id: number;
  signedDate: string;
  amount: number;
  rate: number;
  duration: number;
  status: string;
  version: string;
  type: 'INITIAL' | 'RENEWAL' | 'GROUP_SOLIDARITY';
  currency: string;
  originalAmount?: number;
  amountInTND?: number;
  exchangeRateUsed?: number;
  penaltyRate?: number;
  penaltyType?: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  gracePeriodDays?: number;
  signed?: boolean;
  signedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContratDTO {
  signedDate: string;
  amount: number;
  rate: number;
  duration: number;
  status: string;
  version: string;
  type: 'INITIAL' | 'RENEWAL' | 'GROUP_SOLIDARITY';
  currency?: string;
  penaltyRate?: number;
  penaltyType?: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  gracePeriodDays?: number;
}

export interface CurrencyConversionResponse {
  contractId: number;
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
}

export interface MultiCurrencyViewResponse {
  contractId: number;
  baseCurrency: string;
  baseAmount: number;
  conversions: { [key: string]: number };
}
