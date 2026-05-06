import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CreditStatsService } from '../core/credit-stats.service';
import { PortfolioHealthStats } from '../models/credit-stats.model';

interface StatSlice {
  name: string;
  label: string;
  value: number;
  color: string;
  path?: string;
}

interface RiskBucket {
  key: string;
  label: string;
  value: number;
  percent: number;
  color: string;
}

@Component({
  selector: 'app-admin-client-statistics',
  standalone: true,
  templateUrl: './admin-client-statistics.component.html',
  styleUrl: './admin-overview.component.scss',
})
export class AdminClientStatisticsComponent implements OnInit {
  private readonly creditStatsApi = inject(CreditStatsService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly stats = signal<PortfolioHealthStats | null>(null);

  readonly statusItems = computed<StatSlice[]>(() => {
    const status = this.stats()?.creditsByStatus ?? {};
    return ['PENDING', 'OFFER_PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'CLOSED'].map((name) => ({
      name,
      label: this.statusLabel(name),
      value: Number(status[name] ?? 0),
      color: this.statusColor(name),
    }));
  });

  readonly statusDonut = computed(() => {
    const items = this.statusItems().filter((item) => item.value > 0);
    return {
      segments: this.buildDonut(items),
      items,
    };
  });

  readonly riskBuckets = computed<RiskBucket[]>(() => {
    const buckets = this.stats()?.riskDistributionBuckets ?? {};
    const rows = [
      { key: 'bucket_0_50', label: 'Risque faible (0-50)', color: '#10b981' },
      { key: 'bucket_50_75', label: 'Risque moyen (50-75)', color: '#f59e0b' },
      { key: 'bucket_75_100', label: 'Risque élevé (75-100)', color: '#ef4444' },
    ].map((bucket) => ({
      ...bucket,
      value: Number(buckets[bucket.key] ?? 0),
      percent: 0,
    }));
    const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
    return rows.map((row) => ({
      ...row,
      percent: Math.round((row.value / total) * 100),
    }));
  });

  ngOnInit(): void {
    this.creditStatsApi.getPortfolioHealth().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (e: Error) => {
        this.error.set(e.message);
        this.loading.set(false);
      },
    });
  }

  formatCurrency(value: number | null | undefined): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
  }

  formatPercent(value: number | null | undefined): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(Number(value ?? 0));
  }

  formatScore(value: number | null | undefined): string {
    return `${Number(value ?? 0).toFixed(2)}/100`;
  }

  private statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      OFFER_PENDING: 'Offre en attente',
      APPROVED: 'Approuvé',
      REJECTED: 'Rejeté',
      ACTIVE: 'Actif',
      CLOSED: 'Clôturé',
    };
    return labels[status] ?? status;
  }

  private statusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: '#f59e0b',
      OFFER_PENDING: '#a855f7',
      APPROVED: '#3b82f6',
      REJECTED: '#ef4444',
      ACTIVE: '#10b981',
      CLOSED: '#64748b',
    };
    return colors[status] ?? '#94a3b8';
  }

  private buildDonut(items: StatSlice[]): Required<Pick<StatSlice, 'name' | 'color' | 'path'>>[] {
    const cx = 100;
    const cy = 100;
    const rOut = 90;
    const total = items.reduce((s, i) => s + i.value, 0) || 1;
    let angle = -Math.PI / 2;
    const paths: { name: string; color: string; path: string }[] = [];

    for (const it of items) {
      const sweep = (it.value / total) * Math.PI * 2;
      const x1 = cx + rOut * Math.cos(angle);
      const y1 = cy + rOut * Math.sin(angle);
      const x2 = cx + rOut * Math.cos(angle + sweep);
      const y2 = cy + rOut * Math.sin(angle + sweep);
      const large = sweep > Math.PI ? 1 : 0;
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${rOut} ${rOut} 0 ${large} 1 ${x2} ${y2} Z`;
      paths.push({ name: it.name, color: it.color, path: d });
      angle += sweep;
    }
    return paths;
  }
}
