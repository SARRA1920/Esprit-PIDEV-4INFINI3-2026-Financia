import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormationService } from '../../core/formation.service';
import { CourseDto } from '../../models/formation.model';

@Component({
  selector: 'app-formation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './formation.component.html',
  styleUrl: './formation.component.scss',
})
export class FormationComponent implements OnInit {
  private readonly formation = inject(FormationService);

  readonly courses = signal<CourseDto[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');

  ngOnInit(): void {
    this.formation.getAllCourses().subscribe({
      next: (list) => {
        this.courses.set(list ?? []);
        this.loading.set(false);
      },
      error: (e: Error) => {
        this.loadError.set(e.message || 'Erreur de chargement');
        this.loading.set(false);
      },
    });
  }

  excerpt(desc: string | undefined | null, max = 160): string {
    if (!desc) return '';
    const t = desc.trim();
    if (t.length <= max) return t;
    return t.slice(0, max) + '…';
  }
}
