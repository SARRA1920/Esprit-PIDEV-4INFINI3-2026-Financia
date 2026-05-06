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
  readonly recentActivity: ActivityRow[] = [
    { time: '14:32', actor: 'Admin User', action: 'Approved crédit', entity: 'CR-2026-0482', status: 'APPROVED' },
    { time: '14:18', actor: 'Agent Dubois', action: 'Updated remboursement', entity: 'RB-2026-1243', status: 'PAID' },
    { time: '13:55', actor: 'System', action: 'Marked overdue', entity: 'RB-2026-0891', status: 'OVERDUE' },
    { time: '13:42', actor: 'Admin User', action: 'Created course', entity: 'Formation #18', status: 'ACTIVE' },
    { time: '13:15', actor: 'Agent Martin', action: 'Added client', entity: 'CL-2026-0234', status: 'PENDING' },
    { time: '12:58', actor: 'System', action: 'Payment received', entity: 'RB-2026-1102', status: 'PAID' },
  ];
}
