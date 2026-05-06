import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { httpErrorMessage } from './http-error-message';
import {
  Contrat,
  ContratDTO,
  CurrencyConversionResponse,
  MultiCurrencyViewResponse,
} from '../models/contrat.model';

@Injectable({ providedIn: 'root' })
export class ContratService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/contrats`;

  getAllContrats(): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(this.baseUrl).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  getContratById(id: number): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.baseUrl}/${id}`).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  getContratByCreditId(creditId: number): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.baseUrl}/credit/${creditId}`).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  createContrat(creditId: number, body: ContratDTO): Observable<Contrat> {
    return this.http.post<Contrat>(`${this.baseUrl}/credit/${creditId}`, body).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  updateContrat(id: number, body: ContratDTO): Observable<Contrat> {
    return this.http.put<Contrat>(`${this.baseUrl}/${id}`, body).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  deleteContrat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  sendContratEmail(id: number): Observable<string> {
    return this.http.post(`${this.baseUrl}/${id}/send-email`, {}, { responseType: 'text' }).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  /** Sign the contract and download the signed PDF. */
  signerContrat(id: number): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/${id}/signer`, {}, { responseType: 'blob' }).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  /** Preview the signed PDF inline (returns Blob for embedding). */
  previewSignedContrat(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/signer/preview`, { responseType: 'blob' }).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  viewContratPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, {
      responseType: 'blob',
    }).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  downloadContratPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download-pdf`, {
      responseType: 'blob',
    }).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  convertCurrency(id: number, toCurrency: string): Observable<CurrencyConversionResponse> {
    return this.http.post<CurrencyConversionResponse>(
      `${this.baseUrl}/${id}/convert-currency`,
      null,
      { params: { toCurrency } }
    ).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  getMultiCurrencyView(id: number): Observable<MultiCurrencyViewResponse> {
    return this.http.get<MultiCurrencyViewResponse>(`${this.baseUrl}/${id}/multi-currency-view`).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(err: HttpErrorResponse) {
    const msg = httpErrorMessage(err, 'Erreur lors de l\'opération sur le contrat');
    return throwError(() => new Error(msg));
  }
}
