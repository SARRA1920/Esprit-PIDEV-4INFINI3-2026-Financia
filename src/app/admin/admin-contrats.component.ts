import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContratService } from '../core/contrat.service';
import { Contrat } from '../models/contrat.model';

@Component({
  selector: 'app-admin-contrats',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-contrats.component.html',
  styleUrls: ['./admin-contrats.component.scss'],
})
export class AdminContratsComponent implements OnInit {
  private readonly contratService = inject(ContratService);

  contrats = signal<Contrat[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadContrats();
  }

  loadContrats(): void {
    this.loading.set(true);
    this.error.set(null);
    this.contratService.getAllContrats().subscribe({
      next: (data) => {
        this.contrats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  deleteContrat(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
      return;
    }
    this.contratService.deleteContrat(id).subscribe({
      next: () => {
        this.loadContrats();
      },
      error: (err) => {
        alert('Erreur: ' + err.message);
      },
    });
  }

  sendEmail(id: number): void {
    this.contratService.sendContratEmail(id).subscribe({
      next: (response) => {
        alert(response);
      },
      error: (err) => {
        alert('Erreur: ' + err.message);
      },
    });
  }

  downloadPdf(id: number): void {
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

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'badge-success';
      case 'PENDING':
        return 'badge-warning';
      case 'CLOSED':
        return 'badge-secondary';
      default:
        return 'badge-info';
    }
  }

  getActiveCount(): number {
    return this.contrats().filter(c => c.status?.toUpperCase() === 'ACTIVE').length;
  }

  getTotalAmount(): number {
    return this.contrats().reduce((sum, c) => sum + (c.amount || 0), 0);
  }
}
