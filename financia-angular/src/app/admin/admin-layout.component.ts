import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';
import { AdminGlobalSearchService, type AdminSearchResults } from '../core/admin-global-search.service';
import { getAdminRouteContext } from './admin-route-meta';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly adminSearch = inject(AdminGlobalSearchService);

  readonly collapsed = signal(false);

  private readonly navSub: Subscription;
  private readonly searchSub: Subscription;
  private readonly searchInput$ = new Subject<string>();

  readonly routeContext = signal(getAdminRouteContext(this.router.url));
  readonly searchQuery = signal('');
  readonly searchPanelOpen = signal(false);
  readonly searchLoading = signal(false);
  readonly searchResults = signal<AdminSearchResults | null>(null);

  readonly searchHasHits = computed(() => {
    const r = this.searchResults();
    if (!r) {
      return false;
    }
    return r.accounts.length + r.users.length + r.credits.length > 0;
  });

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

  constructor() {
    const ctx0 = getAdminRouteContext(this.router.url);
    this.title.setTitle(`${ctx0.title} · Financia Admin`);

    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;
        const ctx = getAdminRouteContext(url);
        this.routeContext.set(ctx);
        this.title.setTitle(`${ctx.title} · Financia Admin`);
        this.searchPanelOpen.set(false);
      });

    this.searchSub = this.searchInput$
      .pipe(
        debounceTime(380),
        distinctUntilChanged(),
        switchMap((q) => {
          const t = q.trim();
          if (t.length < 2) {
            this.searchLoading.set(false);
            this.searchResults.set(null);
            return of(null);
          }
          this.searchLoading.set(true);
          return this.adminSearch.search(t).pipe(
            finalize(() => {
              this.searchLoading.set(false);
            })
          );
        })
      )
      .subscribe((res) => {
        if (res) {
          this.searchResults.set(res);
          this.searchPanelOpen.set(true);
        }
      });
  }

  ngOnDestroy(): void {
    this.navSub.unsubscribe();
    this.searchSub.unsubscribe();
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.searchInput$.next(value);
    if (value.trim().length < 2) {
      this.searchResults.set(null);
      this.searchPanelOpen.set(false);
    }
  }

  onSearchFocus(): void {
    if (this.searchHasHits()) {
      this.searchPanelOpen.set(true);
    }
  }

  closeSearchPanel(): void {
    this.searchPanelOpen.set(false);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set(null);
    this.searchPanelOpen.set(false);
    this.searchInput$.next('');
  }
}
