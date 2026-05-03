import { Injectable, signal } from '@angular/core';
import type { Remboursement } from '../models/remboursement.model';
import type { SavingsGoal, SavingsTransaction } from '../models/savings.model';

export type BriefSeverity = 'info' | 'warn' | 'danger';

export interface BriefNotification {
  id: string;
  severity: BriefSeverity;
  title: string;
  detail: string;
}

export interface ClientBriefingSnapshot {
  remboursements: Remboursement[];
  savingsGoals: SavingsGoal[];
  savingsAccounts: { id: number; status?: string }[];
  historyTransactions: SavingsTransaction[];
}

function todayMidnight(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseLocalDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s).trim());
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const da = Number(m[3]);
    const d = new Date(y, mo, da);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysFromToday(d: Date): number {
  const t = todayMidnight();
  const u = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((u.getTime() - t.getTime()) / 86400000);
}

@Injectable({ providedIn: 'root' })
export class ClientBriefingService {
  private readonly dismissed = new Set<string>();

  readonly items = signal<BriefNotification[]>([]);

  constructor() {
    try {
      const raw = sessionStorage.getItem('financia-brief-dismiss');
      if (raw) {
        const arr = JSON.parse(raw) as unknown;
        if (Array.isArray(arr)) {
          arr.forEach((id) => {
            if (typeof id === 'string') this.dismissed.add(id);
          });
        }
      }
    } catch {
      /* ignore */
    }
  }

  sync(snapshot: ClientBriefingSnapshot): void {
    const list = this.compute(snapshot).filter((n) => !this.dismissed.has(n.id));
    this.items.set(list);
  }

  dismiss(id: string): void {
    this.dismissed.add(id);
    this.items.update((arr) => arr.filter((n) => n.id !== id));
    sessionStorage.setItem('financia-brief-dismiss', JSON.stringify([...this.dismissed]));
  }

  clearDismissed(): void {
    this.dismissed.clear();
    sessionStorage.removeItem('financia-brief-dismiss');
  }

  private compute(s: ClientBriefingSnapshot): BriefNotification[] {
    const out: BriefNotification[] = [];

    const unpaid = (s.remboursements ?? []).filter(
      (r) => String(r.status ?? '').toUpperCase() !== 'PAID'
    );
    const today = todayMidnight();

    for (const r of unpaid) {
      const due = parseLocalDate(r.dueDate ?? undefined);
      if (!due) continue;
      if (due < today) {
        out.push({
          id: `rem-overdue-${r.id}`,
          severity: 'danger',
          title: 'Échéance en retard',
          detail: `Montant ${Number(r.amount ?? 0).toFixed(2)} TND — échéance ${r.dueDate ?? ''}.`,
        });
      } else {
        const days = daysFromToday(due);
        if (days >= 0 && days <= 7) {
          out.push({
            id: `rem-soon-${r.id}`,
            severity: 'warn',
            title: 'Échéance proche',
            detail: `À régler avant le ${r.dueDate} (${days === 0 ? "aujourd'hui" : `dans ${days} j`}).`,
          });
        }
      }
    }

    for (const g of s.savingsGoals ?? []) {
      const st = String(g.status ?? '').toUpperCase();
      if (st !== 'IN_PROGRESS') continue;
      const dl = parseLocalDate(g.deadline);
      if (!dl) continue;
      if (dl < today) {
        out.push({
          id: `goal-late-${g.id}`,
          severity: 'danger',
          title: 'Objectif en retard',
          detail: `${g.description || 'Objectif #' + g.id} — échéance dépassée (${g.deadline}).`,
        });
      } else {
        const days = daysFromToday(dl);
        if (days >= 0 && days <= 14) {
          out.push({
            id: `goal-soon-${g.id}`,
            severity: 'info',
            title: 'Échéance objectif proche',
            detail: `${g.description || 'Objectif #' + g.id} — avant le ${g.deadline} (${days} j).`,
          });
        }
      }
    }

    const activeAcc = (s.savingsAccounts ?? []).filter((a) => String(a.status ?? '').toUpperCase() === 'ACTIVE');
    if (activeAcc.length > 0) {
      const now = new Date();
      const depositsThisMonth = (s.historyTransactions ?? []).filter((t) => {
        if (String(t.type ?? '').toUpperCase() !== 'DEPOSIT') return false;
        if (!t.transactionDate) return false;
        const dt = new Date(t.transactionDate);
        return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
      });
      if (depositsThisMonth.length === 0) {
        out.push({
          id: 'suggest-deposit-month',
          severity: 'info',
          title: 'Versement suggéré',
          detail: "Aucun dépôt ce mois-ci sur votre épargne — un petit versement aide à tenir le rythme.",
        });
      }
    }

    const severityOrder: Record<BriefSeverity, number> = { danger: 0, warn: 1, info: 2 };
    out.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    return out;
  }
}
