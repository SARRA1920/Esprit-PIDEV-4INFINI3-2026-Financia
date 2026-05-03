import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthResponse,
  UserResponse,
} from '../models/user.model';
import { httpErrorMessage } from './http-error-message';

const STORAGE_KEY = 'financia.currentUser';
const TOKEN_KEY = 'financia.authToken';

type AuthApiResponse = AuthResponse | UserResponse;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly user = signal<UserResponse | null>(this.loadFromStorage());
  readonly token = signal<string | null>(this.loadToken());

  private loadFromStorage(): UserResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as UserResponse) : null;
    } catch {
      return null;
    }
  }

  private loadToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private normalizeAuthResponse(payload: AuthApiResponse): AuthResponse {
    const maybeAuth = payload as Partial<AuthResponse>;
    if (maybeAuth.user && typeof maybeAuth.user === 'object') {
      return {
        token: typeof maybeAuth.token === 'string' ? maybeAuth.token : '',
        user: maybeAuth.user as UserResponse,
      };
    }
    return {
      token: '',
      user: payload as UserResponse,
    };
  }

  private persist(auth: AuthResponse | null): void {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth.user));
      if (auth.token && auth.token.trim().length > 0) {
        localStorage.setItem(TOKEN_KEY, auth.token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
      this.user.set(auth.user);
      this.token.set(auth.token && auth.token.trim().length > 0 ? auth.token : null);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      this.user.set(null);
      this.token.set(null);
    }
  }

  login(body: AuthLoginRequest): Observable<UserResponse> {
    const url = `${environment.apiUrl}/api/auth/login`;
    return this.http.post<AuthApiResponse>(url, body).pipe(
      map((payload) => {
        const auth = this.normalizeAuthResponse(payload);
        this.persist(auth);
        return auth.user;
      }),
      catchError((err) => this.handleError(err))
    );
  }

  register(body: AuthRegisterRequest): Observable<UserResponse> {
    const url = `${environment.apiUrl}/api/auth/register`;
    return this.http.post<AuthApiResponse>(url, body).pipe(
      map((payload) => {
        const auth = this.normalizeAuthResponse(payload);
        this.persist(auth);
        return auth.user;
      }),
      catchError((err) => this.handleError(err))
    );
  }

  /** id_token JWT retourné par Google Identity Services (même Client ID que Spring). */
  loginWithGoogle(idToken: string): Observable<UserResponse> {
    const url = `${environment.apiUrl}/api/auth/google`;
    return this.http.post<AuthApiResponse>(url, { idToken }).pipe(
      map((payload) => {
        const auth = this.normalizeAuthResponse(payload);
        this.persist(auth);
        return auth.user;
      }),
      catchError((err) => this.handleError(err))
    );
  }

  /** Connexion faciale : même schéma que le backend {@code FaceVerifyRequest}. */
  loginWithFace(email: string, imageBase64: string): Observable<UserResponse> {
    const url = `${environment.apiUrl}/api/auth/face-login`;
    return this.http.post<AuthApiResponse>(url, { email, imageBase64 }).pipe(
      map((payload) => {
        const auth = this.normalizeAuthResponse(payload);
        this.persist(auth);
        return auth.user;
      }),
      catchError((err) => this.handleError(err))
    );
  }

  logout(): void {
    this.persist(null);
  }

  getAccessToken(): string | null {
    return this.token();
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
