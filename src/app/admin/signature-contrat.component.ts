import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContratService } from '../core/contrat.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export type SignatureState = 'idle' | 'loading' | 'signed' | 'error';

@Component({
  selector: 'app-signature-contrat',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="signature-panel">
      <div class="sig-header">
        <div class="sig-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Signature Électronique
        </div>
        <span class="sig-badge" [ngClass]="badgeClass()">{{ badgeLabel() }}</span>
      </div>

      <div class="sig-info">
        <div class="sig-info-item">
          <span class="sig-info-icon">🏛️</span>
          <div>
            <div class="sig-info-label">Signature institutionnelle</div>
            <div class="sig-info-value">Financia — Direction Générale</div>
          </div>
        </div>
        <div class="sig-info-item">
          <span class="sig-info-icon">👤</span>
          <div>
            <div class="sig-info-label">Signature client</div>
            <div class="sig-info-value">Générée automatiquement (unique & reproductible)</div>
          </div>
        </div>
      </div>

      @if (state() === 'error') {
        <div class="sig-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ errorMsg() }}
        </div>
      }

      @if (state() === 'signed' && previewUrl()) {
        <div class="sig-preview">
          <div class="sig-preview-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Aperçu du contrat signé
          </div>
          <iframe
            [src]="previewUrl()!"
            class="pdf-preview"
            title="Aperçu contrat signé">
          </iframe>
        </div>
      }

      <div class="sig-actions">
        @if (state() !== 'signed') {
          <button
            class="btn-sign"
            (click)="signerContrat()"
            [disabled]="state() === 'loading'">
            @if (state() === 'loading') {
              <span class="spinner-sm"></span>
              Génération en cours...
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Signer le contrat
            }
          </button>
        } @else {
          <button class="btn-download" (click)="downloadSigned()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Télécharger le PDF signé
          </button>
          <button class="btn-resign" (click)="resetState()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Re-signer
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .signature-panel {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .sig-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sig-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      svg { width: 18px; height: 18px; color: #3b82f6; }
    }

    .sig-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      &.badge-idle    { background: #f1f5f9; color: #64748b; }
      &.badge-loading { background: #dbeafe; color: #1d4ed8; }
      &.badge-signed  { background: #dcfce7; color: #15803d; }
      &.badge-error   { background: #fee2e2; color: #dc2626; }
    }

    .sig-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      background: #f8fafc;
      border-radius: 0.75rem;
      padding: 1rem;
    }

    .sig-info-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      .sig-info-icon { font-size: 1.25rem; }
      .sig-info-label { font-size: 0.75rem; color: #64748b; }
      .sig-info-value { font-size: 0.875rem; font-weight: 500; color: #1e293b; }
    }

    .sig-error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #fee2e2;
      color: #dc2626;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      svg { width: 16px; height: 16px; flex-shrink: 0; }
    }

    .sig-preview {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .sig-preview-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      font-weight: 500;
      color: #475569;
      svg { width: 14px; height: 14px; }
    }

    .pdf-preview {
      width: 100%;
      height: 500px;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
    }

    .sig-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      svg { width: 16px; height: 16px; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .btn-sign {
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      color: white;
      box-shadow: 0 4px 12px rgba(59,130,246,0.3);
      &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59,130,246,0.4); }
    }

    .btn-download {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      box-shadow: 0 4px 12px rgba(16,185,129,0.3);
      &:hover { transform: translateY(-1px); }
    }

    .btn-resign {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      &:hover { background: #e2e8f0; }
    }

    .spinner-sm {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class SignatureContratComponent implements OnInit {
  @Input({ required: true }) contratId!: number;

  private readonly contratService = inject(ContratService);
  private readonly sanitizer = inject(DomSanitizer);

  state = signal<SignatureState>('idle');
  errorMsg = signal<string | null>(null);
  previewUrl = signal<SafeResourceUrl | null>(null);

  private signedBlob: Blob | null = null;

  ngOnInit(): void {}

  badgeClass(): string {
    return 'badge-' + this.state();
  }

  badgeLabel(): string {
    const labels: Record<SignatureState, string> = {
      idle:    'En attente',
      loading: 'Génération...',
      signed:  'Signé ✓',
      error:   'Erreur',
    };
    return labels[this.state()];
  }

  signerContrat(): void {
    this.state.set('loading');
    this.errorMsg.set(null);
    this.previewUrl.set(null);
    this.signedBlob = null;

    this.contratService.signerContrat(this.contratId).subscribe({
      next: (blob) => {
        this.signedBlob = blob;
        const url = URL.createObjectURL(blob);
        this.previewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        this.state.set('signed');
      },
      error: (err) => {
        this.errorMsg.set('Erreur lors de la signature : ' + err.message);
        this.state.set('error');
      },
    });
  }

  downloadSigned(): void {
    if (!this.signedBlob) return;
    const url = URL.createObjectURL(this.signedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contrat-signe-${this.contratId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  resetState(): void {
    this.state.set('idle');
    this.previewUrl.set(null);
    this.signedBlob = null;
    this.errorMsg.set(null);
  }
}
