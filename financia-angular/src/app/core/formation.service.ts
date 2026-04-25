import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, CourseDto, LessonDto } from '../models/formation.model';
import { httpErrorMessage } from './http-error-message';

/** Réponse brute Spring pour un cours (idCourse vs courseId). */
interface CourseJson {
  idCourse?: number;
  courseId?: number;
  title?: string;
  description?: string;
  lessons?: LessonDto[] | null;
}

@Injectable({ providedIn: 'root' })
export class FormationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/course`;
  private readonly recoBase = `${environment.apiUrl}/recommendation`;

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

  /**
   * Formations recommandées selon la description de projet (`projectGoal`) déjà enregistrée pour l’utilisateur.
   */
  getRecommendationsByGoal(userId: number, limit = 12): Observable<CourseDto[]> {
    const params = new HttpParams().set('limit', String(limit));
    const url = `${this.recoBase}/getRecommendationsByGoal/${userId}`;
    return this.http.get<CourseJson[]>(url, { params }).pipe(
      map((list) =>
        (list ?? []).map((raw) => ({
          courseId: Number(raw.idCourse ?? raw.courseId ?? 0) || undefined,
          title: raw.title,
          description: raw.description,
          lessons: raw.lessons ?? undefined,
        }))
      ),
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(httpErrorMessage(err, 'Impossible de charger les recommandations')))
      )
    );
  }
}
