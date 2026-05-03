import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminUsersService } from '../core/admin-users.service';
import { AdminUserListItem } from '../models/admin-user.model';
import { UserRole } from '../models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent implements OnInit {
  private readonly usersApi = inject(AdminUsersService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly users = signal<AdminUserListItem[]>([]);
  readonly query = signal('');

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.users();
    if (!q) return list;
    return list.filter((u) => {
      const hay = [
        u.idUser,
        u.firstName,
        u.lastName,
        u.email,
        u.phone,
        u.address,
        u.role ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  });

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) {
      this.query.set(q);
    }
    this.usersApi.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data ?? []);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (e: Error) => {
        this.error.set(e.message);
        this.loading.set(false);
      },
    });
  }

  roleLabel(r: UserRole | null): string {
    if (!r) return '—';
    const map: Record<UserRole, string> = {
      ADMIN: 'Admin',
      AGENT: 'Agent',
      CLIENT: 'Client',
    };
    return map[r] ?? r;
  }

  roleClass(r: UserRole | null): string {
    if (r === 'ADMIN') return 'adm-role-pill--admin';
    if (r === 'AGENT') return 'adm-role-pill--agent';
    if (r === 'CLIENT') return 'adm-role-pill--client';
    return 'adm-role-pill--none';
  }

  formatIncome(v: number | null | undefined): string {
    if (v == null || Number.isNaN(Number(v))) return '—';
    return `${Number(v).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} TND`;
  }
}
