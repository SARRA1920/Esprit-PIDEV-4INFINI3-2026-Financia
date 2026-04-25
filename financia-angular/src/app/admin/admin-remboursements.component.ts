import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RemboursementService } from '../core/remboursement.service';
import { CreditService } from '../core/credit.service';
import { Remboursement, RemboursementUpdateBody } from '../models/remboursement.model';
import { Credit } from '../models/credit.model';
import { AdminStatusBadgeComponent, AdminBadgeStatus } from './admin-status-badge.component';

@Component({
  selector: 'app-admin-remboursements',
  standalone: true,
  imports: [AdminStatusBadgeComponent, FormsModule, DatePipe],
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

  readonly filteredRows = computed(() => {
    let list = this.rows();
    const f = this.activeFilter();
    if (f !== 'Tous') {
      list = list.filter((r) => (r.status || '').toUpperCase() === f);
    }
    const q = this.query().trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => {
      const parts = [
        String(r.id),
        String(r.creditId ?? ''),
        (r.clientName || '').toLowerCase(),
        String(r.amount ?? ''),
      ].join(' ');
      return parts.includes(q);
    });
  });

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

  private reload(): void {
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

  setFilter(f: string): void {
    this.activeFilter.set(f);
  }

  openCreate(): void {
    this.formMsg.set(null);
    this.createCreditId.set('');
    this.createAmount.set('');
    this.createDueDate.set('');
    this.createOpen.set(true);
  }

  closeCreate(): void {
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

  openEdit(r: Remboursement): void {
    this.formMsg.set(null);
    this.editId.set(r.id);
    this.editAmount.set(String(r.amount ?? ''));
    this.editDueDate.set(r.dueDate ? r.dueDate.slice(0, 10) : '');
    this.editStatus.set((r.status || 'PENDING').toUpperCase());
    this.editOpen.set(true);
  }

  closeEdit(): void {
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

  markPaid(r: Remboursement): void {
    this.formMsg.set(null);
    this.rembApi.pay(r.id).subscribe({
      next: () => {
        this.refreshList();
      },
      error: (e: Error) => this.formMsg.set(e.message),
    });
  }

  confirmDelete(r: Remboursement): void {
    if (!confirm(`Supprimer l’échéance #${r.id} ?`)) return;
    this.formMsg.set(null);
    this.rembApi.delete(r.id).subscribe({
      next: () => this.refreshList(),
      error: (e: Error) => this.formMsg.set(e.message),
    });
  }

  paymentToBadge(s: string | undefined): AdminBadgeStatus {
    const u = (s || '').toUpperCase();
    if (u === 'PENDING') return 'PENDING';
    if (u === 'PAID') return 'PAID';
    if (u === 'FAILED') return 'FAILED';
    if (u === 'CANCELLED') return 'CANCELLED';
    return 'PENDING';
  }

  formatMoney(n: number | undefined): string {
    if (n == null || Number.isNaN(Number(n))) return '—';
    return `${Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 3 })} €`;
  }
}
