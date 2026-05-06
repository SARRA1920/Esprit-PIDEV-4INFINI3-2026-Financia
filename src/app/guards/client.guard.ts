import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

export const clientGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.user()) {
    router.navigate(['/login']);
    return false;
  }
  if (!auth.isClient()) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
