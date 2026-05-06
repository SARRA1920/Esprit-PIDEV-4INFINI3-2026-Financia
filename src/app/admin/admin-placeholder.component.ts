import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-placeholder',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="adm-ph">
      <h1 class="adm-ph__title">{{ title }}</h1>
      <p class="adm-ph__text">
        Cette section reprend la navigation de la maquette « Financia fintech web app UI ». Branchez ici les appels API
        correspondants lorsque les endpoints seront disponibles.
      </p>
      <a routerLink="/admin" class="adm-ph__back">← Retour au tableau de bord</a>
    </div>
  `,
  styles: `
    .adm-ph {
      max-width: 40rem;
    }
    .adm-ph__title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #f8fafc;
      margin: 0 0 0.75rem;
    }
    .adm-ph__text {
      font-size: 0.9375rem;
      color: #94a3b8;
      line-height: 1.6;
      margin: 0 0 1.5rem;
    }
    .adm-ph__back {
      color: #10b981;
      font-size: 0.875rem;
      text-decoration: none;
    }
    .adm-ph__back:hover {
      text-decoration: underline;
    }
  `,
})
export class AdminPlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  get title(): string {
    return (this.route.snapshot.data['title'] as string) ?? 'Admin';
  }
}
