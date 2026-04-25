import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { httpErrorMessage } from './http-error-message';
import { environment } from '../../environments/environment';
import {
  BlockingCreditResponse,
  Credit,
  CreditRequest,
  CreditUpdateBody,
} from '../models/credit.model';

@Injectable({ providedIn: 'root' })
export class CreditService {
  private readonly http = inject(HttpClient);

  /**
   * Même règle métier que le backend (dont OFFER_PENDING tant que non répondu / non expiré).
   * Préféré à listByUser pour décider formulaire vs résumé.
   */
  getBlockingInfo(userId: number): Observable<BlockingCreditResponse> {
    const url = `${environment.apiUrl}/api/credits/user/${userId}/blocking-info`;
    return this.http.get<BlockingCreditResponse>(url).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  listByUser(userId: number): Observable<Credit[]> {
    const url = `${environment.apiUrl}/api/credits/user/${userId}`;
    return this.http.get<Credit[]>(url).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  /** Liste complète des dossiers (admin / tableau de bord). */
  getAllCredits(): Observable<Credit[]> {
    const url = `${environment.apiUrl}/api/credits`;
    return this.http.get<Credit[]>(url).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  create(userId: number, body: CreditRequest): Observable<Credit> {
    const url = `${environment.apiUrl}/api/credits/user/${userId}`;
    return this.http.post<Credit>(url, body).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  updateCredit(id: number, body: CreditUpdateBody): Observable<Credit> {
    const url = `${environment.apiUrl}/api/credits/${id}`;
    return this.http.put<Credit>(url, body).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  deleteCredit(id: number): Observable<void> {
    const url = `${environment.apiUrl}/api/credits/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  /** Recalcul score + taux côté serveur. */
  recalculateRisk(id: number): Observable<Credit> {
    const url = `${environment.apiUrl}/api/credits/${id}/recalculate`;
    return this.http.put<Credit>(url, {}).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  acceptOffer(creditId: number, userId: number): Observable<Credit> {
    const url = `${environment.apiUrl}/api/credits/${creditId}/accept-offer`;
    return this.http.post<Credit>(url, {}, { params: { userId: String(userId) } }).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  refuseOffer(creditId: number, userId: number): Observable<Credit> {
    const url = `${environment.apiUrl}/api/credits/${creditId}/refuse-offer`;
    return this.http.post<Credit>(url, {}, { params: { userId: String(userId) } }).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(err: HttpErrorResponse) {
    const msg = httpErrorMessage(err, 'Erreur lors de la demande de crédit');
    return throwError(() => new Error(msg));
  }
}
