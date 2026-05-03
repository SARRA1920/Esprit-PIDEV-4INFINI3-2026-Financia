import { Component, computed, HostListener, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from './core/auth.service';
import { ClientBriefingService } from './core/client-briefing.service';
import { ToastStackComponent } from './shared/toast-stack/toast-stack.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastStackComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  /** Référence directe au signal pour un suivi fiable du template (connexion / déconnexion). */
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly briefing = inject(ClientBriefingService);
  readonly user = this.auth.user;

  inboxOpen = false;

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

  logout(): void {
    this.inboxOpen = false;
    this.auth.logout();
  }

  toggleInbox(): void {
    this.inboxOpen = !this.inboxOpen;
  }

  closeInbox(): void {
    this.inboxOpen = false;
  }

  dismissBrief(id: string): void {
    this.briefing.dismiss(id);
  }

  /** Ouvre l’espace client sur la section liée à la notification. */
  openBriefTarget(): void {
    this.closeInbox();
    void this.router.navigate(['/espace-client'], { fragment: 'epargne' });
  }

  goRemboursementsFromBrief(): void {
    this.closeInbox();
    void this.router.navigate(['/espace-client'], { fragment: 'remboursements' });
  }

  goEpargneFromBrief(): void {
    this.closeInbox();
    void this.router.navigate(['/espace-client'], { fragment: 'epargne-actions' });
  }

  goGoalsFromBrief(): void {
    this.closeInbox();
    void this.router.navigate(['/espace-client'], { fragment: 'epargne-goals' });
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
