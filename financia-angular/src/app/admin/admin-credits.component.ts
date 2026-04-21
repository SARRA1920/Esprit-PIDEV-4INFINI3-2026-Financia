import { Component, signal, computed } from '@angular/core';
import { AdminStatusBadgeComponent, AdminBadgeStatus } from './admin-status-badge.component';

interface CreditRow {
  id: string;
  client: string;
  amount: number;
  rate: number;
  duration: number;
  status: AdminBadgeStatus;
  riskScore: string;
  remaining: number;
  created: string;
  approved: string | null;
}

@Component({
  selector: 'app-admin-credits',
  standalone: true,
  imports: [AdminStatusBadgeComponent],
  templateUrl: './admin-credits.component.html',
  styleUrl: './admin-credits.component.scss',
})
export class AdminCreditsComponent {
  readonly filters = ['Tous', 'PENDING', 'APPROVED', 'ACTIVE', 'CLOSED'] as const;

  readonly credits: CreditRow[] = [
    {
      id: 'CR-2026-0482',
      client: 'Sophie Martin',
      amount: 25000,
      rate: 3.5,
      duration: 60,
      status: 'ACTIVE',
      riskScore: 'A',
      remaining: 21500,
      created: '2024-01-15',
      approved: '2024-01-18',
    },
    {
      id: 'CR-2026-0481',
      client: 'Marc Dubois',
      amount: 50000,
      rate: 4.2,
      duration: 84,
      status: 'ACTIVE',
      riskScore: 'B+',
      remaining: 48200,
      created: '2024-01-12',
      approved: '2024-01-16',
    },
    {
      id: 'CR-2026-0480',
      client: 'Claire Bernard',
      amount: 15000,
      rate: 3.8,
      duration: 48,
      status: 'PENDING',
      riskScore: 'A-',
      remaining: 15000,
      created: '2024-01-20',
      approved: null,
    },
    {
      id: 'CR-2026-0479',
      client: 'Jean Dupont',
      amount: 35000,
      rate: 4.5,
      duration: 72,
      status: 'APPROVED',
      riskScore: 'B',
      remaining: 35000,
      created: '2024-01-18',
      approved: '2024-01-20',
    },
    {
      id: 'CR-2026-0478',
      client: 'Marie Laurent',
      amount: 8000,
      rate: 3.2,
      duration: 36,
      status: 'ACTIVE',
      riskScore: 'A+',
      remaining: 5200,
      created: '2023-12-05',
      approved: '2023-12-08',
    },
    {
      id: 'CR-2026-0477',
      client: 'Pierre Moreau',
      amount: 42000,
      rate: 4.8,
      duration: 96,
      status: 'ACTIVE',
      riskScore: 'B-',
      remaining: 40100,
      created: '2024-01-08',
      approved: '2024-01-12',
    },
    {
      id: 'CR-2026-0476',
      client: 'Anne Petit',
      amount: 12000,
      rate: 3.6,
      duration: 48,
      status: 'CLOSED',
      riskScore: 'A',
      remaining: 0,
      created: '2023-06-10',
      approved: '2023-06-12',
    },
  ];

  readonly activeFilter = signal<string>('Tous');
  readonly selectedRow = signal<string | null>(null);

  readonly filteredCredits = computed(() => {
    const f = this.activeFilter();
    if (f === 'Tous') return this.credits;
    return this.credits.filter((c) => c.status === f);
  });

  setFilter(f: string): void {
    this.activeFilter.set(f);
  }

  toggleRow(id: string): void {
    this.selectedRow.update((cur) => (cur === id ? null : id));
  }
}
