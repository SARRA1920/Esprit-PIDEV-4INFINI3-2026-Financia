import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CreditService } from '../core/credit.service';
import { Credit } from '../models/credit.model';
import { AdminStatusBadgeComponent, AdminBadgeStatus } from './admin-status-badge.component';

interface CreditRow {
  id: string;
  client: string;
  amount: number;
  rate: number;
  duration: number;
  status: AdminBadgeStatus;
  riskScore: string;
  remaining: number;
  created: string;
  approved: string | null;
}

@Component({
  selector: 'app-admin-credits',
  standalone: true,
  imports: [AdminStatusBadgeComponent],
  templateUrl: './admin-credits.component.html',
  styleUrl: './admin-credits.component.scss',
})
export class AdminCreditsComponent implements OnInit {
  private readonly creditApi = inject(CreditService);

  readonly filters = ['Tous', 'PENDING', 'OFFER_PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'CLOSED'] as const;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly credits = signal<CreditRow[]>([]);
  readonly activeFilter = signal<string>('Tous');
  readonly query = signal('');
  readonly selectedRow = signal<string | null>(null);

  readonly filteredCredits = computed(() => {
    const f = this.activeFilter();
    const q = this.query().trim().toLowerCase();
    return this.credits().filter((c) => {
      const matchesStatus = f === 'Tous' || c.status === f;
      const matchesQuery =
        !q ||
        [c.id, c.client, c.amount, c.remaining, c.status, c.riskScore]
          .join(' ')
          .toLowerCase()
          .includes(q);
      return matchesStatus && matchesQuery;
    });
  });

  readonly totalExposure = computed(() =>
    this.filteredCredits().reduce((sum, credit) => sum + credit.remaining, 0)
  );

  readonly activeCreditsCount = computed(
    () => this.filteredCredits().filter((credit) => credit.status === 'ACTIVE').length
  );

  ngOnInit(): void {
    this.fetchCredits();
  }

  fetchCredits(): void {
    this.loading.set(true);
    this.error.set(null);
    this.creditApi.getAllCredits().subscribe({
      next: (credits) => {
        this.credits.set((credits ?? []).map((credit) => this.toRow(credit)));
        this.loading.set(false);
      },
      error: (e: Error) => {
        this.error.set(e.message);
        this.loading.set(false);
      },
    });
  }

  setFilter(f: string): void {
    this.activeFilter.set(f);
  }

  updateQuery(value: string): void {
    this.query.set(value);
  }

  toggleRow(id: string): void {
    this.selectedRow.update((cur) => (cur === id ? null : id));
  }

  filterCount(f: string): number {
    if (f === 'Tous') return this.credits().length;
    return this.credits().filter((credit) => credit.status === f).length;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  repaymentPercent(credit: CreditRow): number {
    if (credit.amount <= 0) return 0;
    return Math.round(((credit.amount - credit.remaining) / credit.amount) * 100);
  }

  private toRow(credit: Credit): CreditRow {
    return {
      id: `CR-${String(credit.id).padStart(5, '0')}`,
      client: credit.clientName?.trim() || `Client #${credit.userId ?? '-'}`,
      amount: Number(credit.amount ?? 0),
      rate: Number(credit.interestRate ?? 0),
      duration: Number(credit.durationMonths ?? 0),
      status: this.toBadgeStatus(credit.status),
      riskScore: this.riskLabel(credit.riskScore),
      remaining: Number(credit.remainingAmount ?? credit.amount ?? 0),
      created: this.formatDate(credit.createdAt),
      approved: credit.startDate ? this.formatDate(credit.startDate) : null,
    };
  }

  private toBadgeStatus(status: string | undefined): AdminBadgeStatus {
    const allowed: AdminBadgeStatus[] = [
      'PENDING',
      'OFFER_PENDING',
      'APPROVED',
      'REJECTED',
      'ACTIVE',
      'CLOSED',
    ];
    return allowed.includes(status as AdminBadgeStatus) ? (status as AdminBadgeStatus) : 'PENDING';
  }

  private riskLabel(score: number | undefined): string {
    if (score == null) return 'N/A';
    if (score < 50) return 'A';
    if (score < 75) return 'B';
    return 'C';
  }

  private formatDate(value: string | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().slice(0, 10);
  }
}
