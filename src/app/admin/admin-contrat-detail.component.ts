import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContratService } from '../core/contrat.service';
import { EcheancierPayementService } from '../core/echeancier-payement.service';
import { Contrat, MultiCurrencyViewResponse } from '../models/contrat.model';
import { EcheancierPayement } from '../models/echeancier-payement.model';
import { AdminCreatePaymentModalComponent } from './admin-create-payment-modal.component';

@Component({
  selector: 'app-admin-contrat-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminCreatePaymentModalComponent],
  templateUrl: './admin-contrat-detail.component.html',
  styleUrls: ['./admin-contrat-detail.component.scss'],
})
export class AdminContratDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contratService = inject(ContratService);
  private readonly echeancierService = inject(EcheancierPayementService);

  contrat = signal<Contrat | null>(null);
  payments = signal<EcheancierPayement[]>([]);
  multiCurrency = signal<MultiCurrencyViewResponse | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  createPaymentOpen = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadContrat(id);
      this.loadPayments(id);
      this.loadMultiCurrency(id);
    }
  }

  loadContrat(id: number): void {
    this.loading.set(true);
    this.contratService.getContratById(id).subscribe({
      next: (data) => {
        this.contrat.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  loadPayments(contratId: number): void {
    this.echeancierService.getPaymentsByContrat(contratId).subscribe({
      next: (data) => {
        this.payments.set(data);
      },
      error: (err) => {
        console.error('Erreur chargement échéancier:', err);
      },
    });
  }

  loadMultiCurrency(id: number): void {
    this.contratService.getMultiCurrencyView(id).subscribe({
      next: (data) => {
        this.multiCurrency.set(data);
      },
      error: (err) => {
        console.error('Erreur chargement multi-devise:', err);
      },
    });
  }

  downloadPdf(): void {
    const id = this.contrat()?.id;
    if (!id) return;
    
    this.contratService.downloadContratPdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contract-${id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        alert('Erreur: ' + err.message);
      },
    });
  }

  downloadSchedulePdf(): void {
    const id = this.contrat()?.id;
    if (!id) return;
    
    this.echeancierService.downloadSchedulePdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `payment-schedule-${id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        alert('Erreur: ' + err.message);
      },
    });
  }

  sendEmail(): void {
    const id = this.contrat()?.id;
    if (!id) return;
    
    this.contratService.sendContratEmail(id).subscribe({
      next: (response) => {
        alert(response);
      },
      error: (err) => {
        alert('Erreur: ' + err.message);
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'badge-warning';
      case 'PAID':
        return 'badge-success';
      case 'LATE':
        return 'badge-orange';
      case 'OVERDUE':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  }

  getTotalPrincipal(): number {
    return this.payments().reduce((sum, p) => sum + p.principalAmount, 0);
  }

  getTotalInterest(): number {
    return this.payments().reduce((sum, p) => sum + p.interestAmount, 0);
  }

  getTotalPenalties(): number {
    return this.payments().reduce((sum, p) => sum + p.penaltyAmount, 0);
  }

  getTotalAmount(): number {
    return this.payments().reduce((sum, p) => sum + p.amountDue, 0);
  }

  openCreatePayment(): void {
    this.createPaymentOpen.set(true);
  }

  closeCreatePayment(): void {
    this.createPaymentOpen.set(false);
  }

  onPaymentCreated(): void {
    this.createPaymentOpen.set(false);
    const id = this.contrat()?.id;
    if (id) {
      this.loadPayments(id);
    }
    alert('Paiement créé avec succès!');
  }
}
