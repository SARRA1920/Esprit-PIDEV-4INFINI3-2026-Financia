import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminUsersService } from '../core/admin-users.service';
import { AuthService } from '../core/auth.service';
import { AdminUserListItem, AdminUserWriteBody } from '../models/admin-user.model';
import { UserRole } from '../models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [DatePipe, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent implements OnInit {
  private readonly usersApi = inject(AdminUsersService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly users = signal<AdminUserListItem[]>([]);
  readonly query = signal('');

  readonly modalOpen = signal(false);
  readonly modalMode = signal<'create' | 'edit'>('create');
  readonly modalSaving = signal(false);
  readonly modalError = signal<string | null>(null);

  readonly roles: UserRole[] = ['CLIENT', 'AGENT', 'ADMIN'];

  readonly userForm = this.fb.nonNullable.group({
    idUser: this.fb.control<number | null>(null),
    firstName: ['', [Validators.required, Validators.maxLength(120)]],
    lastName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phone: ['', [Validators.required, Validators.maxLength(40)]],
    address: [''],
    role: this.fb.control<UserRole | null>('CLIENT', Validators.required),
    monthlyIncome: this.fb.control<number | null>(null),
    password: [''],
  });

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
    this.fetchUsers();
  }

  /** Recharge la liste ; `silent` évite de masquer le tableau (après CRUD). */
  fetchUsers(options?: { silent?: boolean }): void {
    const silent = options?.silent === true;
    if (!silent) {
      this.loading.set(true);
      this.error.set(null);
    }
    this.usersApi.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data ?? []);
        if (!silent) this.loading.set(false);
      },
      error: (e: Error) => {
        this.error.set(e.message);
        if (!silent) this.loading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.modalMode.set('create');
    this.modalError.set(null);
    this.userForm.reset({
      idUser: null,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      role: 'CLIENT',
      monthlyIncome: null,
      password: '',
    });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('email')?.enable();
    this.modalOpen.set(true);
  }

  openEditModal(u: AdminUserListItem): void {
    this.modalMode.set('edit');
    this.modalError.set(null);
    this.userForm.patchValue({
      idUser: u.idUser,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      address: u.address ?? '',
      role: (u.role as UserRole) ?? 'CLIENT',
      monthlyIncome: u.monthlyIncome ?? null,
      password: '',
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.modalOpen.set(true);
  }

  closeModal(): void {
    if (this.modalSaving()) return;
    this.modalOpen.set(false);
    this.modalError.set(null);
  }

  submitModal(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    const mode = this.modalMode();
    const v = this.userForm.getRawValue();
    if (mode === 'create') {
      const pwd = v.password?.trim() ?? '';
      if (!pwd) {
        this.userForm.get('password')?.setErrors({ required: true });
        return;
      }
    } else if (v.password?.trim() && v.password.trim().length < 6) {
      this.userForm.get('password')?.setErrors({ minlength: { requiredLength: 6, actualLength: v.password.trim().length } });
      return;
    }

    const body = this.buildWriteBody(v, mode === 'create');

    this.modalSaving.set(true);
    this.modalError.set(null);

    if (mode === 'create') {
      this.usersApi.createUser(body).subscribe({
        next: () => {
          this.modalSaving.set(false);
          this.modalOpen.set(false);
          this.fetchUsers({ silent: true });
        },
        error: (e: Error) => {
          this.modalError.set(e.message);
          this.modalSaving.set(false);
        },
      });
    } else {
      const id = v.idUser;
      if (id == null) {
        this.modalError.set('Identifiant utilisateur manquant.');
        this.modalSaving.set(false);
        return;
      }
      this.usersApi.updateUser(id, body).subscribe({
        next: () => {
          this.modalSaving.set(false);
          this.modalOpen.set(false);
          this.fetchUsers({ silent: true });
        },
        error: (e: Error) => {
          this.modalError.set(e.message);
          this.modalSaving.set(false);
        },
      });
    }
  }

  private buildWriteBody(
    v: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      role: UserRole | null;
      monthlyIncome: number | null;
      password: string;
    },
    isCreate: boolean
  ): AdminUserWriteBody {
    const body: AdminUserWriteBody = {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      email: v.email.trim().toLowerCase(),
      phone: v.phone.trim(),
      address: v.address?.trim() ? v.address.trim() : null,
      role: v.role,
      monthlyIncome: v.monthlyIncome != null && !Number.isNaN(Number(v.monthlyIncome)) ? Number(v.monthlyIncome) : null,
    };
    const pwd = v.password?.trim();
    if (isCreate && pwd) {
      body.password = pwd;
    } else if (!isCreate && pwd) {
      body.password = pwd;
    }
    return body;
  }

  deleteUser(u: AdminUserListItem, ev: Event): void {
    ev.stopPropagation();
    const me = this.auth.user()?.idUser;
    if (me != null && me === u.idUser) {
      alert('Vous ne pouvez pas supprimer votre propre compte depuis cette interface.');
      return;
    }
    if (!confirm(`Supprimer définitivement l’utilisateur ${u.email} (ID ${u.idUser}) ?`)) {
      return;
    }
    this.error.set(null);
    this.usersApi.deleteUser(u.idUser).subscribe({
      next: () => this.fetchUsers({ silent: true }),
      error: (e: Error) => this.error.set(e.message),
    });
  }

  isCurrentUser(idUser: number): boolean {
    const me = this.auth.user()?.idUser;
    return me != null && me === idUser;
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
    return `${Number(v).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`;
  }
}
