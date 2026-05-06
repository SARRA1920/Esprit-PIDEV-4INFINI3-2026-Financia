import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormationService } from '../../../core/formation.service';
import { CourseDto } from '../../../models/formation.model';

@Component({
  selector: 'app-formation-course-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './formation-course-detail.component.html',
  styleUrl: './formation-course-detail.component.scss',
})
export class FormationCourseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formation = inject(FormationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly course = signal<CourseDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((pm) => {
      const id = pm.get('id');
      if (!id) {
        this.error.set('Identifiant de cours manquant');
        this.loading.set(false);
        return;
      }
      const num = Number(id);
      if (!Number.isFinite(num)) {
        this.error.set('Identifiant invalide');
        this.loading.set(false);
        return;
      }
      this.load(num);
    });
  }

  private load(courseId: number): void {
    this.loading.set(true);
    this.error.set('');
    this.formation.getCourse(courseId).subscribe({
      next: (c) => {
        this.course.set(c);
        this.loading.set(false);
      },
      error: (e: Error) => {
        this.error.set(e.message || 'Erreur de chargement');
        this.loading.set(false);
      },
    });
  }

  sortedLessons(c: CourseDto) {
    const list = c.lessons ?? [];
    return [...list].sort(
      (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
    );
  }

  excerpt(text: string, max = 280): string {
    const t = text.trim();
    if (t.length <= max) return t;
    return t.slice(0, max) + '…';
  }
}
