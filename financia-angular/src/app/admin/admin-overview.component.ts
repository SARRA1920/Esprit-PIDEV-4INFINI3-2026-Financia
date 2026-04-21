import { Component } from '@angular/core';
import { AdminStatusBadgeComponent, AdminBadgeStatus } from './admin-status-badge.component';

interface ActivityRow {
  time: string;
  actor: string;
  action: string;
  entity: string;
  status: AdminBadgeStatus;
}

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [AdminStatusBadgeComponent],
  templateUrl: './admin-overview.component.html',
  styleUrl: './admin-overview.component.scss',
})
export class AdminOverviewComponent {
  /** Données démo (alignées sur la maquette React). */
  readonly portfolioData = [
    { month: 'Jan', amount: 2_400_000 },
    { month: 'Fév', amount: 2_550_000 },
    { month: 'Mar', amount: 2_780_000 },
    { month: 'Avr', amount: 2_920_000 },
    { month: 'Mai', amount: 3_100_000 },
    { month: 'Juin', amount: 3_280_000 },
  ];

  readonly statusData = [
    { name: 'ACTIVE', value: 145, color: '#10b981' },
    { name: 'PENDING', value: 28, color: '#f59e0b' },
    { name: 'APPROVED', value: 12, color: '#3b82f6' },
    { name: 'CLOSED', value: 89, color: '#64748b' },
  ];

  readonly recentActivity: ActivityRow[] = [
    { time: '14:32', actor: 'Admin User', action: 'Approved crédit', entity: 'CR-2026-0482', status: 'APPROVED' },
    { time: '14:18', actor: 'Agent Dubois', action: 'Updated remboursement', entity: 'RB-2026-1243', status: 'PAID' },
    { time: '13:55', actor: 'System', action: 'Marked overdue', entity: 'RB-2026-0891', status: 'OVERDUE' },
    { time: '13:42', actor: 'Admin User', action: 'Created course', entity: 'Formation #18', status: 'ACTIVE' },
    { time: '13:15', actor: 'Agent Martin', action: 'Added client', entity: 'CL-2026-0234', status: 'PENDING' },
    { time: '12:58', actor: 'System', action: 'Payment received', entity: 'RB-2026-1102', status: 'PAID' },
  ];

  readonly chartPoints: { month: string; x: number; y: number }[];
  readonly areaPoints: string;
  readonly linePoints: string;
  readonly gridYs: number[];
  readonly yTicks: { label: string; y: number }[];
  readonly donutSegments: { name: string; color: string; path: string }[];

  constructor() {
    const amounts = this.portfolioData.map((d) => d.amount);
    const minA = Math.min(...amounts);
    const maxA = Math.max(...amounts);
    const pad = (maxA - minA) * 0.08 || 1;
    const lo = minA - pad;
    const hi = maxA + pad;
    const x0 = 48;
    const x1 = 372;
    const yBase = 168;
    const yTop = 24;
    const n = this.portfolioData.length;

    this.chartPoints = this.portfolioData.map((d, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const x = x0 + t * (x1 - x0);
      const yn = (d.amount - lo) / (hi - lo);
      const y = yBase - yn * (yBase - yTop);
      return { month: d.month, x, y };
    });

    this.linePoints = this.chartPoints.map((p) => `${p.x},${p.y}`).join(' ');
    this.areaPoints = `${this.linePoints} ${this.chartPoints[this.chartPoints.length - 1].x},${yBase} ${this.chartPoints[0].x},${yBase}`;

    this.gridYs = [40, 80, 120, 160].filter((gy) => gy < yBase);

    const fmtM = (v: number) => `${(v / 1_000_000).toFixed(1)}M`;
    this.yTicks = [
      { label: fmtM(hi), y: 28 },
      { label: fmtM(lo + (hi - lo) * 0.33), y: 72 },
      { label: fmtM(lo + (hi - lo) * 0.66), y: 116 },
      { label: fmtM(lo), y: 160 },
    ];

    this.donutSegments = this.buildDonut(this.statusData);
  }

  private buildDonut(
    items: { name: string; value: number; color: string }[]
  ): { name: string; color: string; path: string }[] {
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
