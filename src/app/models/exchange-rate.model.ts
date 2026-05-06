export interface ExchangeRateResponse {
  from: string;
  to: string;
  rate: number;
  message: string;
}

export interface ConvertAmountResponse {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  message: string;
}

export interface ExchangeRateInfoResponse {
  amount: number;
  base: string;
  date: string;
  rates: { [key: string]: number };
}

export interface SupportedCurrenciesResponse {
  [key: string]: string;
}
