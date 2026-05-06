import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

/** Invité → login avec retour ici ; admin/agent → console remboursements ; client → page dédiée. */
export const mesRemboursementsAccessGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const u = auth.user();
  if (!u) {
    router.navigate(['/login'], { queryParams: { returnUrl: '/mes-remboursements' } });
    return false;
  }
  if (u.role === 'ADMIN' || u.role === 'AGENT') {
    router.navigate(['/admin/remboursements']);
    return false;
  }
  /* Comme {@link AuthService.isClient} : rôle absent = client. */
  if (u.role && u.role !== 'CLIENT') {
    router.navigate(['/']);
    return false;
  }
  return true;
};
