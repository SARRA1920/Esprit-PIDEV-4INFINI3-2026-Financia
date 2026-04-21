import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, CourseDto } from '../models/formation.model';
import { httpErrorMessage } from './http-error-message';

@Injectable({ providedIn: 'root' })
export class FormationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/course`;

  getAllCourses(): Observable<CourseDto[]> {
    return this.http.get<ApiResponse<CourseDto[]>>(this.base).pipe(
      map((res) => (res?.success && res.data ? res.data : [])),
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err, 'Impossible de charger les cours')))
      )
    );
  }

  getCourse(courseId: number): Observable<CourseDto | null> {
    return this.http.get<ApiResponse<CourseDto>>(`${this.base}/${courseId}`).pipe(
      map((res) => (res?.success ? res.data ?? null : null)),
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err, 'Cours introuvable')))
      )
    );
  }
}
