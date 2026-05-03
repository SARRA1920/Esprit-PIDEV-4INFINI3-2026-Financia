import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SavingsService } from '../../core/savings.service';
import { SavingsAccount } from '../../models/savings.model';

@Component({
  selector: 'app-savings-account-list',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './savings-account-list.component.html',
  styleUrls: ['./savings-account-list.component.scss'],
})
export class SavingsAccountListComponent implements OnInit {
  private readonly savings = inject(SavingsService);
  private readonly route = inject(ActivatedRoute);

  /** Rapport texte généré côté Spring (`GET .../accounts/{id}/report`) — absent de l’espace client. */
  readonly reportLoadingId = signal<number | null>(null);

  readonly accounts = signal<SavingsAccount[]>([]);
  readonly displayedAccounts = computed(() => {
    const list = this.accounts();
    const st = this.filterStatus();
    if (!st) {
      return list;
    }
    return list.filter((a) => String(a.status ?? '').toUpperCase() === st);
  });
  readonly error = signal('');
  readonly loading = signal(true);
  /** Compte à mettre en avant (recherche admin ou lien direct). */
  readonly highlightAccountId = signal<number | null>(null);
  readonly filterStatus = signal<string | null>(null);

  ngOnInit(): void {
    const h = this.route.snapshot.queryParamMap.get('highlight');
    if (h) {
      const id = Number(h);
      if (Number.isFinite(id)) {
        this.highlightAccountId.set(id);
      }
    }
    const st = this.route.snapshot.queryParamMap.get('status');
    if (st) {
      this.filterStatus.set(st.toUpperCase());
    }
    this.loadAccounts();
  }

  openServerReport(accountId: number): void {
    this.reportLoadingId.set(accountId);
    this.savings.generateReport(accountId).subscribe({
      next: (text) => {
        this.reportLoadingId.set(null);
        const w = window.open('', '_blank');
        if (!w) {
          return;
        }
        const safe = String(text ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        w.document.write(
          `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/><title>Rapport compte #${accountId}</title></head><body style="font-family:system-ui,sans-serif;padding:24px;white-space:pre-wrap;background:#0f172a;color:#e2e8f0">${safe}</body></html>`
        );
        w.document.close();
      },
      error: () => {
        this.reportLoadingId.set(null);
      },
    });
  }

  loadAccounts(): void {
    this.loading.set(true);
    this.error.set('');
    this.savings.listAccounts().subscribe({
      next: (data) => {
        this.accounts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
