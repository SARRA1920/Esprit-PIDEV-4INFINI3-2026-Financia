import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreditService } from '../core/credit.service';
import { AdminUsersService } from '../core/admin-users.service';
import { ContratService } from '../core/contrat.service';
import { Credit, CreditRequest, CreditUpdateBody } from '../models/credit.model';
import { AdminUserListItem } from '../models/admin-user.model';
import { AdminStatusBadgeComponent, AdminBadgeStatus } from './admin-status-badge.component';
import { AdminCreateContractModalComponent } from './admin-create-contract-modal.component';

interface CreditRow {
  creditId: number;
  userId?: number;
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
  startDateIso: string;
  endDateIso: string;
}

@Component({
  selector: 'app-admin-credits',
  standalone: true,
  imports: [AdminStatusBadgeComponent, FormsModule, AdminCreateContractModalComponent],
  templateUrl: './admin-credits.component.html',
  styleUrl: './admin-credits.component.scss',
})
export class AdminCreditsComponent implements OnInit {
  private readonly creditApi = inject(CreditService);
  private readonly usersApi = inject(AdminUsersService);
  private readonly contratService = inject(ContratService);

  readonly filters = ['Tous', 'PENDING', 'OFFER_PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'CLOSED'] as const;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly credits = signal<CreditRow[]>([]);
  readonly activeFilter = signal<string>('Tous');
  readonly query = signal('');
  readonly selectedRow = signal<string | null>(null);

  readonly createOpen = signal(false);
  readonly createSaving = signal(false);
  readonly createError = signal<string | null>(null);
  readonly usersForSelect = signal<AdminUserListItem[]>([]);
  readonly usersLoading = signal(false);

  readonly saveBusyId = signal<number | null>(null);
  readonly recalcBusyId = signal<number | null>(null);
  readonly deleteBusyId = signal<number | null>(null);
  readonly panelError = signal<string | null>(null);
  
  readonly createContractOpen = signal(false);
  readonly selectedCreditForContract = signal<CreditRow | null>(null);
  readonly checkingContract = signal<number | null>(null);
  readonly contractExists = signal<Map<number, boolean>>(new Map());

  createForm = {
    userId: null as number | null,
    amount: 5000,
    durationMonths: 12,
    startDate: '',
  };

  editForm = {
    amount: 0,
    durationMonths: 12,
    startDate: '',
    endDate: '',
    status: '' as '' | 'ACTIVE' | 'CLOSED',
  };

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
    const cur = this.selectedRow();
    if (cur === id) {
      this.selectedRow.set(null);
      this.panelError.set(null);
      return;
    }
    this.selectedRow.set(id);
    this.panelError.set(null);
    const row =
      this.filteredCredits().find((c) => c.id === id) ?? this.credits().find((c) => c.id === id);
    if (row) {
      this.editForm = {
        amount: row.amount,
        durationMonths: row.duration,
        startDate: row.startDateIso,
        endDate: row.endDateIso,
        status: row.status === 'ACTIVE' || row.status === 'CLOSED' ? row.status : '',
      };
    }
  }

  openCreate(): void {
    this.createError.set(null);
    this.createForm = { userId: null, amount: 5000, durationMonths: 12, startDate: '' };
    this.createOpen.set(true);
    this.ensureUsersLoaded();
  }

  closeCreate(): void {
    if (this.createSaving()) return;
    this.createOpen.set(false);
  }

  private ensureUsersLoaded(): void {
    if (this.usersForSelect().length > 0) return;
    this.usersLoading.set(true);
    this.usersApi.getAllUsers().subscribe({
      next: (list) => {
        this.usersForSelect.set(list ?? []);
        this.usersLoading.set(false);
      },
      error: (e: Error) => {
        this.createError.set(e.message);
        this.usersLoading.set(false);
      },
    });
  }

  submitCreate(): void {
    const uid = this.createForm.userId;
    if (uid == null) {
      this.createError.set('Choisissez un client.');
      return;
    }
    if (this.createForm.amount <= 0 || this.createForm.durationMonths <= 0) {
      this.createError.set('Montant et durée doivent être positifs.');
      return;
    }
    const body: CreditRequest = {
      amount: this.createForm.amount,
      durationMonths: this.createForm.durationMonths,
      startDate: this.createForm.startDate ? this.createForm.startDate : null,
    };
    this.createSaving.set(true);
    this.createError.set(null);
    this.creditApi.create(uid, body).subscribe({
      next: () => {
        this.createSaving.set(false);
        this.createOpen.set(false);
        this.fetchCredits();
      },
      error: (e: Error) => {
        this.createError.set(e.message);
        this.createSaving.set(false);
      },
    });
  }

  saveUpdate(row: CreditRow): void {
    const body: CreditUpdateBody = {
      amount: this.editForm.amount,
      durationMonths: this.editForm.durationMonths,
      startDate: this.editForm.startDate ? this.editForm.startDate : null,
      endDate: this.editForm.endDate ? this.editForm.endDate : null,
    };
    if (this.editForm.status === 'ACTIVE' || this.editForm.status === 'CLOSED') {
      body.status = this.editForm.status;
    }
    this.saveBusyId.set(row.creditId);
    this.panelError.set(null);
    this.creditApi.updateCredit(row.creditId, body).subscribe({
      next: () => {
        this.saveBusyId.set(null);
        this.fetchCredits();
      },
      error: (e: Error) => {
        this.saveBusyId.set(null);
        this.panelError.set(e.message);
      },
    });
  }

  recalculate(row: CreditRow): void {
    this.recalcBusyId.set(row.creditId);
    this.panelError.set(null);
    this.creditApi.recalculateRisk(row.creditId).subscribe({
      next: () => {
        this.recalcBusyId.set(null);
        this.fetchCredits();
      },
      error: (e: Error) => {
        this.recalcBusyId.set(null);
        this.panelError.set(e.message);
      },
    });
  }

  deleteCredit(row: CreditRow): void {
    if (!confirm(`Supprimer définitivement le dossier ${row.id} ? Cette action est irréversible.`)) {
      return;
    }
    this.deleteBusyId.set(row.creditId);
    this.panelError.set(null);
    this.creditApi.deleteCredit(row.creditId).subscribe({
      next: () => {
        this.deleteBusyId.set(null);
        this.selectedRow.set(null);
        this.fetchCredits();
      },
      error: (e: Error) => {
        this.deleteBusyId.set(null);
        this.panelError.set(e.message);
      },
    });
  }

  exportCsv(): void {
    const rows = this.filteredCredits();
    const headers = ['id', 'client', 'user_id', 'montant', 'taux_pct', 'duree_mois', 'statut', 'score', 'reste', 'cree_le'];
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = rows.map((r) =>
      [
        r.id,
        r.client,
        r.userId ?? '',
        r.amount,
        r.rate,
        r.duration,
        r.status,
        r.riskScore,
        r.remaining,
        r.created,
      ]
        .map((v) => esc(v))
        .join(',')
    );
    const csv = '\ufeff' + [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credits-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  openCreateContract(row: CreditRow): void {
    this.selectedCreditForContract.set(row);
    this.createContractOpen.set(true);
  }

  closeCreateContract(): void {
    this.createContractOpen.set(false);
    this.selectedCreditForContract.set(null);
  }

  onContractCreated(): void {
    this.createContractOpen.set(false);
    this.selectedCreditForContract.set(null);
    // Refresh the contract existence check
    const row = this.selectedCreditForContract();
    if (row) {
      this.contractExists().set(row.creditId, true);
    }
    alert('Contrat créé avec succès! Vous pouvez maintenant le voir dans la section Contrats.');
  }

  checkContractExists(creditId: number): void {
    if (this.contractExists().has(creditId)) return;
    
    this.checkingContract.set(creditId);
    this.contratService.getContratByCreditId(creditId).subscribe({
      next: () => {
        this.contractExists().set(creditId, true);
        this.checkingContract.set(null);
      },
      error: () => {
        this.contractExists().set(creditId, false);
        this.checkingContract.set(null);
      },
    });
  }

  hasContract(creditId: number): boolean {
    return this.contractExists().get(creditId) === true;
  }

  isCheckingContract(creditId: number): boolean {
    return this.checkingContract() === creditId;
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
    const p = Math.round(((credit.amount - credit.remaining) / credit.amount) * 100);
    return Math.max(0, Math.min(100, p));
  }

  private toRow(credit: Credit): CreditRow {
    return {
      creditId: credit.id,
      userId: credit.userId,
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
      startDateIso: this.toDateInputValue(credit.startDate),
      endDateIso: this.toDateInputValue(credit.endDate),
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
    // Aligné sur CreditScoringService.decideStatus : plus le score est haut, meilleur le dossier.
    if (score >= 75) return 'A';
    if (score >= 55) return 'B';
    return 'C';
  }

  private toDateInputValue(value: string | undefined): string {
    if (!value) return '';
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return value.length >= 10 ? value.slice(0, 10) : value;
  }

  private formatDate(value: string | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().slice(0, 10);
  }
}
