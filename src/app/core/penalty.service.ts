import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { httpErrorMessage } from './http-error-message';
import { PenaltyHistory } from '../models/echeancier-payement.model';

@Injectable({ providedIn: 'root' })
export class PenaltyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/penalties`;

  calculatePenalty(echeancierPayementId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/calculate/${echeancierPayementId}`,
      {}
    ).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  calculateAllPenalties(): Observable<{ message: string; paymentsMarkedOverdue: number; penaltiesUpdated: number }> {
    return this.http.post<{ message: string; paymentsMarkedOverdue: number; penaltiesUpdated: number }>(
      `${this.baseUrl}/calculate-all`,
      {}
    ).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  getPenaltyHistory(echeancierPayementId: number): Observable<PenaltyHistory[]> {
    return this.http.get<PenaltyHistory[]>(`${this.baseUrl}/history/${echeancierPayementId}`).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  runDailyJob(): Observable<{ message: string; paymentsMarkedOverdue: number; penaltiesUpdated: number }> {
    return this.http.post<{ message: string; paymentsMarkedOverdue: number; penaltiesUpdated: number }>(
      `${this.baseUrl}/run-daily-job`,
      {}
    ).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(err: HttpErrorResponse) {
    const msg = httpErrorMessage(err, 'Erreur lors du calcul des pénalités');
    return throwError(() => new Error(msg));
  }
}
