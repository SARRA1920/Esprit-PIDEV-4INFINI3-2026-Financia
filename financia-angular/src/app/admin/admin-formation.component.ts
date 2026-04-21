import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { catchError, of } from 'rxjs';
import { FormationService } from '../core/formation.service';
import { AdminStatusBadgeComponent, AdminBadgeStatus } from './admin-status-badge.component';

@Component({
  selector: 'app-admin-formation',
  standalone: true,
  imports: [RouterLink, AsyncPipe, AdminStatusBadgeComponent],
  templateUrl: './admin-formation.component.html',
  styleUrl: './admin-formation.component.scss',
})
export class AdminFormationComponent {
  private readonly formation = inject(FormationService);

  readonly tabs = ['Courses', 'Lessons', 'Enrollments'] as const;
  activeTab: string = 'Courses';

  readonly courses$ = this.formation.getAllCourses().pipe(
    catchError(() => of([]))
  );

  visibilityForLessons(course: { lessons?: unknown[] | null }): AdminBadgeStatus {
    const n = course.lessons?.length ?? 0;
    return n > 0 ? 'ACTIVE' : 'PENDING';
  }
}
