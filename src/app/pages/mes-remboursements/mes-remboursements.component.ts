import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { AuthService } from '../../core/auth.service';
import { CreditService } from '../../core/credit.service';
import { RemboursementService } from '../../core/remboursement.service';
import { Credit } from '../../models/credit.model';
import { Remboursement } from '../../models/remboursement.model';

/** Ligne affichée : échéance + référence crédit (Spring fournit déjà les montants / dates par id crédit). */
export interface RemboursementVue extends Remboursement {
  creditRef: number;
}

@Component({
  selector: 'app-mes-remboursements',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './mes-remboursements.component.html',
  styleUrl: './mes-remboursements.component.scss',
})
export class MesRemboursementsComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly credits = inject(CreditService);
  private readonly remboursementsApi = inject(RemboursementService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const u = this.auth.user();
      if (!u?.idUser) {
        this.rows = [];
        this.error = '';
        this.loading = false;
      }
    });
  }

  loading = true;
  error = '';
  /** Toutes les échéances de tous les crédits éligibles, triées par date d’échéance. */
  rows: RemboursementVue[] = [];

  ngOnInit(): void {
    const u = this.auth.user();
    if (!u?.idUser) {
      this.loading = false;
      return;
    }

    this.credits
      .listByUser(u.idUser)
      .pipe(
        switchMap((creditList) => {
          const eligible = creditList.filter((c) => this.eligibleCreditForRemboursements(c));
          if (!eligible.length) return of<RemboursementVue[]>([]);
          return forkJoin(
            eligible.map((credit) =>
              this.remboursementsApi.getByCredit(credit.id).pipe(
                catchError(() => of([] as Remboursement[])),
                map((list) =>
                  list.map((r) => ({
                    ...r,
                    creditRef: credit.id,
                  })),
                ),
              ),
            ),
          ).pipe(
            map((chunks) => {
              const flat = chunks.flat() as RemboursementVue[];
              return [...flat].sort((a, b) =>
                String(a.dueDate ?? '').localeCompare(String(b.dueDate ?? '')),
              );
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (list) => {
          this.rows = list;
          this.loading = false;
        },
        error: (e: Error) => {
          this.error = e.message;
          this.loading = false;
        },
      });
  }

  private eligibleCreditForRemboursements(c: Credit): boolean {
    const s = String(c.status ?? '').toUpperCase();
    return !['OFFER_PENDING', 'PENDING', 'REJECTED'].includes(s);
  }

  statusLabel(s: string | undefined): string {
    const u = String(s ?? '').toUpperCase();
    if (u === 'PAID') return 'Payé';
    if (u === 'PENDING') return 'À payer';
    if (u === 'FAILED') return 'Échoué';
    if (u === 'CANCELLED') return 'Annulé';
    return s ?? '—';
  }
}
