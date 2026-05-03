import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SavingsStatsService {
  private readonly base = `${environment.apiUrl}/api/savings`;

  constructor(private http: HttpClient) { }

  getSystemStatistics(): Observable<any> {
    return this.http.get<any>(`${this.base}/accounts/system/statistics`);
  }

  getBasicStats(): Observable<any> {
    return this.http.get<any>(`${this.base}/stats`);
  }
}