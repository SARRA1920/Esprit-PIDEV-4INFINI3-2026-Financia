import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { httpErrorMessage } from './http-error-message';
import { environment } from '../../environments/environment';
import {
  PaymentRequestDto,
  Remboursement,
  StripeCheckoutSessionDto,
} from '../models/remboursement.model';

@Injectable({ providedIn: 'root' })
export class RemboursementService {
  private readonly http = inject(HttpClient);

  getByCredit(creditId: number): Observable<Remboursement[]> {
    const url = `${environment.apiUrl}/api/remboursements/credit/${creditId}`;
    return this.http.get<Remboursement[]>(url).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  pay(remboursementId: number, paymentDate?: string): Observable<Remboursement> {
    const url = `${environment.apiUrl}/api/remboursements/${remboursementId}/pay`;
    const body: PaymentRequestDto | null = paymentDate ? { paymentDate } : null;
    return this.http.put<Remboursement>(url, body).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  createStripeCheckout(remboursementId: number): Observable<StripeCheckoutSessionDto> {
    const url = `${environment.apiUrl}/api/payments/stripe/checkout/remboursements/${remboursementId}`;
    return this.http.post<StripeCheckoutSessionDto>(url, {}).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  /** Fallback dev: confirme une session Checkout (quand webhook Stripe n’atteint pas localhost). */
  confirmStripeSession(sessionId: string): Observable<{ ok: boolean; remboursementId: number | null }> {
    const url = `${environment.apiUrl}/api/payments/stripe/confirm?session_id=${encodeURIComponent(sessionId)}`;
    return this.http.post<{ ok: boolean; remboursementId: number | null }>(url, {}).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(err: HttpErrorResponse) {
    const msg = httpErrorMessage(err, 'Erreur lors du chargement des remboursements');
    return throwError(() => new Error(msg));
  }
}

