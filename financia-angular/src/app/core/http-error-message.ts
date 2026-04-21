import { HttpErrorResponse } from '@angular/common/http';

/** Évite d'afficher du HTML Tomcat/Spring (404) dans l'UI. */
export function httpErrorMessage(err: HttpErrorResponse, fallback: string): string {
  if (err.status === 0) {
    return 'Impossible de joindre le serveur. Démarrez le backend Spring Boot (port 8083) et vérifiez l’URL de l’API.';
  }
  if (err.status === 404) {
    return 'API introuvable (404). Vérifiez que l’URL inclut le préfixe /f (context-path Spring : …/f/api/…).';
  }
  const e = err.error;
  if (typeof e === 'string' && e.length) {
    if (/^\s*<!doctype|<html[\s>]/i.test(e)) {
      return `Erreur serveur (${err.status}). Réponse HTML inattendue — vérifiez l’URL (base : …/f/api/…).`;
    }
    return e.length > 400 ? `${e.slice(0, 200)}…` : e;
  }
  if (e && typeof e === 'object' && 'message' in e) {
    return String((e as { message: string }).message);
  }
  return err.message || fallback;
}
