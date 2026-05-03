import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { httpErrorMessage } from './http-error-message';
import type { SavingsAuditLogEntry } from '../models/savings-audit.model';

@Injectable({ providedIn: 'root' })
export class SavingsAuditService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/savings/audit-logs`;

  list(): Observable<SavingsAuditLogEntry[]> {
    return this.http.get<SavingsAuditLogEntry[]>(this.url).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err, 'Impossible de charger le journal audit')))
      )
    );
  }
}
