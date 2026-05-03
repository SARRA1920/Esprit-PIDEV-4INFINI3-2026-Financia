import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SavingsStatsService } from '../../core/savings-stats.service';
import { SavingsService } from '../../core/savings.service';
import { ToastService } from '../../core/toast.service';
import { AdminStatusBadgeComponent, AdminBadgeStatus } from '../admin-status-badge.component';
import { SavingsAccount, SavingsTransaction } from '../../models/savings.model';

type SystemStats = {
  totalAccounts: number;
  activeAccounts: number;
  closedAccounts: number;
  totalSystemSavings: number;
  totalGoals: number;
  averageGoalCompletionRate: number;
};

interface RecentAction {
  time: string;
  actor: string;
  action: string;
  entity: string;
  status: AdminBadgeStatus;
}

type ChartDatum = { name: string; value: number };
type VolumePeriod = '7d' | '30d' | 'all';
type ActivityLevel = 'High' | 'Medium' | 'Low' | string;

type AccountStats = {
  totalDeposits: number;
  totalWithdrawals: number;
  currentBalance: number;
  averageDeposit: number;
  monthlyTransactionCount: number;
  growthRatePercent: number;
  liquidityRatioPercent: number;
  activityLevel: ActivityLevel;
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, AdminStatusBadgeComponent, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private savingsStatsService = inject(SavingsStatsService);
  private savingsService = inject(SavingsService);
  private readonly toast = inject(ToastService);

  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  donutSegments: any[] = [];
  statusData: any[] = [];

  colorScheme: any = {
    domain: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']
  };

  donutColorScheme: any = {
    domain: ['#334155', '#10b981']
  };

  barColorScheme: any = {
    domain: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6']
  };

  loading = true;
  error = '';

  // Pie chart data
  accountStatusChartData: ChartDatum[] = [];
  entityTotalsChartData: ChartDatum[] = [];
  depositWithdrawChartData: ChartDatum[] = [];
  anomalyChartData: ChartDatum[] = [];
  topAnomalyChartData: ChartDatum[] = [];
  basicStatsPieData: any[] = []; // NOUVEAU GRAPHIQUE
  stats: SystemStats = {
    totalAccounts: 0,
    activeAccounts: 0,
    closedAccounts: 0,
    totalSystemSavings: 0,
    totalGoals: 0,
    averageGoalCompletionRate: 0,
  };

  recentActivity: RecentAction[] = [];

  // Derived KPI (from system stats + transactions)
  suspendedAccounts = 0;
  depositsTotal = 0;
  withdrawalsTotal = 0;
  flaggedCount = 0;
  avgAnomalyScore = 0;

  readonly volumePeriod = signal<VolumePeriod>('30d');
  private allTransactions: SavingsTransaction[] = [];
  volumeExcludedMissingDates = 0;

  /** Prévisualisation / export CSV & XLSX depuis la barre d’outils. */
  readonly exportModalKind = signal<'kpi' | 'tx' | null>(null);
  /** Horodatage figé à l’ouverture de la modale (nom de fichier cohérent). */
  readonly exportModalStamp = signal('');
  readonly exportModalTitle = computed(() =>
    this.exportModalKind() === 'kpi'
      ? 'Exporter la synthèse KPI'
      : this.exportModalKind() === 'tx'
        ? 'Exporter les transactions'
        : ''
  );

  // Account-level analytics (StatisticsService.getAccountStatistics)
  readonly accounts = signal<SavingsAccount[]>([]);
  readonly selectedAccountId = signal<number | null>(null);
  readonly accountStats = signal<AccountStats | null>(null);
  readonly accountStatsError = signal('');
  readonly accountStatsLoading = signal(false);

  smsTesting = false;
  smsMessage = '';

  accountStatsKpis: ChartDatum[] = [];
  accountStatsFlowsChartData: ChartDatum[] = [];
  accountStatsHealthChartData: ChartDatum[] = [];

  ngOnInit(): void {
    // Carregar stats
    this.savingsStatsService.getSystemStatistics().subscribe({
      next: (stats: SystemStats) => {
        this.stats = {
          totalAccounts: Number(stats.totalAccounts ?? 0),
          activeAccounts: Number(stats.activeAccounts ?? 0),
          closedAccounts: Number(stats.closedAccounts ?? 0),
          totalSystemSavings: Number(stats.totalSystemSavings ?? 0),
          totalGoals: Number(stats.totalGoals ?? 0),
          averageGoalCompletionRate: Number(stats.averageGoalCompletionRate ?? 0),
        };

        const suspended = Math.max(
          0,
          this.stats.totalAccounts - this.stats.activeAccounts - this.stats.closedAccounts
        );
        this.suspendedAccounts = suspended;

        // Coherent chart: distribution of account statuses only.
        this.accountStatusChartData = [
          { name: 'Actifs', value: this.stats.activeAccounts },
          { name: 'Fermés', value: this.stats.closedAccounts },
          { name: 'Suspendus', value: suspended },
        ];
        
        this.statusData = [
          { name: 'Comptes Actifs', value: this.stats.activeAccounts, color: '#10b981' },
          { name: 'Comptes Fermés', value: this.stats.closedAccounts, color: '#ef4444' },
        ];
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err?.message || 'Impossible de charger les statistiques';
        this.loading = false;
      }
    });

    // C'EST ICI QU'ON CHARGE LE DEUXIÈME GRAPHIQUE
    this.savingsStatsService.getBasicStats().subscribe({
      next: (res: any) => {
        const accounts = Number(res?.accounts ?? 0);
        const goals = Number(res?.goals ?? 0);
        const transactions = Number(res?.transactions ?? 0);

        // Keep legacy binding used in the template for now.
        this.basicStatsPieData = [
          { name: 'Comptes', value: accounts },
          { name: 'Objectifs', value: goals },
          { name: 'Transactions', value: transactions }
        ];

        // New name (same data), for clearer intent in the template.
        this.entityTotalsChartData = [
          { name: 'Comptes', value: res.accounts || 0 },
          { name: 'Objectifs', value: res.goals || 0 },
          { name: 'Transactions', value: res.transactions || 0 }
        ].map((x) => ({ name: x.name, value: Number(x.value ?? 0) }));
      },
      error: () => {}
    });

    // Chargement de l'activité récente (transactions)
    this.savingsService.listTransactions().subscribe({
      next: (txs) => {
        this.allTransactions = txs ?? [];
        this.computeTransactionInsights(this.allTransactions);
        // Prendre les 10 dernières pour activité
        const top = txs.slice(-10).reverse();
        this.recentActivity = top.map(tx => ({
          time: tx.transactionDate ? new Date(tx.transactionDate).toLocaleString('fr-FR', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
          }) : 'N/A',
          actor: tx.savingsAccount?.accountNumber || `ACC-${tx.savingsAccount?.id || '?'}`,
          action: tx.type === 'DEPOSIT' ? 'Dépôt' : 'Retrait',
          entity: `${tx.amount} TND`,
          status: (tx.status as AdminBadgeStatus) || 'PENDING'
        }));
      },
      error: () => {}
    });

    // Account list for "Analyse compte"
    this.savingsService.listAccounts().subscribe({
      next: (accs) => {
        const list = accs ?? [];
        this.accounts.set(list);

        // Auto-select first account for a useful dashboard experience
        const firstId = list[0]?.id ?? null;
        if (firstId && !this.selectedAccountId()) {
          this.selectAccountForAnalytics(firstId);
        }
      },
      error: () => {},
    });
  }

  testSms(): void {
    this.smsTesting = true;
    this.smsMessage = '';
    this.savingsService.sendTestSms().subscribe({
      next: (msg) => {
        this.smsTesting = false;
        this.smsMessage = msg ?? 'SMS envoyé.';
      },
      error: (err: Error) => {
        this.smsTesting = false;
        this.smsMessage = err?.message ?? 'Échec envoi SMS';
      },
    });
  }

  onAccountChange(event: Event): void {
    const el = event.target as HTMLSelectElement | null;
    const raw = el?.value;
    if (!raw) {
      this.selectedAccountId.set(null);
      this.accountStats.set(null);
      this.accountStatsError.set('Sélectionne un compte valide.');
      return;
    }

    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) {
      this.selectedAccountId.set(null);
      this.accountStats.set(null);
      this.accountStatsError.set('Sélection de compte invalide.');
      return;
    }

    this.selectAccountForAnalytics(id);
  }

  selectAccountForAnalytics(accountId: number): void {
    this.selectedAccountId.set(accountId);
    this.loadAccountStats(accountId);
  }

  private loadAccountStats(accountId: number): void {
    this.accountStatsError.set('');
    this.accountStatsLoading.set(true);
    this.savingsService.getAccountStatistics(accountId).subscribe({
      next: (raw) => {
        const stats: AccountStats = {
          totalDeposits: Number(raw?.['totalDeposits'] ?? 0),
          totalWithdrawals: Number(raw?.['totalWithdrawals'] ?? 0),
          currentBalance: Number(raw?.['currentBalance'] ?? 0),
          averageDeposit: Number(raw?.['averageDeposit'] ?? 0),
          monthlyTransactionCount: Number(raw?.['monthlyTransactionCount'] ?? 0),
          growthRatePercent: Number(raw?.['growthRatePercent'] ?? 0),
          liquidityRatioPercent: Number(raw?.['liquidityRatioPercent'] ?? 0),
          activityLevel: String(raw?.['activityLevel'] ?? 'N/A'),
        };
        this.accountStats.set(stats);
        this.computeAccountStatsCharts(stats);
        this.accountStatsLoading.set(false);
      },
      error: (err: Error) => {
        this.accountStatsError.set(err?.message || 'Impossible de charger les stats du compte');
        this.accountStats.set(null);
        this.accountStatsLoading.set(false);
      },
    });
  }

  private computeAccountStatsCharts(s: AccountStats): void {
    this.accountStatsFlowsChartData = [
      { name: 'Dépôts', value: s.totalDeposits },
      { name: 'Retraits', value: s.totalWithdrawals },
    ];

    // “Health” view: liquidity & growth are % (0-100+)
    this.accountStatsHealthChartData = [
      { name: 'Liquidité (%)', value: Math.max(0, s.liquidityRatioPercent) },
      { name: 'Croissance (%)', value: Math.max(0, s.growthRatePercent) },
      { name: 'Tx/mois', value: Math.max(0, s.monthlyTransactionCount) },
    ];

    this.accountStatsKpis = [
      { name: 'Solde', value: s.currentBalance },
      { name: 'Dépôt moyen', value: s.averageDeposit },
    ];
  }

  setVolumePeriod(p: VolumePeriod): void {
    this.volumePeriod.set(p);
    this.computeVolumesOnly(this.allTransactions);
  }

  volumePeriodLabel(): string {
    switch (this.volumePeriod()) {
      case '7d':
        return '7 derniers jours';
      case '30d':
        return '30 derniers jours';
      default:
        return 'Total (toutes périodes)';
    }
  }

  private computeTransactionInsights(txs: SavingsTransaction[]): void {
    this.computeVolumesOnly(txs);

    const flagged = txs.filter((t) => Boolean(t.flagged));
    this.flaggedCount = flagged.length;

    const anomalyScores = txs
      .map((t) => Number(t.anomalyScore ?? 0))
      .filter((n) => Number.isFinite(n) && n > 0);
    this.avgAnomalyScore = anomalyScores.length
      ? anomalyScores.reduce((a, b) => a + b, 0) / anomalyScores.length
      : 0;

    this.anomalyChartData = [
      { name: 'Flaggées', value: this.flaggedCount },
      { name: 'Normales', value: Math.max(0, txs.length - this.flaggedCount) },
    ];

    // Top 5 anomalies by score (bar chart)
    this.topAnomalyChartData = [...txs]
      .filter((t) => Number(t.anomalyScore ?? 0) > 0)
      .sort((a, b) => Number(b.anomalyScore ?? 0) - Number(a.anomalyScore ?? 0))
      .slice(0, 5)
      .map((t) => ({
        name: `TX #${t.id}`,
        value: Number(t.anomalyScore ?? 0),
      }));
  }

  private computeVolumesOnly(txs: SavingsTransaction[]): void {
    const missingDates = txs.filter((t) => !t.transactionDate).length;
    this.volumeExcludedMissingDates =
      this.volumePeriod() === 'all' ? 0 : missingDates;

    const filtered = this.filterByVolumePeriod(txs, this.volumePeriod());

    const deposits = filtered.filter((t) => t.type === 'DEPOSIT');
    const withdrawals = filtered.filter((t) => t.type === 'WITHDRAWAL');

    const sum = (items: SavingsTransaction[]) =>
      items.reduce((acc, t) => acc + Number(t.amount ?? 0), 0);

    this.depositsTotal = sum(deposits);
    this.withdrawalsTotal = sum(withdrawals);

    this.depositWithdrawChartData = [
      { name: 'Dépôts', value: this.depositsTotal },
      { name: 'Retraits', value: this.withdrawalsTotal },
    ];
  }

  private filterByVolumePeriod(txs: SavingsTransaction[], period: VolumePeriod): SavingsTransaction[] {
    if (period === 'all') return txs;

    const days = period === '7d' ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    return txs.filter((t) => {
      if (!t.transactionDate) return false;
      const ts = new Date(t.transactionDate).getTime();
      if (!Number.isFinite(ts)) return false;
      return ts >= cutoff;
    });
  }

  get total(): number {
    return this.stats.totalAccounts;
  }

  percent(value: number): number {
    if (!this.total) return 0;
    return Math.round((value / this.total) * 100);
  }

  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  exportFileStamp(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
  }

  openExportPreview(kind: 'kpi' | 'tx'): void {
    this.exportModalStamp.set(this.exportFileStamp());
    this.exportModalKind.set(kind);
  }

  closeExportModal(): void {
    this.exportModalKind.set(null);
    this.exportModalStamp.set('');
  }

  getExportRows(): string[][] {
    const kind = this.exportModalKind();
    if (kind === 'kpi') {
      return this.buildKpiRows();
    }
    if (kind === 'tx') {
      return this.buildTxRows();
    }
    return [];
  }

  getExportPreviewRows(): string[][] {
    return this.getExportRows().slice(0, 6);
  }

  exportModalFilenameStem(): string {
    const kind = this.exportModalKind();
    if (kind === 'kpi') {
      return 'financia-admin-dashboard-kpi';
    }
    if (kind === 'tx') {
      return 'financia-admin-transactions';
    }
    return 'financia-export';
  }

  confirmExportCsv(): void {
    const rows = this.getExportRows();
    if (!rows.length) {
      this.closeExportModal();
      return;
    }
    const csv = rows.map((r) => r.map((c) => this.escapeCsvCell(c)).join(',')).join('\n');
    const stamp = this.exportModalStamp() || this.exportFileStamp();
    const stem = this.exportModalFilenameStem();
    this.downloadTextFile(`${stem}-${stamp}.csv`, '\ufeff' + csv, 'text/csv;charset=utf-8');
    const kind = this.exportModalKind();
    this.closeExportModal();
    this.toast.show(
      kind === 'tx' ? `CSV transactions (${this.allTransactions.length} lignes).` : 'CSV synthèse téléchargé.',
      'success',
      3200
    );
  }

  async confirmExportXlsx(): Promise<void> {
    const rows = this.getExportRows();
    if (!rows.length) {
      this.closeExportModal();
      return;
    }
    const kind = this.exportModalKind();
    const stamp = this.exportModalStamp() || this.exportFileStamp();
    const stem = this.exportModalFilenameStem();
    const sheet = kind === 'tx' ? 'Transactions' : 'KPI';
    try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheet.slice(0, 31));
      XLSX.writeFile(wb, `${stem}-${stamp}.xlsx`);
      this.closeExportModal();
      this.toast.show('Classeur Excel téléchargé.', 'success', 3200);
    } catch {
      this.toast.show('Impossible de générer le fichier Excel.', 'warn', 4000);
    }
  }

  private buildKpiRows(): string[][] {
    return [
      ['Indicateur', 'Valeur'],
      ['Epargne totale systeme (TND)', String(this.stats.totalSystemSavings)],
      ['Comptes actifs', String(this.stats.activeAccounts)],
      ['Comptes fermes', String(this.stats.closedAccounts)],
      ['Comptes suspendus (derive)', String(this.suspendedAccounts)],
      ['Total objectifs', String(this.stats.totalGoals)],
      ['Completion moyenne objectifs (%)', String(this.stats.averageGoalCompletionRate)],
      ['Periode volume', this.volumePeriodLabel()],
      ['Depots (periode)', String(this.depositsTotal)],
      ['Retraits (periode)', String(this.withdrawalsTotal)],
      ['Transactions flaggees', String(this.flaggedCount)],
      ['Score anomalie moyen', String(this.avgAnomalyScore)],
      ['Nombre transactions chargees', String(this.allTransactions.length)],
    ];
  }

  private buildTxRows(): string[][] {
    return [
      ['Id', 'Type', 'Montant', 'Date', 'Statut', 'CompteId', 'NumeroCompte', 'Description', 'Flag', 'AnomalyScore'],
      ...this.allTransactions.map((t) => [
        String(t.id),
        t.type ?? '',
        String(t.amount ?? ''),
        t.transactionDate ?? '',
        t.status ?? '',
        String(t.savingsAccount?.id ?? ''),
        t.savingsAccount?.accountNumber ?? '',
        t.description ?? '',
        t.flagged ? 'oui' : 'non',
        String(t.anomalyScore ?? ''),
      ]),
    ];
  }

  openDashboardPrintReport(): void {
    const stamp = new Date().toLocaleString('fr-FR');
    const rowsTx = this.allTransactions
      .slice(-80)
      .map(
        (t) =>
          `<tr><td>${this.escapeHtml(String(t.id))}</td><td>${this.escapeHtml(t.type ?? '')}</td><td>${this.escapeHtml(String(t.amount ?? ''))}</td><td>${this.escapeHtml(t.transactionDate ?? '')}</td><td>${this.escapeHtml(t.status ?? '')}</td></tr>`
      )
      .join('');
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/><title>Financia Admin — Dashboard épargne</title>
<style>
body{font-family:system-ui,sans-serif;padding:28px;color:#0f172a;max-width:960px;margin:0 auto}
h1{font-size:1.35rem;margin:0 0 8px}
p.meta{color:#64748b;font-size:0.9rem;margin:0 0 20px}
section{margin-bottom:28px}
table{border-collapse:collapse;width:100%;font-size:0.82rem}
th,td{border:1px solid #e2e8f0;padding:8px;text-align:left}
th{background:#f8fafc}
.kpi{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:16px}
.kpi div{border:1px solid #e2e8f0;border-radius:10px;padding:12px}
.kpi span{display:block;font-size:0.72rem;color:#64748b;text-transform:uppercase}
.kpi strong{font-size:1.1rem}
.actions{margin-bottom:16px}
button{padding:10px 18px;border-radius:10px;border:none;background:#4338ca;color:#fff;font-weight:700;cursor:pointer}
@media print{button{display:none}}
</style></head><body>
<p class="meta">Généré le ${this.escapeHtml(stamp)} — tableau de bord épargne</p>
<h1>Rapport dashboard administrateur</h1>
<div class="actions"><button type="button" onclick="window.print()">Imprimer ou enregistrer en PDF</button></div>
<section>
<div class="kpi">
<div><span>Épargne totale</span><strong>${this.escapeHtml(String(this.stats.totalSystemSavings))} TND</strong></div>
<div><span>Comptes actifs</span><strong>${this.escapeHtml(String(this.stats.activeAccounts))}</strong></div>
<div><span>Suspendus</span><strong>${this.escapeHtml(String(this.suspendedAccounts))}</strong></div>
<div><span>Objectifs</span><strong>${this.escapeHtml(String(this.stats.totalGoals))}</strong></div>
<div><span>Tx flaggées</span><strong>${this.escapeHtml(String(this.flaggedCount))}</strong></div>
<div><span>Période volume</span><strong>${this.escapeHtml(this.volumePeriodLabel())}</strong></div>
</div>
<p>Dépôts période: <strong>${this.escapeHtml(String(this.depositsTotal))}</strong> TND — Retraits: <strong>${this.escapeHtml(String(this.withdrawalsTotal))}</strong> TND</p>
</section>
<section><h2 style="font-size:1.05rem">Transactions récentes (max 80)</h2>
<table><thead><tr><th>Id</th><th>Type</th><th>Montant</th><th>Date</th><th>Statut</th></tr></thead><tbody>${rowsTx || '<tr><td colspan="5">Aucune transaction</td></tr>'}</tbody></table>
</section>
</body></html>`;
    const w = window.open('', '_blank');
    if (!w) {
      this.toast.show('Autorisez les pop-ups pour imprimer.', 'warn');
      return;
    }
    w.document.write(html);
    w.document.close();
    this.toast.show('Rapport ouvert : Imprimer → PDF.', 'info', 4500);
  }

  private escapeCsvCell(v: unknown): string {
    const s = String(v ?? '');
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  private escapeHtml(s: string): string {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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