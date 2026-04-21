import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
    const url = `${environment.apiUrl}/api/credits/user/${userId}`;
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

  private handleError(err: HttpErrorResponse) {
    const msg = httpErrorMessage(err, 'Erreur lors de la demande de crédit');
    return throwError(() => new Error(msg));
  }
}
