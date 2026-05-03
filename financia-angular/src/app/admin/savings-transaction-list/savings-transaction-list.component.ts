import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, finalize, map, of, switchMap } from 'rxjs';
import { SavingsService } from '../../core/savings.service';
import { SavingsTransaction } from '../../models/savings.model';

@Component({
  selector: 'app-savings-transaction-list',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './savings-transaction-list.component.html',
  styleUrls: ['./savings-transaction-list.component.scss'],
})
export class SavingsTransactionListComponent {
  private readonly savings = inject(SavingsService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly transactions = signal<SavingsTransaction[]>([]);
  readonly error = signal('');
  readonly loading = signal(true);

  /** Données déjà restreintes par l’endpoint `/transactions/flagged` (pas de filtre client). */
  readonly loadedViaFlaggedEndpoint = signal(false);
  readonly filterAccountId = signal<number | null>(null);
  readonly filterFlaggedOnly = signal(false);

  readonly displayedTransactions = computed(() => {
    const list = this.transactions();
    if (this.loadedViaFlaggedEndpoint()) {
      return list;
    }
    if (this.filterFlaggedOnly()) {
      return list.filter((t) => Boolean(t.flagged));
    }
    return list;
  });

  readonly filterSummary = computed(() => {
    const acc = this.filterAccountId();
    const fl = this.filterFlaggedOnly();
    if (acc != null && fl) {
      return `Compte #${acc} — transactions signalées uniquement`;
    }
    if (acc != null) {
      return `Compte #${acc} — tous les mouvements`;
    }
    if (fl) {
      return `Toutes les transactions signalées (endpoint métier)`;
    }
    return null as string | null;
  });

  constructor() {
    this.route.queryParamMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const rawAcc = params.get('accountId');
          const accountId = rawAcc ? Number(rawAcc) : NaN;
          const hasAcc = Number.isFinite(accountId) && accountId > 0;
          const flagged = params.get('flagged') === '1';

          this.filterAccountId.set(hasAcc ? accountId : null);
          this.filterFlaggedOnly.set(flagged);
          this.loadedViaFlaggedEndpoint.set(false);
          this.loading.set(true);
          this.error.set('');

          let req: Observable<SavingsTransaction[]>;
          if (hasAcc) {
            req = this.savings.listTransactionsByAccount(accountId);
          } else if (flagged) {
            this.loadedViaFlaggedEndpoint.set(true);
            req = this.savings.listFlaggedTransactions();
          } else {
            req = this.savings.listTransactions();
          }

          return req.pipe(
            map((data) => data ?? []),
            catchError((err: Error) => {
              this.error.set(err.message);
              return of([] as SavingsTransaction[]);
            }),
            finalize(() => this.loading.set(false))
          );
        })
      )
      .subscribe((data) => this.transactions.set(data));
  }
}
