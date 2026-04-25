import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Remboursement,
  RemboursementCreateBody,
  RemboursementUpdateBody,
  StripeCheckoutSessionDto,
} from '../models/remboursement.model';
import { httpErrorMessage } from './http-error-message';

@Injectable({ providedIn: 'root' })
export class RemboursementService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/remboursements`;
  private readonly stripeBase = `${environment.apiUrl}/api/payments/stripe`;

  getAll(): Observable<Remboursement[]> {
    return this.http.get<Remboursement[]>(this.base).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err, 'Impossible de charger les remboursements')))
      )
    );
  }

  /** Échéances d’un crédit (espace client + génération calendrier côté serveur si besoin). */
  getByCredit(creditId: number): Observable<Remboursement[]> {
    return this.http.get<Remboursement[]>(`${this.base}/credit/${creditId}`).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err, 'Impossible de charger les échéances')))
      )
    );
  }

  createForCredit(creditId: number, body: RemboursementCreateBody): Observable<Remboursement> {
    return this.http.post<Remboursement>(`${this.base}/credit/${creditId}`, body).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err, 'Création de l’échéance impossible')))
      )
    );
  }

  update(id: number, body: RemboursementUpdateBody): Observable<Remboursement> {
    return this.http.put<Remboursement>(`${this.base}/${id}`, body).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err, 'Mise à jour impossible')))
      )
    );
  }

  /** Marque l’échéance comme payée (date optionnelle, défaut serveur = maintenant). */
  pay(id: number, paymentDateIso?: string | null): Observable<Remboursement> {
    const body = paymentDateIso ? { paymentDate: paymentDateIso } : {};
    return this.http.put<Remboursement>(`${this.base}/${id}/pay`, body).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err, 'Enregistrement du paiement impossible')))
      )
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err, 'Suppression impossible')))
      )
    );
  }

  /** Session Stripe Checkout pour payer une échéance. */
  createStripeCheckout(remboursementId: number): Observable<StripeCheckoutSessionDto> {
    return this.http
      .post<StripeCheckoutSessionDto>(
        `${this.stripeBase}/checkout/remboursements/${remboursementId}`,
        {}
      )
      .pipe(
        catchError((err: HttpErrorResponse) =>
          throwError(() => new Error(httpErrorMessage(err, 'Paiement Stripe indisponible')))
        )
      );
  }

  /** Après retour Stripe (?session_id=) — confirmation fallback dev. */
  confirmStripeSession(sessionId: string): Observable<Record<string, unknown>> {
    const params = new HttpParams().set('session_id', sessionId);
    return this.http
      .post<Record<string, unknown>>(`${this.stripeBase}/confirm`, {}, { params })
      .pipe(
        catchError((err: HttpErrorResponse) =>
          throwError(() => new Error(httpErrorMessage(err, 'Confirmation du paiement impossible')))
        )
      );
  }
}
