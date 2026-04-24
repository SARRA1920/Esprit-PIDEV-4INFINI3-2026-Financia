import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CreditService } from '../../core/credit.service';
import { RemboursementService } from '../../core/remboursement.service';
import { Credit } from '../../models/credit.model';
import { Remboursement } from '../../models/remboursement.model';

@Component({
  selector: 'app-espace-client',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe, RouterLink],
  templateUrl: './espace-client.component.html',
  styleUrl: './espace-client.component.scss',
})
export class EspaceClientComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly credits = inject(CreditService);
  private readonly remboursementsApi = inject(RemboursementService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = this.auth.user;

  readonly form = this.fb.nonNullable.group({
    amount: [10000, [Validators.required, Validators.min(0.001)]],
    durationMonths: [24, [Validators.required, Validators.min(1), Validators.max(360)]],
    startDate: [''],
  });

  /** Chargement initial de la liste des crédits. */
  initialLoading = true;
  /** Crédit en cours qui empêche une nouvelle demande (détails affichés si présent). */
  blockingCredit: Credit | null = null;
  /** Aligné sur l’API (`blocking`) : masque le formulaire même si le détail du crédit est absent. */
  hasBlockingCreditFlag = false;

  /**
   * Réponse automatique défavorable (score insuffisant). Non « bloquant » côté API :
   * affiché après envoi du formulaire jusqu’à ce que le client clique « Compris » ou refasse une demande.
   */
  rejectedApplication: Credit | null = null;

  remboursements: Remboursement[] = [];
  remboursementsLoading = false;
  remboursementsError = '';
  /** Premier chargement API des échéances terminé (évite ?pay=stripe trop tôt). */
  private remboursementsInitialized = false;

  error = '';
  loading = false;

  /** Actions Accepter / Refuser sur une offre automatique (OFFER_PENDING). */
  offerActionLoading = false;
  offerActionError = '';

  /** Montant estimé de la tranche mensuelle (si aucune échéance n’est encore générée). */
  get estimatedMonthlyAmount(): number | null {
    const c = this.blockingCredit;
    if (!c) return null;

    const principal = Number(c.amount ?? 0);
    const months = Number(c.durationMonths ?? 0);
    if (!Number.isFinite(principal) || !Number.isFinite(months) || months <= 0) return null;

    const annualRatePercent = Number(c.interestRate ?? 0);
    const rate = Number.isFinite(annualRatePercent) ? annualRatePercent : 0;

    // Même approche que le backend: total = principal + principal * (taux/100) * (mois/12)
    const totalPayable = principal + principal * (rate / 100) * (months / 12);
    return totalPayable / months;
  }

  /** Prochaine date limite estimée (1 mois après startDate, sinon 1 mois après aujourd’hui). */
  get estimatedNextDueDate(): string | null {
    const c = this.blockingCredit;
    if (!c) return null;

    const base = c.startDate ? new Date(c.startDate) : new Date();
    if (Number.isNaN(base.getTime())) return null;

    const d = new Date(base);
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  }

  /**
   * Barre de progression : uniquement les champs calculés côté Spring (`paidAmount`, `remainingAmount`).
   * Total crédité = paidAmount + remainingAmount.
   */
  get repaymentProgressPercent(): number | null {
    const c = this.blockingCredit;
    if (!c) return null;

    const paid = Number(c.paidAmount ?? NaN);
    const remaining = Number(c.remainingAmount ?? NaN);
    if (!Number.isFinite(paid) || !Number.isFinite(remaining)) return null;

    const total = paid + remaining;
    if (total <= 0) return null;

    const pct = (paid / total) * 100;
    if (!Number.isFinite(pct)) return null;
    return Math.max(0, Math.min(100, pct));
  }

  /** Affichage « Payé » : même source que Spring (`paidAmount`). */
  get paidSoFarAmount(): number {
    const c = this.blockingCredit;
    if (!c || c.paidAmount == null || !Number.isFinite(Number(c.paidAmount))) return 0;
    return Math.max(0, Number(c.paidAmount));
  }

  /** Avancement des échéances (payées / total). */
  get repaymentScheduleProgress(): { paid: number; total: number; percent: number } | null {
    const rows = this.remboursements ?? [];
    if (!rows.length) return null;

    const total = rows.length;
    const paid = rows.filter((r) => String(r.status ?? '').toUpperCase() === 'PAID').length;
    const percent = (paid / total) * 100;
    return {
      paid,
      total,
      percent: Math.max(0, Math.min(100, percent)),
    };
  }

  private todayIsoLocal(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** Offre automatique en attente de réponse client. */
  isOfferPending(c: Credit | null | undefined): boolean {
    return String(c?.status ?? '').toUpperCase() === 'OFFER_PENDING';
  }

  /** Demande refusée automatiquement (score sous le seuil minimal). */
  isRejected(c: Credit | null | undefined): boolean {
    return String(c?.status ?? '').toUpperCase() === 'REJECTED';
  }

  /** Dossier en zone intermédiaire : pas d’offre immédiate, étude complémentaire possible. */
  isPendingDecision(c: Credit | null | undefined): boolean {
    return String(c?.status ?? '').toUpperCase() === 'PENDING';
  }

  /** Texte synthétique pour le délai de réponse à l’offre. */
  get offerDeadlineHint(): string | null {
    const iso = this.blockingCredit?.offerExpiresAt;
    if (!iso) return null;
    const end = new Date(iso);
    if (Number.isNaN(end.getTime())) return null;
    const ms = end.getTime() - Date.now();
    if (ms <= 0) return 'Le délai est dépassé — le dossier sera traité comme refusé.';
    const days = Math.ceil(ms / 86400000);
    if (days <= 1) return 'Répondez avant la fin du délai indiqué (moins de 24 h).';
    return `Réponse attendue sous ${days} jour(s) au plus tard.`;
  }

  /** Échéances non encore payées, triées par date croissante. */
  get unpaidSorted(): Remboursement[] {
    return (this.remboursements ?? [])
      .filter((r) => String(r.status ?? '').toUpperCase() !== 'PAID')
      .sort((a, b) => String(a.dueDate ?? '').localeCompare(String(b.dueDate ?? '')));
  }

  /** Échéances impayées dont la date limite est déjà passée (retard). */
  get overduePayable(): Remboursement[] {
    const t = this.todayIsoLocal();
    return this.unpaidSorted.filter((r) => !!r.dueDate && String(r.dueDate) < t);
  }

  /**
   * Montant à régler dans l’affichage « maintenant » :
   * - si des échéances sont en retard : cumul des montants en retard ;
   * - sinon : montant de la prochaine échéance à venir (une seule tranche affichée).
   */
  get amountDueNow(): number {
    const overdue = this.overduePayable;
    if (overdue.length > 0) {
      return overdue.reduce((s, r) => s + Number(r.amount ?? 0), 0);
    }
    const next = this.nextPayableRemboursement;
    return next ? Number(next.amount ?? 0) : 0;
  }

  /** Première échéance à solder (Stripe / marquer payé) — la plus ancienne impayée. */
  get nextPayableRemboursement(): Remboursement | null {
    const u = this.unpaidSorted;
    return u.length ? u[0] : null;
  }

  /** Libellé court pour la date principale affichée. */
  get primaryDueCaption(): string {
    const overdue = this.overduePayable;
    if (overdue.length > 1) {
      return `${overdue.length} échéances en retard`;
    }
    if (overdue.length === 1 && overdue[0].dueDate) {
      return `Échéance en retard (${overdue[0].dueDate})`;
    }
    const next = this.nextPayableRemboursement;
    if (next?.dueDate) return `À régler avant le ${next.dueDate}`;
    return 'À régler';
  }

  /** Toutes les lignes sont payées. */
  get allRemboursementsPaid(): boolean {
    const rows = this.remboursements ?? [];
    return rows.length > 0 && rows.every((r) => String(r.status ?? '').toUpperCase() === 'PAID');
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (!this.remboursementsLoading) {
        this.handleStripePayIntentFromUrl();
      }
    });

    const u = this.auth.user();
    if (!u) {
      this.initialLoading = false;
      return;
    }
    this.credits.getBlockingInfo(u.idUser).subscribe({
      next: (info) => {
        this.hasBlockingCreditFlag = info.blocking === true;
        this.blockingCredit = info.credit ?? null;
        this.initialLoading = false;
        if (
          this.blockingCredit?.id &&
          !this.isOfferPending(this.blockingCredit) &&
          !this.isPendingDecision(this.blockingCredit)
        ) {
          this.loadRemboursements(this.blockingCredit.id);
        } else if (this.wantsStripeCheckoutFromUrl()) {
          this.remboursementsError =
            'Aucun crédit actif : le paiement en ligne est indisponible pour le moment.';
          void this.clearStripeCheckoutQuery();
        }
      },
      error: (e: Error) => {
        this.error = e.message;
        this.initialLoading = false;
      },
    });
  }

  private loadRemboursements(creditId: number): void {
    this.remboursementsLoading = true;
    this.remboursementsError = '';
    this.remboursementsApi.getByCredit(creditId).subscribe({
      next: (rows) => {
        this.remboursements = [...rows].sort((a, b) =>
          String(a.dueDate ?? '').localeCompare(String(b.dueDate ?? ''))
        );
        this.remboursementsLoading = false;
        this.remboursementsInitialized = true;
        /** Après paiement Stripe / MAJ backend, les montants « payé / reste » sont dans le crédit : on resynchronise. */
        this.refreshBlockingCredit();
        this.handleStripePayIntentFromUrl();
      },
      error: (e: Error) => {
        this.remboursementsError = e.message;
        this.remboursementsLoading = false;
        this.remboursementsInitialized = true;
      },
    });
  }

  /** URL « …?pay=stripe » : ouverture automatique du Checkout (navbar « Paiement »). */
  private wantsStripeCheckoutFromUrl(): boolean {
    return this.route.snapshot.queryParamMap.get('pay') === 'stripe';
  }

  /** Retour Stripe: success_url peut inclure session_id={CHECKOUT_SESSION_ID}. */
  private stripeSessionIdFromUrl(): string | null {
    const sid = this.route.snapshot.queryParamMap.get('session_id');
    return sid && sid.trim().length ? sid.trim() : null;
  }

  private async clearStripeCheckoutQuery(): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pay: null, session_id: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
      fragment: 'remboursements',
    });
  }

  private confirmStripeIfNeeded(): void {
    const sid = this.stripeSessionIdFromUrl();
    if (!sid) return;

    this.remboursementsLoading = true;
    this.remboursementsError = '';
    this.remboursementsApi.confirmStripeSession(sid).subscribe({
      next: () => {
        this.remboursementsLoading = false;
        void this.clearStripeCheckoutQuery();
        // Recharge pour refléter le status PAID
        this.refreshRemboursements();
      },
      error: (e: Error) => {
        this.remboursementsLoading = false;
        this.remboursementsError = e.message;
      },
    });
  }

  /**
   * Si l’utilisateur arrive avec ?pay=stripe, on enchaîne sur la création de session Stripe
   * pour la prochaine échéance payable (même flux que `createStripeCheckout`).
   */
  private handleStripePayIntentFromUrl(): void {
    // 1) Si on revient de Stripe avec session_id, on confirme côté backend (fallback dev).
    this.confirmStripeIfNeeded();

    if (!this.wantsStripeCheckoutFromUrl()) return;
    if (!this.remboursementsInitialized) return;

    if (!this.remboursements.length) {
      this.remboursementsError =
        'Impossible de payer en ligne : aucune échéance disponible. Rafraîchissez après génération du calendrier.';
      void this.clearStripeCheckoutQuery();
      return;
    }

    if (!this.nextPayableRemboursement) {
      this.remboursementsError = 'Toutes vos échéances sont déjà payées.';
      void this.clearStripeCheckoutQuery();
      return;
    }

    void this.clearStripeCheckoutQuery().then(() => this.payNextWithStripe());
  }

  refreshRemboursements(): void {
    const id = this.blockingCredit?.id;
    const c = this.blockingCredit;
    if (!id || !c || this.isOfferPending(c) || this.isPendingDecision(c)) return;
    this.loadRemboursements(id);
  }

  dismissRejection(): void {
    this.rejectedApplication = null;
  }

  acceptOffer(): void {
    const u = this.auth.user();
    const c = this.blockingCredit;
    if (!u || !c?.id || !this.isOfferPending(c)) return;
    this.offerActionLoading = true;
    this.offerActionError = '';
    this.credits.acceptOffer(c.id, u.idUser).subscribe({
      next: (cred) => {
        this.blockingCredit = cred;
        this.offerActionLoading = false;
        this.hasBlockingCreditFlag = true;
        if (cred.id) {
          this.loadRemboursements(cred.id);
        }
        this.refreshBlockingCredit();
      },
      error: (e: Error) => {
        this.offerActionError = e.message;
        this.offerActionLoading = false;
        this.refreshBlockingCredit();
      },
    });
  }

  refuseOffer(): void {
    const u = this.auth.user();
    const c = this.blockingCredit;
    if (!u || !c?.id || !this.isOfferPending(c)) return;
    this.offerActionLoading = true;
    this.offerActionError = '';
    this.credits.refuseOffer(c.id, u.idUser).subscribe({
      next: () => {
        this.offerActionLoading = false;
        this.offerActionError = '';
        this.refreshBlockingCredit();
      },
      error: (e: Error) => {
        this.offerActionError = e.message;
        this.offerActionLoading = false;
        this.refreshBlockingCredit();
      },
    });
  }

  /** Recharge le résumé crédit (remainingAmount, paidAmount, progression) après un paiement. */
  private refreshBlockingCredit(): void {
    const u = this.auth.user();
    if (!u) return;
    this.credits.getBlockingInfo(u.idUser).subscribe({
      next: (info) => {
        this.hasBlockingCreditFlag = info.blocking === true;
        this.blockingCredit = info.credit ?? null;
      },
      error: () => {
        /** Ne pas masquer une erreur métier déjà affichée pour les échéances */
      },
    });
  }

  /** Libellé français pour l’affichage client (pas les codes bruts API). */
  creditStatusLabel(status: string | undefined): string {
    const s = String(status ?? '').toUpperCase();
    const labels: Record<string, string> = {
      PENDING: 'En attente de décision',
      OFFER_PENDING: 'Offre en attente de votre réponse',
      APPROVED: 'Approuvé',
      ACTIVE: 'En cours de remboursement',
      REJECTED: 'Refusé',
      CLOSED: 'Clôturé',
    };
    return labels[s] ?? (status ? String(status) : '—');
  }

  paymentStatusLabel(status: string | undefined): string {
    const s = String(status ?? '').toUpperCase();
    const labels: Record<string, string> = {
      PENDING: 'À payer',
      PAID: 'Payé',
      FAILED: 'Échec',
      CANCELLED: 'Annulé',
    };
    return labels[s] ?? (status ? String(status) : '—');
  }

  async payNow(r: Remboursement): Promise<void> {
    if (!r?.id) return;
    this.remboursementsError = '';
    this.remboursementsLoading = true;
    this.remboursementsApi.pay(r.id).subscribe({
      next: (updated) => {
        this.remboursements = this.remboursements.map((x) =>
          x.id === updated.id ? updated : x
        );
        this.remboursementsLoading = false;
        this.refreshBlockingCredit();
      },
      error: (e: Error) => {
        this.remboursementsError = e.message;
        this.remboursementsLoading = false;
      },
    });
  }

  payWithStripe(r: Remboursement): void {
    if (!r?.id) return;
    this.remboursementsError = '';
    this.remboursementsLoading = true;
    this.remboursementsApi.createStripeCheckout(r.id).subscribe({
      next: (dto) => {
        this.remboursementsLoading = false;
        if (dto?.checkoutUrl) {
          window.location.href = dto.checkoutUrl;
        } else {
          this.remboursementsError = 'Lien de paiement Stripe indisponible.';
        }
      },
      error: (e: Error) => {
        this.remboursementsError = e.message;
        this.remboursementsLoading = false;
      },
    });
  }

  /** CTA unique : ouvre la session Checkout Stripe pour la prochaine échéance à payer. */
  payNextWithStripe(): void {
    const r = this.nextPayableRemboursement;
    if (r) this.payWithStripe(r);
  }

  scrollToRemboursements(): void {
    const el = document.getElementById('remboursements');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  goToRemboursements(ev?: Event): void {
    // Empêche toute navigation "accidentelle" (template legacy, bubbling, etc.).
    ev?.preventDefault();
    ev?.stopPropagation();
    this.scrollToRemboursements();
  }

  submit(): void {
    if (this.form.invalid || this.hasBlockingCreditFlag) {
      this.form.markAllAsTouched();
      return;
    }
    const u = this.auth.user();
    if (!u) return;

    const raw = this.form.getRawValue();
    const payload: {
      amount: number;
      durationMonths: number;
      startDate?: string;
    } = {
      amount: Number(raw.amount),
      durationMonths: Number(raw.durationMonths),
    };
    if (raw.startDate?.trim()) {
      payload.startDate = raw.startDate.trim();
    }

    this.loading = true;
    this.error = '';
    this.rejectedApplication = null;

    this.credits.create(u.idUser, payload).subscribe({
      next: (c) => {
        this.loading = false;
        this.form.reset({ amount: 10000, durationMonths: 24, startDate: '' });

        const st = String(c.status ?? '').toUpperCase();

        if (st === 'REJECTED') {
          this.hasBlockingCreditFlag = false;
          this.blockingCredit = null;
          this.rejectedApplication = c;
          return;
        }

        this.hasBlockingCreditFlag = true;
        this.blockingCredit = c;
        this.rejectedApplication = null;

        if (c?.id && !this.isOfferPending(c) && !this.isPendingDecision(c)) {
          this.loadRemboursements(c.id);
        }
      },
      error: (e: Error) => {
        this.error = e.message;
        this.loading = false;
      },
    });
  }
}
