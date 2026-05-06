import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { httpErrorMessage } from './http-error-message';
import {
  ExchangeRateResponse,
  ConvertAmountResponse,
  ExchangeRateInfoResponse,
  SupportedCurrenciesResponse,
} from '../models/exchange-rate.model';

@Injectable({ providedIn: 'root' })
export class ExchangeRateService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/exchange-rate`;

  getExchangeRate(from: string, to: string): Observable<ExchangeRateResponse> {
    return this.http.get<ExchangeRateResponse>(this.baseUrl, {
      params: { from, to },
    }).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  convertAmount(amount: number, from: string, to: string): Observable<ConvertAmountResponse> {
    return this.http.get<ConvertAmountResponse>(`${this.baseUrl}/convert`, {
      params: { amount: amount.toString(), from, to },
    }).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  getAllRatesForBase(baseCurrency: string): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.baseUrl}/rates/${baseCurrency}`).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  getExchangeRateInfo(from: string, to: string): Observable<ExchangeRateInfoResponse> {
    return this.http.get<ExchangeRateInfoResponse>(`${this.baseUrl}/info`, {
      params: { from, to },
    }).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  getSupportedCurrencies(): Observable<SupportedCurrenciesResponse> {
    return this.http.get<SupportedCurrenciesResponse>(`${this.baseUrl}/currencies`).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(err: HttpErrorResponse) {
    const msg = httpErrorMessage(err, 'Erreur lors de la récupération du taux de change');
    return throwError(() => new Error(msg));
  }
}
