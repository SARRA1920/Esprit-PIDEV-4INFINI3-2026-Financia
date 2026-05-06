import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { httpErrorMessage } from './http-error-message';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/whatsapp`;

  sendPenaltyNotification(echeancierPayementId: number): Observable<{ message: string; paymentId: string; phone: string }> {
    return this.http.post<{ message: string; paymentId: string; phone: string }>(
      `${this.baseUrl}/send-penalty-notification/${echeancierPayementId}`,
      {}
    ).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  sendCustomWhatsapp(phoneNumber: string, message: string): Observable<{ message: string; phone: string }> {
    return this.http.post<{ message: string; phone: string }>(
      `${this.baseUrl}/send-custom`,
      null,
      { params: { phoneNumber, message } }
    ).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  checkStatus(): Observable<{ enabled: boolean; service: string }> {
    return this.http.get<{ enabled: boolean; service: string }>(`${this.baseUrl}/status`).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(err: HttpErrorResponse) {
    const msg = httpErrorMessage(err, 'Erreur lors de l\'envoi WhatsApp');
    return throwError(() => new Error(msg));
  }
}
