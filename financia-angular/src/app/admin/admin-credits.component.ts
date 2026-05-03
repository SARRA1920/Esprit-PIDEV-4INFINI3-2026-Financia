import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, of, switchMap, takeUntil } from 'rxjs';
import { AdminStatusBadgeComponent, AdminBadgeStatus } from './admin-status-badge.component';
import { CreditService } from '../core/credit.service';
import type { Credit } from '../models/credit.model';

type StatusFilter = 'Tous' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'CLOSED';

@Component({
  selector: 'app-admin-credits',
  standalone: true,
  imports: [CommonModule, AdminStatusBadgeComponent],
  templateUrl: './admin-credits.component.html',
  styleUrl: './admin-credits.component.scss',
})
export class AdminCreditsComponent implements OnInit, OnDestroy {
  private readonly creditService = inject(CreditService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  readonly filters: readonly StatusFilter[] = [
    'Tous',
    'PENDING',
    'APPROVED',
    'REJECTED',
    'ACTIVE',
    'CLOSED',
  ] as const;

  readonly activeFilter = signal<StatusFilter>('Tous');
  readonly searchText = signal('');
  readonly selectedRow = signal<number | null>(null);

  readonly rawCredits = signal<Credit[]>([]);
  readonly loading = signal(false);
  readonly listError = signal('');

  readonly recalculatingId = signal<number | null>(null);
  readonly actionMessage = signal('');

  private readonly searchResults = signal<Credit[] | null>(null);
  readonly searchLoading = signal(false);
  readonly searchError = signal('');

  readonly displayCredits = computed(() => {
    const q = this.searchText().trim().toLowerCase();
    const fromSearch = this.searchResults();
    const base = fromSearch != null ? fromSearch : this.rawCredits();
    const f = this.activeFilter();

    let list = base;
    if (f !== 'Tous') {
      list = list.filter((c) => String(c.status ?? '').toUpperCase() === f);
    }
    if (!q) {
      return list;
    }
    return list.filter((c) => this.matchesClientQuery(c, q));
  });

  ngOnInit(): void {
    this.loadAll();

    this.search$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((q) => {
          const t = q.trim();
          if (t.length < 2) {
            this.searchResults.set(null);
            this.searchLoading.set(false);
            this.searchError.set('');
            return of<Credit[] | null>(null);
          }
          this.searchLoading.set(true);
          this.searchError.set('');
          return this.creditService.search({});
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (all) => {
          this.searchLoading.set(false);
          if (all == null) {
            return;
          }
          const t = this.searchText().trim().toLowerCase();
          if (t.length < 2) {
            this.searchResults.set(null);
            return;
          }
          const filtered = (all ?? []).filter((c) => this.matchesClientQuery(c, t));
          this.searchResults.set(filtered);
        },
        error: (err: Error) => {
          this.searchLoading.set(false);
          this.searchError.set(err?.message ?? 'Recherche impossible');
        },
      });

    const qp = this.route.snapshot.queryParamMap.get('q');
    if (qp) {
      this.searchText.set(qp);
      this.search$.next(qp);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setFilter(f: StatusFilter): void {
    this.activeFilter.set(f);
  }

  onSearchInput(value: string): void {
    this.searchText.set(value);
    this.search$.next(value);
  }

  clearSearch(): void {
    this.searchText.set('');
    this.searchResults.set(null);
    this.searchError.set('');
  }

  toggleRow(id: number): void {
    this.selectedRow.update((cur) => (cur === id ? null : id));
  }

  recalculate(creditId: number, event: Event): void {
    event.stopPropagation();
    this.actionMessage.set('');
    this.recalculatingId.set(creditId);
    this.creditService.recalculate(creditId).subscribe({
      next: (updated) => {
        this.recalculatingId.set(null);
        this.actionMessage.set('Risque recalculé pour le crédit #' + creditId);
        this.rawCredits.update((list) =>
          list.map((c) => (c.id === creditId ? { ...c, ...updated } : c))
        );
        this.searchResults.update((cur) =>
          cur ? cur.map((c) => (c.id === creditId ? { ...c, ...updated } : c)) : cur
        );
      },
      error: (err: Error) => {
        this.recalculatingId.set(null);
        this.actionMessage.set(err?.message ?? 'Recalcul impossible');
      },
    });
  }

  clientLabel(c: Credit): string {
    const u = c.user;
    if (!u) return '—';
    return `${u.firstName} ${u.lastName}`.trim() || u.email || `User #${u.idUser}`;
  }

  toBadgeStatus(status: string | undefined): AdminBadgeStatus {
    const s = String(status ?? '').toUpperCase();
    if (s === 'REJECTED') return 'FAILED';
    if (s === 'PENDING' || s === 'APPROVED' || s === 'ACTIVE' || s === 'CLOSED') {
      return s;
    }
    return 'PENDING';
  }

  formatMoney(n: number | undefined | null): string {
    const v = Number(n ?? 0);
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return iso.slice(0, 10);
    return d.toLocaleDateString('fr-FR');
  }

  riskLabel(score: number | undefined | null): string {
    if (score == null || !Number.isFinite(Number(score))) return '—';
    const s = Number(score);
    if (s >= 80) return 'A';
    if (s >= 65) return 'B+';
    if (s >= 50) return 'B';
    if (s >= 35) return 'B-';
    if (s >= 20) return 'C';
    return 'D';
  }

  private loadAll(): void {
    this.loading.set(true);
    this.listError.set('');
    this.creditService.listAll().subscribe({
      next: (list) => {
        this.rawCredits.set(list ?? []);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.listError.set(err?.message ?? 'Impossible de charger les crédits');
        this.loading.set(false);
      },
    });
  }

  private matchesClientQuery(c: Credit, q: string): boolean {
    const idStr = String(c.id);
    const amountStr = this.formatMoney(c.amount);
    const remStr = this.formatMoney(c.remainingAmount);
    const client = this.clientLabel(c).toLowerCase();
    const email = c.user?.email?.toLowerCase() ?? '';
    return (
      idStr.includes(q) ||
      client.includes(q) ||
      email.includes(q) ||
      amountStr.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
      remStr.replace(/\s/g, '').includes(q.replace(/\s/g, ''))
    );
  }
}
