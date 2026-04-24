import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormationService } from '../../core/formation.service';
import { AuthService } from '../../core/auth.service';
import { CourseDto } from '../../models/formation.model';

@Component({
  selector: 'app-formation',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './formation.component.html',
  styleUrl: './formation.component.scss',
})
export class FormationComponent implements OnInit {
  private readonly formation = inject(FormationService);
  readonly auth = inject(AuthService);

  /** Longueur minimale pour considérer une description exploitable par le moteur de recommandation. */
  readonly minDescLength = 30;

  /** Description de projet / objectif — envoyée au serveur comme `projectGoal`. */
  projectDescription = '';

  readonly savingProject = signal(false);
  readonly saveProjectError = signal('');
  readonly recoCourses = signal<CourseDto[]>([]);
  readonly recoLoading = signal(false);
  readonly recoError = signal('');
  /** Devient vrai après une recherche de recommandations terminée (pour afficher « aucun résultat »). */
  readonly recoAttempted = signal(false);

  ngOnInit(): void {
    const u = this.auth.user();
    if (u?.projectGoal) {
      this.projectDescription = u.projectGoal;
    }
  }

  /** Description assez détaillée pour lancer une recommandation (aucune liste par défaut sans ça). */
  projectDescriptionReady(): boolean {
    return this.projectDescription.trim().length >= this.minDescLength;
  }

  saveProjectDescription(): void {
    this.saveProjectError.set('');
    this.savingProject.set(true);
    this.auth.updateProjectGoal(this.projectDescription.trim()).subscribe({
      next: () => this.savingProject.set(false),
      error: (e: Error) => {
        this.saveProjectError.set(e.message);
        this.savingProject.set(false);
      },
    });
  }

  /** Charge les formations recommandées selon la description enregistrée (sauvegarde si le texte a changé). */
  loadRecommendations(): void {
    const u = this.auth.user();
    if (!u) return;

    const text = this.projectDescription.trim();
    if (!text || text.length < this.minDescLength) {
      this.recoError.set(
        `Décrivez votre projet dans le champ ci-dessus (au moins ${this.minDescLength} caractères).`
      );
      return;
    }

    this.recoError.set('');
    this.recoLoading.set(true);
    this.recoAttempted.set(false);

    const runReco = () => {
      this.formation.getRecommendationsByGoal(u.idUser).subscribe({
        next: (list) => {
          this.recoCourses.set(list ?? []);
          this.recoLoading.set(false);
          this.recoAttempted.set(true);
        },
        error: (e: Error) => {
          this.recoError.set(e.message);
          this.recoLoading.set(false);
        },
      });
    };

    const stored = (u.projectGoal ?? '').trim();
    if (stored !== text) {
      this.auth.updateProjectGoal(text).subscribe({
        next: () => runReco(),
        error: (e: Error) => {
          this.recoError.set(e.message);
          this.recoLoading.set(false);
        },
      });
    } else {
      runReco();
    }
  }

  courseLinkId(c: CourseDto): number {
    return Number(c.courseId ?? 0);
  }

  excerpt(desc: string | undefined | null, max = 160): string {
    if (!desc) return '';
    const t = desc.trim();
    if (t.length <= max) return t;
    return t.slice(0, max) + '…';
  }
}
