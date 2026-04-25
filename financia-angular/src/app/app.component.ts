import { Component, computed, HostListener, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  /** Référence directe au signal pour un suivi fiable du template (connexion / déconnexion). */
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly user = this.auth.user;

  /** Masque le header public sur la zone `/admin` (shell dédié). */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );
  readonly showPublicChrome = computed(() => !this.url().startsWith('/admin'));

  /** Aligné sur {@link AuthService.isAdmin} (rôle ADMIN après normalisation). */
  readonly isAdminUser = computed(() => this.auth.isAdmin());

  logout(): void {
    this.auth.logout();
  }

  mobileMenuOpen = false;
  headerScrolled = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  goToRemboursements(): void {
    // Si on est déjà sur /espace-client, on scroll sans navigation (SPA fluide).
    if (this.router.url.startsWith('/espace-client')) {
      document.getElementById('remboursements')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.closeMobileMenu();
      return;
    }

    // Sinon, on navigue vers /espace-client#remboursements puis on laisse le fragment faire le scroll.
    this.closeMobileMenu();
    this.router.navigate(['/espace-client'], { fragment: 'remboursements' });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.headerScrolled = window.scrollY > 50;
  }
}
