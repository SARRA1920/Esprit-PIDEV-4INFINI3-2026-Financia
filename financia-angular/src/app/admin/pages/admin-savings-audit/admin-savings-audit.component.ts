import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SavingsAuditService } from '../../../core/savings-audit.service';
import type { SavingsAuditLogEntry } from '../../../models/savings-audit.model';

@Component({
  selector: 'app-admin-savings-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-savings-audit.component.html',
  styleUrl: './admin-savings-audit.component.scss',
})
export class AdminSavingsAuditComponent implements OnInit {
  private readonly api = inject(SavingsAuditService);

  loading = true;
  error = '';
  rows: SavingsAuditLogEntry[] = [];

  /** Filtres (côté client sur la liste chargée). */
  dateFrom = '';
  dateTo = '';
  actionFilter = '';
  userIdFilter = '';

  readonly pageSize = 15;
  pageIndex = 0;

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.error = '';
    this.api.list().subscribe({
      next: (list) => {
        this.rows = list ?? [];
        this.loading = false;
        this.pageIndex = 0;
      },
      error: (e: Error) => {
        this.error = e.message;
        this.loading = false;
      },
    });
  }

  get distinctActions(): string[] {
    const set = new Set(this.rows.map((r) => r.action).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b));
  }

  get filteredRows(): SavingsAuditLogEntry[] {
    const uid = this.userIdFilter.trim();
    const uidNum = uid ? Number(uid) : NaN;
    const hasUser = uid !== '' && Number.isFinite(uidNum);

    const fromTs = this.parseDateStart(this.dateFrom);
    const toTs = this.parseDateEnd(this.dateTo);

    return this.rows.filter((r) => {
      if (this.actionFilter && r.action !== this.actionFilter) {
        return false;
      }
      if (hasUser && r.userId !== uidNum) {
        return false;
      }
      const t = r.createdAt ? new Date(r.createdAt).getTime() : NaN;
      if (fromTs != null && Number.isFinite(t) && t < fromTs) {
        return false;
      }
      if (toTs != null && Number.isFinite(t) && t > toTs) {
        return false;
      }
      return true;
    });
  }

  get totalFiltered(): number {
    return this.filteredRows.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalFiltered / this.pageSize));
  }

  /** Borne `pageIndex` si les filtres réduisent le nombre de pages. */
  get safePageIndex(): number {
    const tp = this.totalPages;
    return Math.min(Math.max(0, this.pageIndex), tp - 1);
  }

  get pagedRows(): SavingsAuditLogEntry[] {
    const list = this.filteredRows;
    const start = this.safePageIndex * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  onFilterChange(): void {
    this.pageIndex = 0;
  }

  prevPage(): void {
    this.pageIndex = Math.max(0, this.safePageIndex - 1);
  }

  nextPage(): void {
    this.pageIndex = Math.min(this.totalPages - 1, this.safePageIndex + 1);
  }

  exportFilteredCsv(): void {
    const list = this.filteredRows;
    const header = ['Id', 'Date (UTC)', 'Action', 'Utilisateur', 'Compte', 'Montant', 'Détail'];
    const body: string[][] = list.map((r) => [
      String(r.id),
      r.createdAt ?? '',
      r.action,
      String(r.userId),
      r.accountId != null ? String(r.accountId) : '',
      r.amount != null ? String(r.amount) : '',
      r.detail ?? '',
    ]);
    const rows: string[][] = [header, ...body];
    const csv = rows.map((row) => row.map((c) => this.escapeCsvCell(c)).join(',')).join('\n');
    const stamp = this.fileStamp();
    this.downloadTextFile(`financia-audit-epargne-${stamp}.csv`, '\ufeff' + csv, 'text/csv;charset=utf-8');
  }

  actionLabel(action: string): string {
    const map: Record<string, string> = {
      OPEN_ACCOUNT: 'Ouverture compte',
      LARGE_WITHDRAWAL: 'Retrait sensible',
      LARGE_DEPOSIT: 'Dépôt important',
    };
    return map[action] ?? action;
  }

  private parseDateStart(iso: string): number | null {
    if (!iso?.trim()) {
      return null;
    }
    const t = new Date(iso + 'T00:00:00').getTime();
    return Number.isFinite(t) ? t : null;
  }

  private parseDateEnd(iso: string): number | null {
    if (!iso?.trim()) {
      return null;
    }
    const t = new Date(iso + 'T23:59:59.999').getTime();
    return Number.isFinite(t) ? t : null;
  }

  private fileStamp(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
  }

  private escapeCsvCell(v: unknown): string {
    const s = String(v ?? '');
    if (/[",\n\r]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  private downloadTextFile(filename: string, content: string, mime: string): void {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
