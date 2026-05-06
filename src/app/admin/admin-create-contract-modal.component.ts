import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContratService } from '../core/contrat.service';
import { ContratDTO } from '../models/contrat.model';

@Component({
  selector: 'app-admin-create-contract-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Créer un Contrat</h3>
          <button class="close-btn" (click)="close()" [disabled]="saving()">&times;</button>
        </div>

        <div class="modal-body">
          @if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
          }

          <form (ngSubmit)="submit()">
            <div class="form-row">
              <div class="form-group">
                <label>Date de signature *</label>
                <input
                  type="date"
                  [(ngModel)]="form.signedDate"
                  name="signedDate"
                  required
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Montant *</label>
                <input
                  type="number"
                  [(ngModel)]="form.amount"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Taux d'intérêt (%) *</label>
                <input
                  type="number"
                  [(ngModel)]="form.rate"
                  name="rate"
                  required
                  min="0"
                  step="0.01"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Durée (mois) *</label>
                <input
                  type="number"
                  [(ngModel)]="form.duration"
                  name="duration"
                  required
                  min="1"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Devise *</label>
                <select [(ngModel)]="form.currency" name="currency" class="form-control">
                  <option value="TND">TND - Dinar Tunisien</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - Dollar US</option>
                  <option value="GBP">GBP - Livre Sterling</option>
                </select>
              </div>

              <div class="form-group">
                <label>Type de contrat *</label>
                <select [(ngModel)]="form.type" name="type" class="form-control">
                  <option value="INITIAL">Initial</option>
                  <option value="RENEWAL">Renouvellement</option>
                  <option value="GROUP_SOLIDARITY">Solidarité de Groupe</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Statut *</label>
                <select [(ngModel)]="form.status" name="status" class="form-control">
                  <option value="ACTIVE">Actif</option>
                  <option value="PENDING">En attente</option>
                  <option value="CLOSED">Fermé</option>
                </select>
              </div>

              <div class="form-group">
                <label>Version *</label>
                <input
                  type="text"
                  [(ngModel)]="form.version"
                  name="version"
                  required
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-section">
              <h4>Configuration des Pénalités</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Type de pénalité</label>
                  <select [(ngModel)]="form.penaltyType" name="penaltyType" class="form-control">
                    <option value="">Aucune</option>
                    <option value="PERCENTAGE">Pourcentage</option>
                    <option value="FIXED">Fixe</option>
                    <option value="TIERED">Échelonné</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Taux de pénalité (%)</label>
                  <input
                    type="number"
                    [(ngModel)]="form.penaltyRate"
                    name="penaltyRate"
                    min="0"
                    step="0.01"
                    class="form-control"
                    [disabled]="!form.penaltyType"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Période de grâce (jours)</label>
                <input
                  type="number"
                  [(ngModel)]="form.gracePeriodDays"
                  name="gracePeriodDays"
                  min="0"
                  class="form-control"
                />
                <small class="form-hint">Nombre de jours avant que les pénalités ne commencent</small>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="close()" [disabled]="saving()">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                @if (saving()) {
                  <span>Création...</span>
                } @else {
                  <span>Créer le Contrat</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 0.5rem;
      max-width: 700px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;

      h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          color: #111827;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .modal-body {
      padding: 1.5rem;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      margin-bottom: 1rem;
    }

    .alert-error {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .form-section {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;

      h4 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: #374151;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;

      label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
        margin-bottom: 0.375rem;
      }

      .form-control {
        padding: 0.5rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;

        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        &:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }
      }

      .form-hint {
        font-size: 0.75rem;
        color: #6b7280;
        margin-top: 0.25rem;
      }
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      margin-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;

      &:hover:not(:disabled) {
        background-color: #2563eb;
      }
    }

    .btn-secondary {
      background-color: #e5e7eb;
      color: #374151;

      &:hover:not(:disabled) {
        background-color: #d1d5db;
      }
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminCreateContractModalComponent {
  private readonly contratService = inject(ContratService);

  @Input() creditId!: number;
  @Input() creditAmount!: number;
  @Input() creditRate!: number;
  @Input() creditDuration!: number;
  @Output() contractCreated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  saving = signal(false);
  error = signal<string | null>(null);

  form = {
    signedDate: new Date().toISOString().slice(0, 10),
    amount: 0,
    rate: 0,
    duration: 0,
    status: 'ACTIVE',
    version: '1.0',
    type: 'INITIAL' as 'INITIAL' | 'RENEWAL' | 'GROUP_SOLIDARITY',
    currency: 'TND',
    penaltyRate: 5.0,
    penaltyType: 'PERCENTAGE' as '' | 'PERCENTAGE' | 'FIXED' | 'TIERED',
    gracePeriodDays: 3,
  };

  ngOnInit(): void {
    // Pre-fill form with credit data
    this.form.amount = this.creditAmount;
    this.form.rate = this.creditRate;
    this.form.duration = this.creditDuration;
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.saving()) {
      this.close();
    }
  }

  close(): void {
    if (!this.saving()) {
      this.closed.emit();
    }
  }

  submit(): void {
    this.error.set(null);

    // Validation
    if (!this.form.signedDate || this.form.amount <= 0 || this.form.rate < 0 || this.form.duration <= 0) {
      this.error.set('Veuillez remplir tous les champs obligatoires correctement.');
      return;
    }

    const dto: ContratDTO = {
      signedDate: this.form.signedDate,
      amount: this.form.amount,
      rate: this.form.rate,
      duration: this.form.duration,
      status: this.form.status,
      version: this.form.version,
      type: this.form.type,
      currency: this.form.currency,
      penaltyRate: this.form.penaltyType ? this.form.penaltyRate : undefined,
      penaltyType: this.form.penaltyType || undefined,
      gracePeriodDays: this.form.gracePeriodDays,
    };

    this.saving.set(true);
    this.contratService.createContrat(this.creditId, dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.contractCreated.emit();
      },
      error: (err) => {
        this.error.set(err.message);
        this.saving.set(false);
      },
    });
  }
}
