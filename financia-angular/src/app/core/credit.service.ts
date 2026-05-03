import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { httpErrorMessage } from './http-error-message';
import { environment } from '../../environments/environment';
import {
  BlockingCreditResponse,
  Credit,
  CreditRequest,
} from '../models/credit.model';

@Injectable({ providedIn: 'root' })
export class CreditService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/credits`;

  listAll(): Observable<Credit[]> {
    return this.http.get<Credit[]>(this.base).pipe(
      catchError((err) => this.handleError(err, 'Impossible de charger les crédits'))
    );
  }

  /**
   * Recherche avancée côté backend: GET /api/credits/search?...
   * (tous les params sont optionnels)
   */
  search(params: {
    userId?: number;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
    minDurationMonths?: number;
    maxDurationMonths?: number;
    minRiskScore?: number;
    maxRiskScore?: number;
    startDateFrom?: string;
    startDateTo?: string;
  }): Observable<Credit[]> {
    let httpParams = new HttpParams();
    if (params.userId != null) httpParams = httpParams.set('userId', String(params.userId));
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.minAmount != null) httpParams = httpParams.set('minAmount', String(params.minAmount));
    if (params.maxAmount != null) httpParams = httpParams.set('maxAmount', String(params.maxAmount));
    if (params.minDurationMonths != null) httpParams = httpParams.set('minDurationMonths', String(params.minDurationMonths));
    if (params.maxDurationMonths != null) httpParams = httpParams.set('maxDurationMonths', String(params.maxDurationMonths));
    if (params.minRiskScore != null) httpParams = httpParams.set('minRiskScore', String(params.minRiskScore));
    if (params.maxRiskScore != null) httpParams = httpParams.set('maxRiskScore', String(params.maxRiskScore));
    if (params.startDateFrom) httpParams = httpParams.set('startDateFrom', params.startDateFrom);
    if (params.startDateTo) httpParams = httpParams.set('startDateTo', params.startDateTo);

    return this.http.get<Credit[]>(`${this.base}/search`, { params: httpParams }).pipe(
      catchError((err) => this.handleError(err, 'Impossible de rechercher les crédits'))
    );
  }

  recalculate(creditId: number): Observable<Credit> {
    return this.http.put<Credit>(`${this.base}/${creditId}/recalculate`, {}).pipe(
      catchError((err) => this.handleError(err, 'Impossible de recalculer le risque'))
    );
  }

  /**
   * Même règle métier que le backend (PENDING / APPROVED / ACTIVE).
   * Préféré à listByUser pour décider formulaire vs résumé.
   */
  getBlockingInfo(userId: number): Observable<BlockingCreditResponse> {
    const url = `${environment.apiUrl}/api/credits/user/${userId}/blocking-info`;
    return this.http.get<BlockingCreditResponse>(url).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  listByUser(userId: number): Observable<Credit[]> {
    const url = `${this.base}/user/${userId}`;
    return this.http.get<Credit[]>(url).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  create(userId: number, body: CreditRequest): Observable<Credit> {
    const url = `${this.base}/user/${userId}`;
    return this.http.post<Credit>(url, body).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(err: HttpErrorResponse, fallback = 'Erreur lors de la demande de crédit') {
    const msg = httpErrorMessage(err, fallback);
    return throwError(() => new Error(msg));
  }
}
