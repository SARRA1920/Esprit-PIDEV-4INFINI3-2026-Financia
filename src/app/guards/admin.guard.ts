import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.user()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: router.url || '/admin' },
    });
    return false;
  }
  if (!auth.isAdmin()) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
