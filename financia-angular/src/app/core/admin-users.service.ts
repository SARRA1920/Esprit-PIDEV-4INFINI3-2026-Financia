import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminUserListItem } from '../models/admin-user.model';
import { httpErrorMessage } from './http-error-message';

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/users`;

  getAllUsers(): Observable<AdminUserListItem[]> {
    return this.http.get<AdminUserListItem[]>(this.base).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err, 'Impossible de charger les utilisateurs')))
      )
    );
  }
}
