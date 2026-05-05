import { HttpInterceptorFn } from '@angular/common/http';

const PUBLIC_AUTH_PATH =
  /\/api\/auth\/(login|register|google|forgot-password|reset-password|face\/verify)(\?|$)/;

/**
 * Ajoute Authorization: Bearer sur les appels API sauf endpoints auth publics.
 * Compatible navigateur + SSR (pas de localStorage côté serveur).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof localStorage === 'undefined') {
    return next(req);
  }
  const token = localStorage.getItem('token');
  if (!token || PUBLIC_AUTH_PATH.test(req.url)) {
    return next(req);
  }
  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
