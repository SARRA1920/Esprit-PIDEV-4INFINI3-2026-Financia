import { Injectable, inject } from '@angular/core';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SavingsService } from './savings.service';
import { AdminUsersService } from './admin-users.service';
import { CreditService } from './credit.service';
import type { SavingsAccount } from '../models/savings.model';
import type { AdminUserListItem } from '../models/admin-user.model';
import type { Credit } from '../models/credit.model';

export type AdminSearchHitAccount = { kind: 'account'; id: number; label: string; sub: string; link: string };
export type AdminSearchHitUser = { kind: 'user'; id: number; label: string; sub: string; link: string };
export type AdminSearchHitCredit = { kind: 'credit'; id: number; label: string; sub: string; link: string };

export type AdminSearchResults = {
  accounts: AdminSearchHitAccount[];
  users: AdminSearchHitUser[];
  credits: AdminSearchHitCredit[];
};

@Injectable({ providedIn: 'root' })
export class AdminGlobalSearchService {
  private readonly savings = inject(SavingsService);
  private readonly usersApi = inject(AdminUsersService);
  private readonly creditsApi = inject(CreditService);

  search(query: string): Observable<AdminSearchResults> {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      return of({ accounts: [], users: [], credits: [] });
    }

    return forkJoin({
      accounts: this.savings.listAccounts().pipe(catchError(() => of([] as SavingsAccount[]))),
      users: this.usersApi.getAllUsers().pipe(catchError(() => of([] as AdminUserListItem[]))),
      credits: this.creditsApi.listAll().pipe(catchError(() => of([] as Credit[]))),
    }).pipe(
      map(({ accounts, users, credits }) => {
        const accHits = (accounts ?? [])
          .filter((a) => this.matchAccount(a, q))
          .slice(0, 5)
          .map(
            (a): AdminSearchHitAccount => ({
              kind: 'account',
              id: a.id,
              label: `Compte #${a.id} — ${a.accountNumber}`,
              sub: [a.user?.email, a.status, a.user?.firstName].filter(Boolean).join(' · '),
              link: `/admin/savings/accounts?highlight=${encodeURIComponent(String(a.id))}`,
            })
          );

        const userHits = (users ?? [])
          .filter((u) => this.matchUser(u, q))
          .slice(0, 5)
          .map(
            (u): AdminSearchHitUser => ({
              kind: 'user',
              id: u.idUser,
              label: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
              sub: `${u.email} · ${u.role ?? '—'}`,
              link: `/admin/clients?q=${encodeURIComponent(String(u.idUser))}`,
            })
          );

        const creditHits = (credits ?? [])
          .filter((c) => this.matchCredit(c, q))
          .slice(0, 5)
          .map(
            (c): AdminSearchHitCredit => ({
              kind: 'credit',
              id: c.id,
              label: `Crédit #${c.id} — ${c.amount ?? '—'} TND`,
              sub: [c.user?.email, c.status].filter(Boolean).join(' · '),
              link: `/admin/credits?q=${encodeURIComponent(String(c.id))}`,
            })
          );

        return { accounts: accHits, users: userHits, credits: creditHits };
      })
    );
  }

  private matchAccount(a: SavingsAccount, q: string): boolean {
    const hay = [
      a.id,
      a.accountNumber,
      a.status,
      a.type,
      a.user?.email,
      a.user?.firstName,
      a.user?.lastName,
      a.user?.idUser,
    ]
      .filter((x) => x != null && x !== '')
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  }

  private matchUser(u: AdminUserListItem, q: string): boolean {
    const hay = [u.idUser, u.email, u.firstName, u.lastName, u.phone, u.address, u.role]
      .filter((x) => x != null && x !== '')
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  }

  private matchCredit(c: Credit, q: string): boolean {
    const hay = [c.id, c.amount, c.status, c.user?.email, c.user?.idUser, c.durationMonths]
      .filter((x) => x != null && x !== '')
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  }
}
