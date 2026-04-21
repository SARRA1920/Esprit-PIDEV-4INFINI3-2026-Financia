import { Component, Input } from '@angular/core';

export type AdminBadgeStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'ACTIVE'
  | 'PAID'
  | 'OVERDUE'
  | 'CLOSED'
  | 'FAILED';

@Component({
  selector: 'app-admin-status-badge',
  standalone: true,
  template: `
    <span [class]="badgeClass()">{{ label || status }}</span>
  `,
  styles: `
    :host {
      display: inline-block;
    }
    span {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.625rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      border: 1px solid transparent;
    }
    .adm-badge--pending {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border-color: rgba(245, 158, 11, 0.2);
    }
    .adm-badge--approved {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
      border-color: rgba(59, 130, 246, 0.2);
    }
    .adm-badge--active,
    .adm-badge--paid {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border-color: rgba(16, 185, 129, 0.2);
    }
    .adm-badge--overdue,
    .adm-badge--failed {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.2);
    }
    .adm-badge--closed {
      background: rgba(100, 116, 139, 0.1);
      color: #64748b;
      border-color: rgba(100, 116, 139, 0.2);
    }
  `,
})
export class AdminStatusBadgeComponent {
  @Input({ required: true }) status!: AdminBadgeStatus;
  @Input() label = '';

  badgeClass(): string {
    const map: Record<AdminBadgeStatus, string> = {
      PENDING: 'adm-badge--pending',
      APPROVED: 'adm-badge--approved',
      ACTIVE: 'adm-badge--active',
      PAID: 'adm-badge--paid',
      OVERDUE: 'adm-badge--overdue',
      CLOSED: 'adm-badge--closed',
      FAILED: 'adm-badge--failed',
    };
    return map[this.status] ?? 'adm-badge--closed';
  }
}
