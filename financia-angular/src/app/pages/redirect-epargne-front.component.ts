import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Route publique `/services/epargneobjectif` : renvoie vers l’espace client (épargne / objectifs).
 * Utile depuis le back-office pour prévisualiser la partie « front ».
 */
@Component({
  standalone: true,
  template: `<p class="redirect-msg">Redirection vers votre épargne…</p>`,
  styles: [
    `
      .redirect-msg {
        padding: 2rem;
        text-align: center;
        color: #64748b;
        font-size: 0.95rem;
      }
    `,
  ],
})
export class RedirectEpargneFrontComponent implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    void this.router.navigate(['/espace-client'], { fragment: 'epargne-goals', replaceUrl: true });
  }
}
