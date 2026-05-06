import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { httpErrorMessage } from './http-error-message';
import {
  EcheancierPayement,
  EcheancierPayementDTO,
  QuarterlyLateStats,
} from '../models/echeancier-payement.model';

@Injectable({ providedIn: 'root' })
export class EcheancierPayementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/echeanciers`;

  getAllPayments(): Observable<EcheancierPayement[]> {
    return this.http.get<EcheancierPayement[]>(this.baseUrl).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  getPaymentById(id: number): Observable<EcheancierPayement> {
    return this.http.get<EcheancierPayement>(`${this.baseUrl}/${id}`).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  getPaymentsByContrat(contratId: number): Observable<EcheancierPayement[]> {
    return this.http.get<EcheancierPayement[]>(`${this.baseUrl}/contrat/${contratId}`).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  createPayment(contratId: number, body: EcheancierPayementDTO): Observable<EcheancierPayement> {
    return this.http.post<EcheancierPayement>(`${this.baseUrl}/contrat/${contratId}`, body).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  updatePayment(id: number, body: EcheancierPayementDTO): Observable<EcheancierPayement> {
    return this.http.put<EcheancierPayement>(`${this.baseUrl}/${id}`, body).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  getQuarterlyStats(year?: number): Observable<QuarterlyLateStats[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    return this.http.get<QuarterlyLateStats[]>(`${this.baseUrl}/stats/quarterly`, { params }).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  viewSchedulePdf(contratId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/contrat/${contratId}/schedule-pdf`, {
      responseType: 'blob',
    }).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  downloadSchedulePdf(contratId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/contrat/${contratId}/download-schedule-pdf`, {
      responseType: 'blob',
    }).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(err: HttpErrorResponse) {
    const msg = httpErrorMessage(err, 'Erreur lors de l\'opération sur l\'échéancier');
    return throwError(() => new Error(msg));
  }
}
