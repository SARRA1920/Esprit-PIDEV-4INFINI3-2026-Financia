import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);

  readonly collapsed = signal(false);
  readonly userMenuOpen = signal(false);

  readonly userInitial = computed(() => {
    const u = this.auth.user();
    const n = u?.firstName?.trim()?.charAt(0) ?? u?.email?.charAt(0) ?? '?';
    return n.toUpperCase();
  });

  readonly displayName = computed(() => {
    const u = this.auth.user();
    if (!u) return 'Admin';
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
  });

  readonly displayEmail = computed(() => this.auth.user()?.email ?? 'admin@financia.io');

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.userMenuOpen.update((open) => !open);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.closeUserMenu();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeUserMenu();
  }
}
