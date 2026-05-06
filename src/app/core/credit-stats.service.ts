import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { PortfolioHealthStats } from '../models/credit-stats.model';
import { httpErrorMessage } from './http-error-message';

@Injectable({ providedIn: 'root' })
export class CreditStatsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/stats/credits/portfolio`;

  getPortfolioHealth(): Observable<PortfolioHealthStats> {
    return this.http.get<PortfolioHealthStats>(this.url).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err, 'Impossible de charger les statistiques crédit')))
      )
    );
  }
}
