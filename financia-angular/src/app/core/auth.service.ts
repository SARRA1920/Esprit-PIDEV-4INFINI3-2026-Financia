import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthLoginRequest,
  AuthRegisterRequest,
  UserResponse,
} from '../models/user.model';
import { httpErrorMessage } from './http-error-message';

const STORAGE_KEY = 'financia.currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly user = signal<UserResponse | null>(this.loadFromStorage());

  private loadFromStorage(): UserResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as UserResponse) : null;
    } catch {
      return null;
    }
  }

  private persist(u: UserResponse | null): void {
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.user.set(u);
  }

  login(body: AuthLoginRequest): Observable<UserResponse> {
    const url = `${environment.apiUrl}/api/auth/login`;
    return this.http.post<UserResponse>(url, body).pipe(
      tap((u) => this.persist(u)),
      catchError((err) => this.handleError(err))
    );
  }

  register(body: AuthRegisterRequest): Observable<UserResponse> {
    const url = `${environment.apiUrl}/api/auth/register`;
    return this.http.post<UserResponse>(url, body).pipe(
      tap((u) => this.persist(u)),
      catchError((err) => this.handleError(err))
    );
  }

  /** id_token JWT retourné par Google Identity Services (même Client ID que Spring). */
  loginWithGoogle(idToken: string): Observable<UserResponse> {
    const url = `${environment.apiUrl}/api/auth/google`;
    return this.http.post<UserResponse>(url, { idToken }).pipe(
      tap((u) => this.persist(u)),
      catchError((err) => this.handleError(err))
    );
  }

  /** Connexion faciale : même schéma que le backend {@code FaceVerifyRequest}. */
  loginWithFace(email: string, imageBase64: string): Observable<UserResponse> {
    const url = `${environment.apiUrl}/api/auth/face-login`;
    return this.http.post<UserResponse>(url, { email, imageBase64 }).pipe(
      tap((u) => this.persist(u)),
      catchError((err) => this.handleError(err))
    );
  }

  logout(): void {
    this.persist(null);
  }

  isClient(): boolean {
    const u = this.user();
    return !!u && (!u.role || u.role === 'CLIENT');
  }

  isAdmin(): boolean {
    return this.user()?.role === 'ADMIN';
  }

  private handleError(err: HttpErrorResponse) {
    let msg: string;

    if (err.status === 401) {
      const e = err.error;
      msg =
        typeof e === 'string' && e.trim().length
          ? e
          : 'E-mail ou mot de passe incorrect.';
    } else {
      msg = httpErrorMessage(err, 'Erreur réseau');
    }

    return throwError(() => new Error(msg));
  }
}
