import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, body);
  }

  register(body: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, body);
  }

  googleLogin(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/google`, { idToken });
  }

  faceVerify(email: string, imageBase64: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/face/verify`, {
      email,
      imageBase64,
    });
  }

  faceEnroll(imageBase64: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.authUrl}/face/enroll`, {
      imageBase64,
    });
  }

  me(): Observable<unknown> {
    return this.http.get(`${this.authUrl}/me`);
  }
}
