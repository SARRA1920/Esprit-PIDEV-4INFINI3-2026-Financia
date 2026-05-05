import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly usersUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<unknown[]> {
    return this.http.get<unknown[]>(this.usersUrl);
  }

  getUserById(id: number): Observable<unknown> {
    return this.http.get(`${this.usersUrl}/${id}`);
  }

  createUser(user: unknown): Observable<unknown> {
    return this.http.post(this.usersUrl, user);
  }

  updateUser(id: number, user: unknown): Observable<unknown> {
    return this.http.put(`${this.usersUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${id}`);
  }
}
