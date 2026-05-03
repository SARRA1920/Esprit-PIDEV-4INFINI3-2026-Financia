import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SavingsService } from '../../core/savings.service';
import { SavingsGoal } from '../../models/savings.model';

@Component({
  selector: 'app-savings-goal-list',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './savings-goal-list.component.html',
  styleUrl: './savings-goal-list.component.scss',
})
export class SavingsGoalListComponent {
  private readonly savings = inject(SavingsService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly goals = signal<SavingsGoal[]>([]);
  readonly error = signal('');
  readonly loading = signal(true);

  /** Filtre navigation admin (lien depuis la liste des comptes) — pas un second appel API. */
  readonly accountFilterId = signal<number | null>(null);

  readonly displayedGoals = computed(() => {
    const id = this.accountFilterId();
    const list = this.goals();
    if (id == null) {
      return list;
    }
    return list.filter((g) => g.savingsAccount?.id === id);
  });

  readonly filterBanner = computed(() => {
    const id = this.accountFilterId();
    return id != null ? `Objectifs du compte #${id}` : null;
  });

  constructor() {
    this.loadGoals();
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const raw = params.get('accountId');
      const n = raw ? Number(raw) : NaN;
      this.accountFilterId.set(Number.isFinite(n) && n > 0 ? n : null);
    });
  }

  goalProgress(goal: SavingsGoal): number {
    const target = Number(goal.targetAmount);
    const current = Number(goal.currentAmount);
    if (!Number.isFinite(target) || target <= 0) {
      return 0;
    }
    const pct = ((Number.isFinite(current) ? current : 0) / target) * 100;
    return Math.max(0, Math.min(100, pct));
  }

  private loadGoals(): void {
    this.loading.set(true);
    this.error.set('');
    this.savings.listGoals().subscribe({
      next: (data) => {
        this.goals.set(data ?? []);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
