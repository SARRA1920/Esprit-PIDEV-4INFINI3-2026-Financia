import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EcheancierPayementService } from '../core/echeancier-payement.service';
import { EcheancierPayementDTO } from '../models/echeancier-payement.model';

@Component({
  selector: 'app-admin-create-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Créer un Paiement</h3>
          <button class="close-btn" (click)="close()" [disabled]="saving()">&times;</button>
        </div>

        <div class="modal-body">
          @if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
          }

          <form (ngSubmit)="submit()">
            <div class="form-group">
              <label>Date d'échéance *</label>
              <input
                type="date"
                [(ngModel)]="form.dueDate"
                name="dueDate"
                required
                class="form-control"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Montant principal *</label>
                <input
                  type="number"
                  [(ngModel)]="form.principalAmount"
                  name="principalAmount"
                  required
                  min="0"
                  step="0.01"
                  class="form-control"
                  (input)="calculateTotal()"
                />
              </div>

              <div class="form-group">
                <label>Montant des intérêts *</label>
                <input
                  type="number"
                  [(ngModel)]="form.interestAmount"
                  name="interestAmount"
                  required
                  min="0"
                  step="0.01"
                  class="form-control"
                  (input)="calculateTotal()"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Pénalités</label>
                <input
                  type="number"
                  [(ngModel)]="form.penaltyAmount"
                  name="penaltyAmount"
                  min="0"
                  step="0.01"
                  class="form-control"
                  (input)="calculateTotal()"
                />
              </div>

              <div class="form-group">
                <label>Montant total *</label>
                <input
                  type="number"
                  [(ngModel)]="form.amountDue"
                  name="amountDue"
                  required
                  min="0"
                  step="0.01"
                  class="form-control"
                  readonly
                />
              </div>
            </div>

            <div class="form-group">
              <label>Statut *</label>
              <select [(ngModel)]="form.status" name="status" class="form-control">
                <option value="PENDING">En attente</option>
                <option value="PAID">Payé</option>
                <option value="LATE">En retard</option>
                <option value="OVERDUE">Très en retard</option>
              </select>
            </div>

            <div class="info-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <div>
                <strong>Note:</strong> Le montant total est calculé automatiquement (Principal + Intérêts + Pénalités).
                Si la date d'échéance est passée, le statut sera automatiquement mis à jour en OVERDUE.
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
                  <span>Créer le Paiement</span>
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
      max-width: 600px;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;

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

        &:disabled, &:read-only {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }
      }
    }

    .info-box {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem;
      background-color: #dbeafe;
      border: 1px solid #93c5fd;
      border-radius: 0.375rem;
      margin-bottom: 1rem;

      svg {
        flex-shrink: 0;
        color: #3b82f6;
        margin-top: 0.125rem;
      }

      div {
        font-size: 0.875rem;
        color: #1e40af;

        strong {
          font-weight: 600;
        }
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
export class AdminCreatePaymentModalComponent {
  private readonly paymentService = inject(EcheancierPayementService);

  @Input() contratId!: number;
  @Output() paymentCreated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  saving = signal(false);
  error = signal<string | null>(null);

  form = {
    dueDate: '',
    amountDue: 0,
    principalAmount: 0,
    interestAmount: 0,
    penaltyAmount: 0,
    status: 'PENDING' as 'PENDING' | 'PAID' | 'LATE' | 'OVERDUE',
  };

  calculateTotal(): void {
    this.form.amountDue = 
      (this.form.principalAmount || 0) + 
      (this.form.interestAmount || 0) + 
      (this.form.penaltyAmount || 0);
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
    if (!this.form.dueDate || this.form.principalAmount < 0 || this.form.interestAmount < 0) {
      this.error.set('Veuillez remplir tous les champs obligatoires correctement.');
      return;
    }

    const dto: EcheancierPayementDTO = {
      dueDate: this.form.dueDate,
      amountDue: this.form.amountDue,
      principalAmount: this.form.principalAmount,
      interestAmount: this.form.interestAmount,
      penaltyAmount: this.form.penaltyAmount,
      status: this.form.status,
    };

    this.saving.set(true);
    this.paymentService.createPayment(this.contratId, dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.paymentCreated.emit();
      },
      error: (err) => {
        this.error.set(err.message);
        this.saving.set(false);
      },
    });
  }
}
