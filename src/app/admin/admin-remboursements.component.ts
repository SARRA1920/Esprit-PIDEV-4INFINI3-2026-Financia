import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RemboursementService } from '../core/remboursement.service';
import { CreditService } from '../core/credit.service';
import { Remboursement, RemboursementUpdateBody } from '../models/remboursement.model';
import { Credit } from '../models/credit.model';
import { AdminStatusBadgeComponent, AdminBadgeStatus } from './admin-status-badge.component';

interface RembRow {
  displayId: string;
  rembId: number;
  creditDisplay: string;
  client: string;
  amount: number;
  dueLabel: string;
  dueIso: string;
  paymentLabel: string;
  lateDays: number;
  statusUpper: string;
  statusBadge: AdminBadgeStatus;
  createdLabel: string;
  raw: Remboursement;
}

@Component({
  selector: 'app-admin-remboursements',
  standalone: true,
  imports: [AdminStatusBadgeComponent, FormsModule],
  templateUrl: './admin-remboursements.component.html',
  styleUrl: './admin-remboursements.component.scss',
})
export class AdminRemboursementsComponent implements OnInit {
  private readonly rembApi = inject(RemboursementService);
  private readonly creditApi = inject(CreditService);

  readonly filters = ['Tous', 'PENDING', 'PAID', 'FAILED', 'CANCELLED'] as const;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly rows = signal<Remboursement[]>([]);
  readonly credits = signal<Credit[]>([]);
  readonly query = signal('');
  readonly activeFilter = signal<string>('Tous');
  readonly formMsg = signal<string | null>(null);
  readonly selectedRow = signal<string | null>(null);

  readonly createOpen = signal(false);
  readonly createSaving = signal(false);
  readonly createCreditId = signal('');
  readonly createAmount = signal('');
  readonly createDueDate = signal('');

  readonly editOpen = signal(false);
  readonly editSaving = signal(false);
  readonly editId = signal<number | null>(null);
  readonly editAmount = signal('');
  readonly editDueDate = signal('');
  readonly editStatus = signal<string>('PENDING');

  readonly rembRows = computed(() => (this.rows() ?? []).map((r) => this.toRow(r)));

  readonly filteredRembRows = computed(() => {
    let list = this.rembRows();
    const f = this.activeFilter();
    if (f !== 'Tous') {
      list = list.filter((r) => r.statusUpper === f);
    }
    const q = this.query().trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => {
      const blob = [
        r.displayId,
        r.creditDisplay,
        r.client.toLowerCase(),
        String(r.amount),
        r.statusUpper,
        String(r.lateDays),
      ].join(' ');
      return blob.toLowerCase().includes(q);
    });
  });

  readonly totalVolume = computed(() =>
    this.filteredRembRows().reduce((s, r) => s + r.amount, 0)
  );

  readonly paidInFilter = computed(
    () => this.filteredRembRows().filter((r) => r.statusUpper === 'PAID').length
  );

  /** Crédits pouvant recevoir une nouvelle échéance (règles Spring). */
  readonly eligibleCredits = computed(() =>
    this.credits().filter((c) => {
      const s = (c.status || '').toUpperCase();
      return s === 'APPROVED' || s === 'ACTIVE';
    })
  );

  ngOnInit(): void {
    this.reload();
    this.creditApi.getAllCredits().subscribe({
      next: (d) => this.credits.set(d ?? []),
      error: () => this.credits.set([]),
    });
  }

  filterCount(f: string): number {
    if (f === 'Tous') return this.rembRows().length;
    return this.rembRows().filter((r) => r.statusUpper === f).length;
  }

  updateQuery(value: string): void {
    this.query.set(value);
  }

  setFilter(f: string): void {
    this.activeFilter.set(f);
  }

  paidPercent(row: RembRow): number {
    return row.statusUpper === 'PAID' ? 100 : 0;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  toggleRow(displayId: string): void {
    this.selectedRow.update((cur) => (cur === displayId ? null : displayId));
    this.formMsg.set(null);
  }

  reload(): void {
    this.loading.set(true);
    this.rembApi.getAll().subscribe({
      next: (data) => {
        this.rows.set(data ?? []);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (e: Error) => {
        this.error.set(e.message);
        this.loading.set(false);
      },
    });
  }

  private refreshList(): void {
    this.rembApi.getAll().subscribe({
      next: (d) => this.rows.set(d ?? []),
      error: (e: Error) => this.formMsg.set(e.message),
    });
  }

  openCreate(): void {
    this.formMsg.set(null);
    this.createCreditId.set('');
    this.createAmount.set('');
    this.createDueDate.set('');
    this.createOpen.set(true);
  }

  closeCreate(): void {
    if (this.createSaving()) return;
    this.createOpen.set(false);
  }

  submitCreate(): void {
    this.formMsg.set(null);
    const cid = Number(this.createCreditId());
    if (!Number.isFinite(cid) || cid <= 0) {
      this.formMsg.set('Sélectionnez un crédit.');
      return;
    }
    const amount = Number(String(this.createAmount()).replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) {
      this.formMsg.set('Montant invalide.');
      return;
    }
    const due = this.createDueDate().trim();
    this.createSaving.set(true);
    this.rembApi
      .createForCredit(cid, {
        amount,
        dueDate: due.length ? due : null,
      })
      .subscribe({
        next: () => {
          this.formMsg.set(null);
          this.createSaving.set(false);
          this.closeCreate();
          this.refreshList();
        },
        error: (e: Error) => {
          this.formMsg.set(e.message);
          this.createSaving.set(false);
        },
      });
  }

  openEdit(row: RembRow): void {
    const r = row.raw;
    this.formMsg.set(null);
    this.editId.set(r.id);
    this.editAmount.set(String(r.amount ?? ''));
    this.editDueDate.set(r.dueDate ? r.dueDate.slice(0, 10) : '');
    this.editStatus.set((r.status || 'PENDING').toUpperCase());
    this.editOpen.set(true);
  }

  closeEdit(): void {
    if (this.editSaving()) return;
    this.editOpen.set(false);
    this.editId.set(null);
  }

  submitEdit(): void {
    const id = this.editId();
    if (id == null) return;
    this.formMsg.set(null);
    const amount = Number(String(this.editAmount()).replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) {
      this.formMsg.set('Montant invalide.');
      return;
    }
    const due = this.editDueDate().trim();
    const st = this.editStatus().toUpperCase();
    const body: RemboursementUpdateBody = {
      amount,
      dueDate: due.length ? due : null,
      status: st as RemboursementUpdateBody['status'],
    };
    this.editSaving.set(true);
    this.rembApi.update(id, body).subscribe({
      next: () => {
        this.formMsg.set(null);
        this.editSaving.set(false);
        this.closeEdit();
        this.refreshList();
      },
      error: (e: Error) => {
        this.formMsg.set(e.message);
        this.editSaving.set(false);
      },
    });
  }

  markPaid(row: RembRow): void {
    this.formMsg.set(null);
    this.rembApi.pay(row.raw.id).subscribe({
      next: () => this.refreshList(),
      error: (e: Error) => this.formMsg.set(e.message),
    });
  }

  confirmDelete(row: RembRow): void {
    if (!confirm(`Supprimer l’échéance ${row.displayId} ?`)) return;
    this.formMsg.set(null);
    this.rembApi.delete(row.raw.id).subscribe({
      next: () => {
        this.selectedRow.update((cur) => (cur === row.displayId ? null : cur));
        this.refreshList();
      },
      error: (e: Error) => this.formMsg.set(e.message),
    });
  }

  exportCsv(): void {
    const list = this.filteredRembRows();
    const headers = [
      'id',
      'credit',
      'client',
      'montant',
      'echeance',
      'paiement',
      'retard_j',
      'statut',
    ];
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = list.map((r) =>
      [
        r.displayId,
        r.creditDisplay,
        r.client,
        r.amount,
        r.dueLabel,
        r.paymentLabel,
        r.lateDays,
        r.statusUpper,
      ]
        .map((v) => esc(v))
        .join(',')
    );
    const csv = '\ufeff' + [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remboursements-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  paymentToBadge(s: string | undefined): AdminBadgeStatus {
    const u = (s || '').toUpperCase();
    if (u === 'PENDING') return 'PENDING';
    if (u === 'PAID') return 'PAID';
    if (u === 'FAILED') return 'FAILED';
    if (u === 'CANCELLED') return 'CANCELLED';
    return 'PENDING';
  }

  private toRow(r: Remboursement): RembRow {
    const st = (r.status || 'PENDING').toUpperCase();
    return {
      displayId: `REM-${String(r.id).padStart(5, '0')}`,
      rembId: r.id,
      creditDisplay:
        r.creditId != null ? `CR-${String(r.creditId).padStart(5, '0')}` : '—',
      client: r.clientName?.trim() || '—',
      amount: Number(r.amount ?? 0),
      dueLabel: this.formatDateShort(r.dueDate),
      dueIso: r.dueDate ? r.dueDate.slice(0, 10) : '',
      paymentLabel: this.formatDateTime(r.paymentDate),
      lateDays: r.lateDays ?? 0,
      statusUpper: st,
      statusBadge: this.paymentToBadge(r.status),
      createdLabel: this.formatDateShort(r.createdAt ?? undefined),
      raw: r,
    };
  }

  private formatDateShort(iso: string | null | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR');
  }

  private formatDateTime(iso: string | null | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? '—'
      : d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  }
}
