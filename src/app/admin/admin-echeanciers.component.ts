import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EcheancierPayementService } from '../core/echeancier-payement.service';
import { PenaltyService } from '../core/penalty.service';
import { WhatsappService } from '../core/whatsapp.service';
import {
  EcheancierPayement,
  EcheancierStatus,
  ECHEANCIER_STATUS_LABELS,
  PenaltyHistory,
  QuarterlyLateStats,
} from '../models/echeancier-payement.model';

@Component({
  selector: 'app-admin-echeanciers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-echeanciers.component.html',
  styleUrls: ['./admin-echeanciers.component.scss'],
})
export class AdminEcheanciersComponent implements OnInit {
  private readonly echeancierService = inject(EcheancierPayementService);
  private readonly penaltyService = inject(PenaltyService);
  private readonly whatsappService = inject(WhatsappService);

  payments = signal<EcheancierPayement[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Penalty history panel
  selectedPaymentId = signal<number | null>(null);
  penaltyHistory = signal<PenaltyHistory[]>([]);
  historyLoading = signal(false);

  // Quarterly stats
  showStats = signal(false);
  statsYear = signal(new Date().getFullYear());
  quarterlyStats = signal<QuarterlyLateStats[]>([]);
  statsLoading = signal(false);
  statsError = signal<string | null>(null);

  readonly availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  readonly maxLate = computed(() =>
    Math.max(1, ...this.quarterlyStats().map(q => q.latePayments))
  );

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading.set(true);
    this.error.set(null);
    this.echeancierService.getAllPayments().subscribe({
      next: (data) => { this.payments.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); },
    });
  }

  // ── Quarterly stats ──────────────────────────────────────────────
  toggleStats(): void {
    this.showStats.update(v => !v);
    if (this.showStats() && this.quarterlyStats().length === 0) {
      this.loadStats();
    }
  }

  loadStats(): void {
    this.statsLoading.set(true);
    this.statsError.set(null);
    this.echeancierService.getQuarterlyStats(this.statsYear()).subscribe({
      next: (data) => { this.quarterlyStats.set(data); this.statsLoading.set(false); },
      error: (err) => { this.statsError.set(err.message); this.statsLoading.set(false); },
    });
  }

  onYearChange(year: number): void {
    this.statsYear.set(Number(year));
    this.loadStats();
  }

  barHeight(value: number, max: number): string {
    return Math.round((value / max) * 100) + '%';
  }

  getTotalLate(): number {
    return this.quarterlyStats().reduce((s, q) => s + q.latePayments, 0);
  }

  getTotalOverdue(): number {
    return this.quarterlyStats().reduce((s, q) => s + q.overduePayments, 0);
  }

  getYearlyPenalties(): number {
    return this.quarterlyStats().reduce((s, q) => s + q.totalPenalties, 0);
  }

  getWorstQuarter(): QuarterlyLateStats | null {
    const stats = this.quarterlyStats();
    if (!stats.length) return null;
    return stats.reduce((prev, cur) => cur.lateRate > prev.lateRate ? cur : prev);
  }

  // ── Existing methods ─────────────────────────────────────────────
  calculatePenalty(id: number): void {
    this.penaltyService.calculatePenalty(id).subscribe({
      next: (response) => {
        alert(response.message);
        this.loadPayments();
        if (this.selectedPaymentId() === id) this.loadPenaltyHistory(id);
      },
      error: (err) => { alert('Erreur: ' + err.message); },
    });
  }

  calculateAllPenalties(): void {
    if (!confirm('Calculer toutes les pénalités ?')) return;
    this.penaltyService.calculateAllPenalties().subscribe({
      next: (response) => {
        alert(`${response.message}\nPaiements en retard: ${response.paymentsMarkedOverdue}\nPénalités mises à jour: ${response.penaltiesUpdated}`);
        this.loadPayments();
      },
      error: (err) => { alert('Erreur: ' + err.message); },
    });
  }

  sendWhatsappReminder(id: number): void {
    this.whatsappService.sendPenaltyNotification(id).subscribe({
      next: (response) => { alert(response.message); },
      error: (err) => { alert('Erreur: ' + err.message); },
    });
  }

  togglePenaltyHistory(id: number): void {
    if (this.selectedPaymentId() === id) {
      this.selectedPaymentId.set(null);
      this.penaltyHistory.set([]);
    } else {
      this.loadPenaltyHistory(id);
    }
  }

  loadPenaltyHistory(id: number): void {
    this.selectedPaymentId.set(id);
    this.historyLoading.set(true);
    this.penaltyService.getPenaltyHistory(id).subscribe({
      next: (history) => { this.penaltyHistory.set(history); this.historyLoading.set(false); },
      error: () => { this.penaltyHistory.set([]); this.historyLoading.set(false); },
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'badge-info';
      case 'PAID':    return 'badge-success';
      case 'LATE':    return 'badge-warning';
      case 'OVERDUE': return 'badge-danger';
      default:        return 'badge-secondary';
    }
  }

  /** Retourne le label français du statut */
  getStatusLabel(status: string): string {
    return ECHEANCIER_STATUS_LABELS[status?.toUpperCase() as EcheancierStatus] ?? status ?? '—';
  }

  /** Marque un paiement comme payé et recharge la liste */
  markAsPaid(id: number): void {
    if (!confirm('Confirmer le paiement de cette échéance ?')) return;
    this.echeancierService.markAsPaid(id).subscribe({
      next: () => {
        this.loadPayments();
        if (this.selectedPaymentId() === id) this.loadPenaltyHistory(id);
      },
      error: (err) => { alert('Erreur: ' + err.message); },
    });
  }

  getPendingCount(): number {
    return this.payments().filter(p => p.status === 'PENDING').length;
  }

  getLateCount(): number {
    return this.payments().filter(p => p.status === 'LATE').length;
  }

  getOverduePayments(): EcheancierPayement[] {
    return this.payments().filter(p => p.status === 'OVERDUE');
  }

  getPaidCount(): number {
    return this.payments().filter(p => p.status === 'PAID').length;
  }

  getTotalPenalties(): number {
    return this.payments().reduce((sum, p) => sum + (p.penaltyAmount || 0), 0);
  }
}
