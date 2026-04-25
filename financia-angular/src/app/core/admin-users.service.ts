import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminUserListItem, AdminUserWriteBody } from '../models/admin-user.model';
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

  createUser(body: AdminUserWriteBody): Observable<AdminUserListItem> {
    return this.http.post<AdminUserListItem>(this.base, body).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err, 'Impossible de créer l’utilisateur')))
      )
    );
  }

  updateUser(idUser: number, body: AdminUserWriteBody): Observable<AdminUserListItem> {
    return this.http.put<AdminUserListItem>(`${this.base}/${idUser}`, body).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err, 'Impossible de mettre à jour l’utilisateur')))
      )
    );
  }

  deleteUser(idUser: number): Observable<void> {
    return this.http.delete(`${this.base}/${idUser}`, { responseType: 'text' }).pipe(
      map(() => undefined),
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err, 'Impossible de supprimer l’utilisateur')))
      )
    );
  }
}
