import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ClientBriefingService } from '../../core/client-briefing.service';
import { CreditService } from '../../core/credit.service';
import { RemboursementService } from '../../core/remboursement.service';
import { SavingsService } from '../../core/savings.service';
import { ToastService } from '../../core/toast.service';
import { Credit } from '../../models/credit.model';
import { Remboursement } from '../../models/remboursement.model';
import { GoalPredictionResult, SavingsAccount, SavingsAccountType, SavingsGoal, SavingsTransaction } from '../../models/savings.model';

type GoalInsightState = {
  forecast: GoalPredictionResult | null;
  advice: string;
  forecastLoading: boolean;
  adviceLoading: boolean;
  error: string;
};

type CoachChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  at: number;
};

@Component({
  selector: 'app-espace-client',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DecimalPipe, RouterLink],
  templateUrl: './espace-client.component.html',
  styleUrl: './espace-client.component.scss',
})
export class EspaceClientComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly credits = inject(CreditService);
  private readonly remboursementsApi = inject(RemboursementService);
  private readonly savingsApi = inject(SavingsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly briefing = inject(ClientBriefingService);
  private readonly toast = inject(ToastService);

  readonly user = this.auth.user;

  readonly form = this.fb.nonNullable.group({
    amount: [10000, [Validators.required, Validators.min(0.001)]],
    durationMonths: [24, [Validators.required, Validators.min(1), Validators.max(360)]],
    startDate: [''],
  });

  savingsAccounts: SavingsAccount[] = [];
  savingsLoading = false;
  savingsError = '';

  savingsGoals: SavingsGoal[] = [];
  goalsLoading = false;
  goalsError = '';
  goalSuccess = '';
  coachLoading = false;
  coachGoalId: number | null = null;
  coachMessage =
    'Bonjour. Je suis votre coach epargne. Choisissez un objectif et je vous dirai si vous etes sur la bonne voie.';
  coachTone: 'neutral' | 'good' | 'risk' = 'neutral';
  /** Conversation avec le coach (question → réponse agent). */
  coachChatMessages: CoachChatMessage[] = [];
  coachPromptInput = '';
  /** Portrait « conseiller » (avatar SVG généré — pas de dépendance locale). */
  readonly coachAvatarUrl =
    'https://api.dicebear.com/7.x/personas/svg?seed=MarcFinancia&backgroundColor=e0f2fe';
  private coachChatSeq = 0;
  /** Lecture vocale des reponses Marc (Web Speech API du navigateur). */
  coachVoiceEnabled = false;
  private readonly goalInsights = new Map<number, GoalInsightState>();

  readonly savingsForm = this.fb.nonNullable.group({
    type: ['CLASSIC' as SavingsAccountType, Validators.required],
  });

  readonly goalForm = this.fb.nonNullable.group({
    savingsAccountId: [0, [Validators.required, Validators.min(1)]],
    targetAmount: [0, [Validators.required, Validators.min(0.001)]],
    deadline: ['', Validators.required],
    description: [''],
  });

  readonly transactionForm = this.fb.nonNullable.group({
    accountId: [0, Validators.required],
    amount: [0, [Validators.required, Validators.min(0.001)]],
    description: [''],
    action: ['deposit', Validators.required]
  });
  transactionLoading = false;
  transactionError = '';
  transactionSuccess = '';
  historyTransactions: SavingsTransaction[] = [];
  historyLoading = false;
  historyError = '';
  transactionFilter: 'ALL' | 'DEPOSIT' | 'WITHDRAWAL' = 'ALL';

  /** Simulateur what-if (versement mensuel hypothétique). */
  whatIfMonthly = 100;
  whatIfGoalId: number | null = null;

  /** Chargement initial de la liste des crédits. */
  initialLoading = true;
  /** Crédit en cours qui empêche une nouvelle demande (détails affichés si présent). */
  blockingCredit: Credit | null = null;
  /** Aligné sur l’API (`blocking`) : masque le formulaire même si le détail du crédit est absent. */
  hasBlockingCreditFlag = false;

  remboursements: Remboursement[] = [];
  remboursementsLoading = false;
  remboursementsError = '';
  /** Premier chargement API des échéances terminé (évite ?pay=stripe trop tôt). */
  private remboursementsInitialized = false;

  error = '';
  loading = false;

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

  get activeSavingsAccounts(): SavingsAccount[] {
    return this.savingsAccounts.filter((account) => account.status === 'ACTIVE');
  }

  get availableGoalAccounts(): SavingsAccount[] {
    const usedAccountIds = new Set(
      this.savingsGoals
        .map((goal) => goal.savingsAccount?.id)
        .filter((id): id is number => typeof id === 'number')
    );

    return this.activeSavingsAccounts.filter((account) => !usedAccountIds.has(account.id));
  }

  get featuredGoal(): SavingsGoal | null {
    return this.savingsGoals.length ? this.savingsGoals[0] : null;
  }

  get totalSavingsBalance(): number {
    return this.savingsAccounts.reduce((sum, account) => sum + Number(account.balance ?? 0), 0);
  }

  get activeGoalsCount(): number {
    return this.savingsGoals.filter((goal) => goal.status === 'IN_PROGRESS').length;
  }

  get selectedHistoryAccount(): SavingsAccount | null {
    const accountId = Number(this.transactionForm.getRawValue().accountId);
    return this.savingsAccounts.find((account) => account.id === accountId) ?? this.activeSavingsAccounts[0] ?? null;
  }

  get filteredHistoryTransactions(): SavingsTransaction[] {
    if (this.transactionFilter === 'ALL') {
      return this.historyTransactions;
    }
    return this.historyTransactions.filter((transaction) => transaction.type === this.transactionFilter);
  }

  get monthSummary(): { totalDeposits: number; totalWithdrawals: number; netChange: number; bestMonth: boolean } {
    const currentMonth = this.monthTransactions(0);
    const previousMonth = this.monthTransactions(1);
    const totalDeposits = currentMonth
      .filter((transaction) => transaction.type === 'DEPOSIT')
      .reduce((sum, transaction) => sum + Number(transaction.amount ?? 0), 0);
    const totalWithdrawals = currentMonth
      .filter((transaction) => transaction.type === 'WITHDRAWAL')
      .reduce((sum, transaction) => sum + Number(transaction.amount ?? 0), 0);
    const previousDeposits = previousMonth
      .filter((transaction) => transaction.type === 'DEPOSIT')
      .reduce((sum, transaction) => sum + Number(transaction.amount ?? 0), 0);

    return {
      totalDeposits,
      totalWithdrawals,
      netChange: totalDeposits - totalWithdrawals,
      bestMonth: totalDeposits > 0 && totalDeposits >= previousDeposits,
    };
  }

  get behaviorInsights(): {
    regularityScore: number;
    avgDeposit: number;
    depositFrequency: string;
    monthComparison: {
      deposits: { current: number; previous: number };
      withdrawals: { current: number; previous: number };
    };
    alert: string;
  } {
    const currentMonth = this.monthTransactions(0);
    const previousMonth = this.monthTransactions(1);
    const currentDeposits = currentMonth.filter((transaction) => transaction.type === 'DEPOSIT');
    const currentWithdrawals = currentMonth.filter((transaction) => transaction.type === 'WITHDRAWAL');
    const previousDeposits = previousMonth.filter((transaction) => transaction.type === 'DEPOSIT');
    const previousWithdrawals = previousMonth.filter((transaction) => transaction.type === 'WITHDRAWAL');

    const avgDeposit = currentDeposits.length
      ? currentDeposits.reduce((sum, transaction) => sum + Number(transaction.amount ?? 0), 0) / currentDeposits.length
      : 0;

    const sortedDepositDates = currentDeposits
      .map((transaction) => transaction.transactionDate ? new Date(transaction.transactionDate) : null)
      .filter((date): date is Date => !!date && !Number.isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    let depositFrequency = 'Pas encore assez de depots';
    let regularityScore = Math.min(100, currentDeposits.length * 22);
    if (sortedDepositDates.length >= 2) {
      const intervals: number[] = [];
      for (let index = 1; index < sortedDepositDates.length; index += 1) {
        const diffMs = sortedDepositDates[index].getTime() - sortedDepositDates[index - 1].getTime();
        intervals.push(Math.max(1, Math.round(diffMs / 86400000)));
      }
      const averageInterval = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
      const variance = intervals.reduce((sum, value) => sum + Math.abs(value - averageInterval), 0) / intervals.length;
      regularityScore = Math.max(25, Math.min(100, 100 - variance * 4));
      depositFrequency = `Tous les ${Math.round(averageInterval)} jours`;
    }

    let alert = 'Votre rythme reste stable. Continuez vos versements reguliers.';
    if (currentWithdrawals.length > previousWithdrawals.length) {
      alert = 'Vous avez fait plus de retraits que le mois precedent.';
    } else if (currentDeposits.length > previousDeposits.length) {
      alert = 'Bonne dynamique: vous deposez plus souvent que le mois precedent.';
    } else if (!currentDeposits.length) {
      alert = 'Aucun depot ce mois-ci pour le moment. Un petit versement relancerait la dynamique.';
    }

    return {
      regularityScore: Math.round(regularityScore),
      avgDeposit: Math.round(avgDeposit),
      depositFrequency,
      monthComparison: {
        deposits: { current: currentDeposits.length, previous: previousDeposits.length },
        withdrawals: { current: currentWithdrawals.length, previous: previousWithdrawals.length },
      },
      alert,
    };
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (!this.remboursementsLoading) {
        this.handleStripePayIntentFromUrl();
      }
      if (!this.initialLoading) {
        this.tryScrollToEpargneFromUrl();
      }
    });

    const u = this.auth.user();
    if (!u) {
      this.initialLoading = false;
      return;
    }
    this.transactionForm.controls.accountId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((accountId) => {
        if (accountId && Number(accountId) > 0) {
          this.loadSavingsTransactions(Number(accountId));
        }
      });
    this.loadSavingsAccounts();
    this.loadSavingsGoals();
    this.initCoachSpeechSynthesis();
    this.credits.getBlockingInfo(u.idUser).subscribe({
      next: (info) => {
        this.hasBlockingCreditFlag = info.blocking === true;
        this.blockingCredit = info.credit ?? null;
        this.initialLoading = false;
        if (this.blockingCredit?.id) {
          this.loadRemboursements(this.blockingCredit.id);
        } else if (this.wantsStripeCheckoutFromUrl()) {
          this.remboursementsError =
            'Aucun crédit actif : le paiement en ligne est indisponible pour le moment.';
          void this.clearStripeCheckoutQuery();
        }
        this.tryScrollToEpargneFromUrl();
      },
      error: (e: Error) => {
        this.error = e.message;
        this.initialLoading = false;
        this.tryScrollToEpargneFromUrl();
      },
    });

    this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (!this.initialLoading) this.tryScrollToEpargneFromUrl();
    });
  }

  /**
   * Landing depuis Services / marketing / cloche notifications :
   * - `#epargne` / `?section=epargne`, `#epargne-ouvrir-compte`, `#remboursements`, etc.
   */
  private tryScrollToEpargneFromUrl(): void {
    if (this.initialLoading) return;
    const frag = this.route.snapshot.fragment;
    const section = this.route.snapshot.queryParamMap.get('section');
    let targetId: string | null = null;
    if (
      frag === 'epargne-ouvrir-compte' ||
      section === 'epargne-ouvrir' ||
      section === 'epargne-ouvrir-compte'
    ) {
      targetId = 'epargne-ouvrir-compte';
    } else if (frag === 'epargne' || section === 'epargne') {
      targetId = 'epargne';
    } else if (
      frag &&
      [
        'remboursements',
        'epargne-actions',
        'epargne-goals',
        'epargne-insights',
        'epargne-resume',
        'tableau-de-bord-client',
        'what-if-objectif',
      ].includes(frag)
    ) {
      targetId = frag;
    }
    if (!targetId) return;
    setTimeout(() => this.scrollToAnchor(targetId), 180);
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
        this.syncBriefing();
        /** Après paiement Stripe / MAJ backend, les montants « payé / reste » sont dans le crédit : on resynchronise. */
        this.refreshBlockingCredit();
        this.handleStripePayIntentFromUrl();
        setTimeout(() => this.tryScrollToEpargneFromUrl(), 200);
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
    if (!id) return;
    this.loadRemboursements(id);
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

    this.credits.create(u.idUser, payload).subscribe({
      next: (c) => {
        this.hasBlockingCreditFlag = true;
        this.blockingCredit = c;
        this.loading = false;
        this.form.reset({ amount: 10000, durationMonths: 24, startDate: '' });
        if (c?.id) {
          this.loadRemboursements(c.id);
        }
      },
      error: (e: Error) => {
        this.error = e.message;
        this.loading = false;
      },
    });
  }

  loadSavingsAccounts(): void {
    this.savingsLoading = true;
    this.savingsError = '';
    this.savingsApi.getMyAccounts().subscribe({
      next: (accounts) => {
        this.savingsAccounts = accounts;
        this.savingsLoading = false;
        this.syncBriefing();
        if (accounts.length > 0 && this.transactionForm.value.accountId === 0) {
          const activeAccounts = accounts.filter(a => a.status === 'ACTIVE');
          if (activeAccounts.length > 0 && activeAccounts[0].id !== undefined) {
             this.transactionForm.patchValue({ accountId: activeAccounts[0].id });
          }
        } else if (!accounts.length) {
          this.historyTransactions = [];
        }
        const selectedGoalAccountId = this.goalForm.getRawValue().savingsAccountId;
        if (!selectedGoalAccountId || !this.availableGoalAccounts.some((account) => account.id === selectedGoalAccountId)) {
          this.goalForm.patchValue({ savingsAccountId: this.availableGoalAccounts[0]?.id ?? 0 });
        }
      },
      error: (err: Error) => {
        this.savingsError = err.message;
        this.savingsLoading = false;
      }
    });
  }

  loadSavingsGoals(): void {
    this.goalsLoading = true;
    this.goalsError = '';
    this.savingsApi.getMyGoals().subscribe({
      next: (goals) => {
        this.savingsGoals = goals;
        this.goalsLoading = false;
        this.syncBriefing();
        this.syncCoachMessage();
        this.ensureCoachChatWelcome();
        const selectedGoalAccountId = this.goalForm.getRawValue().savingsAccountId;
        if (!selectedGoalAccountId || !this.availableGoalAccounts.some((account) => account.id === selectedGoalAccountId)) {
          this.goalForm.patchValue({ savingsAccountId: this.availableGoalAccounts[0]?.id ?? 0 });
        }
      },
      error: (err: Error) => {
        this.goalsError = err.message;
        this.goalsLoading = false;
      }
    });
  }

  createSavingsAccount(): void {
    if (this.savingsForm.invalid) {
      this.savingsForm.markAllAsTouched();
      return;
    }
    
    this.savingsLoading = true;
    this.savingsApi.createAccount({ type: this.savingsForm.getRawValue().type }).subscribe({
      next: () => {
        this.toast.show('Compte d epargne cree.', 'success');
        this.loadSavingsAccounts();
        this.savingsForm.reset({ type: 'CLASSIC' as SavingsAccountType });
      },
      error: (err: Error) => {
        this.savingsError = err.message;
        this.savingsLoading = false;
      }
    });
  }

  loadSavingsTransactions(accountId: number): void {
    this.historyLoading = true;
    this.historyError = '';
    this.savingsApi.listTransactionsByAccount(accountId).subscribe({
      next: (transactions) => {
        this.historyTransactions = [...transactions].sort((a, b) =>
          String(b.transactionDate ?? '').localeCompare(String(a.transactionDate ?? ''))
        );
        this.historyLoading = false;
        this.syncBriefing();
      },
      error: (err: Error) => {
        this.historyError = err.message;
        this.historyLoading = false;
      }
    });
  }

  createGoal(): void {
    if (this.goalForm.invalid || !this.availableGoalAccounts.length) {
      this.goalForm.markAllAsTouched();
      return;
    }

    const value = this.goalForm.getRawValue();
    this.goalsLoading = true;
    this.goalsError = '';
    this.goalSuccess = '';

    this.savingsApi.createGoal({
      targetAmount: Number(value.targetAmount),
      currentAmount: 0,
      deadline: value.deadline,
      description: value.description || undefined,
      savingsAccount: { id: Number(value.savingsAccountId) },
    }).subscribe({
      next: () => {
        this.toast.show('Objectif cree avec succes.', 'success');
        this.goalSuccess = 'Objectif d epargne cree avec succes.';
        this.goalsLoading = false;
        this.coachChatMessages = [];
        this.coachMessage = 'Nouvel objectif cree. Je peux maintenant analyser sa trajectoire et vous proposer un plan.';
        this.coachTone = 'neutral';
        this.goalForm.reset({
          savingsAccountId: 0,
          targetAmount: 0,
          deadline: '',
          description: '',
        });
        this.loadSavingsGoals();
        this.loadSavingsAccounts();
      },
      error: (err: Error) => {
        this.goalsError = err.message;
        this.goalsLoading = false;
      }
    });
  }

  submitTransaction(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const { accountId, amount, description, action } = this.transactionForm.getRawValue();
    this.transactionLoading = true;
    this.transactionError = '';
    this.transactionSuccess = '';

    const obs$ = action === 'deposit' 
      ? this.savingsApi.deposit(accountId, { amount, description: description || undefined })
      : this.savingsApi.withdraw(accountId, { amount, description: description || undefined });

    obs$.subscribe({
      next: () => {
        this.toast.show(`Transaction ${action === 'deposit' ? 'depot' : 'retrait'} enregistree.`, 'success');
        this.transactionSuccess = `Transaction (${action}) effectuée avec succès.`;
        this.transactionLoading = false;
        this.transactionForm.reset({ accountId, amount: 0, description: '', action: 'deposit' });
        this.loadSavingsAccounts();
        this.loadSavingsGoals();
        this.loadSavingsTransactions(accountId);
      },
      error: (err: Error) => {
        this.transactionError = err.message;
        this.transactionLoading = false;
      }
    });
  }

  goalProgress(goal: SavingsGoal): number {
    const raw = Number(goal.completionRate ?? ((goal.currentAmount / Math.max(goal.targetAmount, 1)) * 100));
    if (!Number.isFinite(raw)) {
      return 0;
    }
    return Math.max(0, Math.min(100, raw));
  }

  goalStatusLabel(status: string | undefined): string {
    const s = String(status ?? '').toUpperCase();
    const labels: Record<string, string> = {
      IN_PROGRESS: 'En progression',
      COMPLETED: 'Atteint',
      FAILED: 'En retard',
    };
    return labels[s] ?? (status ? String(status) : 'Inconnu');
  }

  goalVerdictLabel(goalId: number): string {
    const verdict = this.goalInsight(goalId).forecast?.verdict;
    return verdict || 'Prediction en attente';
  }

  goalAdvicePreview(goalId: number): string {
    const advice = this.goalInsight(goalId).advice;
    return advice || 'Demandez un conseil pour obtenir une recommandation personnalisee.';
  }

  goalPredictionDate(goalId: number): string {
    return this.goalInsight(goalId).forecast?.predictedCompletionDate || 'Non disponible';
  }

  goalPredictionMessage(goalId: number): string {
    const forecast = this.goalInsight(goalId).forecast;
    if (!forecast) {
      return 'Lancez une projection pour voir si votre rythme actuel suffit.';
    }
    return forecast.message || forecast.advice || 'Projection disponible.';
  }

  loadGoalForecast(goal: SavingsGoal): void {
    const state = this.goalInsight(goal.id);
    state.forecastLoading = true;
    state.error = '';
    this.coachLoading = true;
    this.coachGoalId = goal.id;
    this.coachMessage = `Analyse predictive en cours pour ${this.goalTitle(goal)}...`;

    this.savingsApi.forecastGoal(goal.id).subscribe({
      next: (forecast) => {
        state.forecast = forecast;
        state.forecastLoading = false;
        this.coachLoading = false;
        this.coachTone = this.inferCoachTone(forecast.verdict);
        this.coachMessage = forecast.advice || forecast.message || `Projection terminee pour ${this.goalTitle(goal)}.`;
        const summary =
          forecast.advice ||
          forecast.message ||
          `Projection terminee pour « ${this.goalTitle(goal)} » (${forecast.verdict || 'resultat'}).`;
        this.pushCoachChat('assistant', summary);
      },
      error: (err: Error) => {
        state.error = err.message;
        state.forecastLoading = false;
        this.coachLoading = false;
        this.coachTone = 'risk';
        this.coachMessage = 'Je n ai pas pu generer la projection pour le moment.';
        this.pushCoachChat('assistant', this.formatForecastCoachError(err));
      }
    });
  }

  loadGoalAdvice(goal: SavingsGoal): void {
    const state = this.goalInsight(goal.id);
    state.adviceLoading = true;
    state.error = '';
    this.coachLoading = true;
    this.coachGoalId = goal.id;
    this.coachMessage = `Je prepare un conseil personnalise pour ${this.goalTitle(goal)}...`;

    this.savingsApi.getAgentAdvice(goal.id, {}).subscribe({
      next: (advice) => {
        state.advice = this.normalizeAdvice(advice);
        state.adviceLoading = false;
        this.coachLoading = false;
        this.coachTone = state.forecast ? this.inferCoachTone(state.forecast.verdict) : 'good';
        this.coachMessage = state.advice;
        this.pushCoachChat('assistant', state.advice);
      },
      error: (err: Error) => {
        state.error = err.message;
        state.adviceLoading = false;
        this.coachLoading = false;
        this.coachTone = 'risk';
        this.coachMessage = 'Le coach n est pas disponible pour le moment.';
        this.pushCoachChat('assistant', this.formatAgentAdviceCoachError(err));
      }
    });
  }

  focusGoal(goal: SavingsGoal): void {
    this.coachGoalId = goal.id;
    const state = this.goalInsight(goal.id);
    if (state.advice) {
      this.coachMessage = state.advice;
      this.coachTone = state.forecast ? this.inferCoachTone(state.forecast.verdict) : 'good';
      return;
    }
    if (state.forecast) {
      this.coachMessage = state.forecast.advice || state.forecast.message || 'Projection disponible.';
      this.coachTone = this.inferCoachTone(state.forecast.verdict);
      return;
    }
    this.coachMessage = `Selectionnez Forecast ou Advice pour ${this.goalTitle(goal)}.`;
    this.coachTone = 'neutral';
  }

  goalInsight(goalId: number): GoalInsightState {
    let state = this.goalInsights.get(goalId);
    if (!state) {
      state = {
        forecast: null,
        advice: '',
        forecastLoading: false,
        adviceLoading: false,
        error: '',
      };
      this.goalInsights.set(goalId, state);
    }
    return state;
  }

  setTransactionFilter(filter: 'ALL' | 'DEPOSIT' | 'WITHDRAWAL'): void {
    this.transactionFilter = filter;
  }

  prepareDeposit(amount: number): void {
    const accountId = this.selectedHistoryAccount?.id ?? this.activeSavingsAccounts[0]?.id ?? 0;
    this.transactionForm.patchValue({
      accountId,
      amount,
      action: 'deposit',
      description: `Versement conseille de ${amount} TND`,
    });
    this.scrollToAnchor('transAmount');
  }

  requestCoachAdvice(): void {
    if (this.featuredGoal) {
      this.loadGoalAdvice(this.featuredGoal);
      this.scrollToAnchor('ve-coach-panel');
    }
  }

  reviewFeaturedGoal(): void {
    if (this.featuredGoal) {
      this.focusGoal(this.featuredGoal);
      this.scrollToAnchor('epargne');
    }
  }

  openGoalCreator(): void {
    this.scrollToAnchor('goalAccount');
  }

  coachActiveGoal(): SavingsGoal | null {
    if (!this.savingsGoals.length) {
      return null;
    }
    const id = this.coachGoalId ?? this.savingsGoals[0].id;
    return this.savingsGoals.find((g) => g.id === id) ?? this.savingsGoals[0];
  }

  onCoachGoalSelect(goalId: number): void {
    this.coachGoalId = goalId;
    const goal = this.savingsGoals.find((g) => g.id === goalId);
    if (goal) {
      this.focusGoal(goal);
    }
  }

  submitCoachQuestion(): void {
    const text = this.coachPromptInput.trim();
    if (!text) {
      this.toast.show('Ecrivez une question.', 'warn');
      return;
    }
    if (text.length > 2000) {
      this.toast.show('Question trop longue (2000 caracteres max).', 'warn');
      return;
    }
    const goal = this.coachActiveGoal();
    if (!goal) {
      this.toast.show('Creez d abord un objectif d epargne.', 'warn');
      return;
    }
    this.pushCoachChat('user', text);
    this.coachPromptInput = '';
    this.coachLoading = true;
    this.coachGoalId = goal.id;
    this.coachMessage = 'Analyse de votre question en cours...';
    this.coachTone = 'neutral';

    this.savingsApi.getAgentAdvice(goal.id, { query: text }).subscribe({
      next: (advice) => {
        const norm = this.normalizeAdvice(advice);
        const state = this.goalInsight(goal.id);
        state.advice = norm;
        state.adviceLoading = false;
        this.coachLoading = false;
        this.coachTone = state.forecast ? this.inferCoachTone(state.forecast.verdict) : 'good';
        this.coachMessage = norm;
        this.pushCoachChat('assistant', norm);
      },
      error: (err: Error) => {
        this.coachLoading = false;
        this.coachTone = 'risk';
        this.coachMessage = 'Le coach n est pas disponible pour le moment.';
        this.pushCoachChat('assistant', this.formatAgentAdviceCoachError(err));
      },
    });
  }

  onCoachPromptKeydown(ev: KeyboardEvent): void {
    if (ev.key !== 'Enter' || ev.shiftKey) {
      return;
    }
    ev.preventDefault();
    this.submitCoachQuestion();
  }

  /** Interrompt la lecture vocale en cours (bouton Stop). */
  stopCoachSpeech(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  get speechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && !!window.speechSynthesis;
  }

  private initCoachSpeechSynthesis(): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }
    const sync = () => {
      void window.speechSynthesis.getVoices();
    };
    sync();
    window.speechSynthesis.addEventListener('voiceschanged', sync);
    this.destroyRef.onDestroy(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', sync);
      window.speechSynthesis.cancel();
    });
  }

  /**
   * Voix francaise la plus proche d’un timbre masculin neutre (depend du navigateur / OS).
   */
  private pickFrenchMaleVoice(): SpeechSynthesisVoice | undefined {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return undefined;
    }
    const voices = window.speechSynthesis.getVoices();
    const fr = voices.filter((v) => /^fr/i.test(v.lang));
    const maleHints =
      /male|homme|thomas|daniel|jacques|henri|paul|bernard|yves|nicolas|remi|male\b|microsoft.*\b(paul|henri|daniel)\b/i;
    const maleFr = fr.filter((v) => maleHints.test(v.name));
    if (maleFr.length) {
      return maleFr[0];
    }
    const femaleHints = /female|femme|julie|amelie|hortense|nathalie|female\b/i;
    const notFemale = fr.filter((v) => !femaleHints.test(v.name));
    if (notFemale.length) {
      return notFemale[0];
    }
    return fr[0] ?? voices[0];
  }

  private speakAssistantReply(text: string): void {
    if (typeof window === 'undefined' || !window.speechSynthesis || !this.coachVoiceEnabled) {
      return;
    }
    const plain = text.replace(/\s+/g, ' ').trim();
    if (!plain) {
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(plain);
    u.lang = 'fr-FR';
    u.rate = 0.92;
    u.pitch = 0.97;
    const voice = this.pickFrenchMaleVoice();
    if (voice) {
      u.voice = voice;
      if (voice.lang) {
        u.lang = voice.lang;
      }
    }
    window.speechSynthesis.speak(u);
  }

  private pushCoachChat(
    role: 'user' | 'assistant',
    text: string,
    opts?: { suppressSpeech?: boolean }
  ): void {
    this.coachChatSeq += 1;
    this.coachChatMessages = [
      ...this.coachChatMessages,
      { id: `c-${this.coachChatSeq}`, role, text, at: Date.now() },
    ];
    this.scrollCoachChatToEnd();
    if (role === 'assistant' && this.coachVoiceEnabled && !opts?.suppressSpeech) {
      queueMicrotask(() => this.speakAssistantReply(text));
    }
  }

  private scrollCoachChatToEnd(): void {
    queueMicrotask(() => {
      const el = document.getElementById('ve-coach-chat-log');
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }

  private ensureCoachChatWelcome(): void {
    if (this.coachChatMessages.length > 0) {
      return;
    }
    if (!this.savingsGoals.length) {
      this.pushCoachChat(
        'assistant',
        'Bonjour. Je suis Marc, votre conseiller epargne Financia. Creez un objectif ci-dessous, puis posez votre question ici — la reponse est generee par notre agent de conseil.',
        { suppressSpeech: true }
      );
      return;
    }
    const goal = this.coachActiveGoal();
    if (!goal) {
      return;
    }
    this.pushCoachChat(
      'assistant',
      `Bonjour. Je suis Marc, votre conseiller epargne. Posez-moi vos questions sur « ${this.goalTitle(goal)} » — vous pouvez changer d objectif dans le menu ci-dessus.`,
      { suppressSpeech: true }
    );
  }

  private syncCoachMessage(): void {
    if (!this.savingsGoals.length) {
      this.coachGoalId = null;
      this.coachMessage =
        'Creez votre premier objectif et je vous aiderai a anticiper votre progression.';
      this.coachTone = 'neutral';
      return;
    }

    const currentGoal = this.coachGoalId
      ? this.savingsGoals.find((goal) => goal.id === this.coachGoalId) ?? null
      : null;

    if (!currentGoal) {
      const first = this.savingsGoals[0];
      this.coachGoalId = first.id;
      this.coachMessage = `Je surveille ${this.goalTitle(first)}. Lancez une projection pour commencer.`;
      this.coachTone = 'neutral';
    }
  }

  private goalTitle(goal: SavingsGoal): string {
    return goal.description || `Objectif #${goal.id}`;
  }

  private monthTransactions(monthOffset: number): SavingsTransaction[] {
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    return this.historyTransactions.filter((transaction) => {
      if (!transaction.transactionDate) {
        return false;
      }
      const date = new Date(transaction.transactionDate);
      return date.getMonth() === targetMonth.getMonth() && date.getFullYear() === targetMonth.getFullYear();
    });
  }

  private inferCoachTone(verdict: string | undefined): 'neutral' | 'good' | 'risk' {
    const value = String(verdict ?? '').toLowerCase();
    if (value.includes('track') || value.includes('ahead') || value.includes('exact')) {
      return 'good';
    }
    if (value.includes('risk') || value.includes('insufficient') || value.includes('late') || value.includes('no data')) {
      return 'risk';
    }
    return 'neutral';
  }

  private normalizeAdvice(raw: string): string {
    const value = String(raw ?? '').trim();
    if (!value) {
      return 'Je n ai pas de recommandation supplementaire pour le moment.';
    }

    let text: string;
    try {
      const parsed = JSON.parse(value) as { error?: string; advice?: string; message?: string };
      text = parsed.advice || parsed.message || parsed.error || value;
    } catch {
      text = value;
    }

    if (this.looksLikeAgentServiceDownPayload(text)) {
      return this.coachAgentUnavailableMessage();
    }
    return text;
  }

  /** Message affiche quand l API Java tourne mais que l agent Python (5002) / Ollama ne repond pas. */
  private coachAgentUnavailableMessage(): string {
    return [
      'Le moteur de conseil (agent IA) ne repond pas pour le moment.',
      '',
      'En developpement local, verifiez dans cet ordre :',
      '1) API Java (Spring Boot) demarree',
      '2) Ollama :  ollama serve   puis modele (ex.  ollama pull llama3.2:3b  )',
      '3) Agent sur le port 5002 : dans le dossier Financia, lancer  python agentic_savings_agent.py',
    ].join('\n');
  }

  private looksLikeAgentServiceDownPayload(text: string): boolean {
    const t = text.toLowerCase();
    return t.includes('agentic ai service') || (t.includes('unavailable') && t.includes('agentic'));
  }

  private isLikelyClientNetworkError(err: Error): boolean {
    const msg = (err?.message ?? '').toLowerCase();
    return (
      msg.includes('0 unknown') ||
      msg.includes('failed to fetch') ||
      msg.includes('network error') ||
      msg.includes('net::err_') ||
      msg.includes('econnrefused') ||
      msg.includes('connection refused') ||
      msg.includes('load failed')
    );
  }

  private formatAgentAdviceCoachError(err: Error): string {
    if (this.isLikelyClientNetworkError(err)) {
      return this.coachAgentUnavailableMessage();
    }
    return `Desole, je ne peux pas repondre : ${err.message}`;
  }

  private formatForecastCoachError(err: Error): string {
    if (this.isLikelyClientNetworkError(err)) {
      return [
        'Impossible de joindre le serveur Financia (API Java).',
        'Demarrez Spring Boot, puis rechargez la page. La projection ne necessite pas l agent sur le port 5002.',
      ].join('\n');
    }
    return `Impossible de calculer la projection : ${err.message}`;
  }

  /** Utilisé par le template (parcours d’onboarding) et les ancres URL. */
  scrollToAnchor(id: string): void {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * Mini-nav épargne : met à jour l’URL (`/espace-client#fragment`) et fait défiler vers la bonne section.
   * Les liens HTML `href="#..."` sont peu fiables ici (SPA + routeur).
   */
  navigateEpargneSection(fragment: string): void {
    this.scrollToAnchor(fragment);
    void this.router.navigate([], {
      relativeTo: this.route,
      fragment,
      replaceUrl: true,
    });
  }

  /** Parcours guidé épargne : afficher tant que les 3 étapes ne sont pas cochées. */
  showEpargneOnboarding(): boolean {
    if (this.initialLoading) return false;
    return !(this.onboardingStep1Done() && this.onboardingStep2Done() && this.onboardingStep3Done());
  }

  onboardingStep1Done(): boolean {
    return this.savingsAccounts.length > 0;
  }

  onboardingStep2Done(): boolean {
    return this.historyTransactions.some((t) => String(t.type ?? '').toUpperCase() === 'DEPOSIT');
  }

  onboardingStep3Done(): boolean {
    return this.savingsGoals.length > 0;
  }

  exportTransactionsCsv(): void {
    const rows: string[][] = [
      ['Date', 'Type', 'Montant (TND)', 'Description', 'Reference', 'Statut'],
      ...this.filteredHistoryTransactions.map((t) => [
        t.transactionDate ?? '',
        t.type ?? '',
        String(t.amount ?? ''),
        t.description ?? '',
        t.reference ?? '',
        t.status ?? '',
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => this.escapeCsvCell(c)).join(',')).join('\n');
    const stamp = new Date().toISOString().slice(0, 10);
    this.downloadTextFile(`financia-transactions-${stamp}.csv`, '\ufeff' + csv, 'text/csv;charset=utf-8');
    this.toast.show('Export CSV des mouvements téléchargé.', 'success', 3200);
  }

  exportGoalsCsv(): void {
    const rows: string[][] = [
      ['Id', 'Description', 'Montant cible', 'Montant actuel', 'Echeance', 'Statut', 'Compte'],
      ...this.savingsGoals.map((g) => [
        String(g.id),
        g.description ?? '',
        String(g.targetAmount ?? ''),
        String(g.currentAmount ?? ''),
        g.deadline ?? '',
        g.status ?? '',
        g.savingsAccount?.accountNumber ?? String(g.savingsAccount?.id ?? ''),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => this.escapeCsvCell(c)).join(',')).join('\n');
    const stamp = new Date().toISOString().slice(0, 10);
    this.downloadTextFile(`financia-objectifs-${stamp}.csv`, '\ufeff' + csv, 'text/csv;charset=utf-8');
    this.toast.show('Export CSV des objectifs téléchargé.', 'success', 3200);
  }

  /** Rapport imprimable (PDF via boîte de dialogue du navigateur). */
  openEpargnePrintReport(): void {
    const u = this.auth.user();
    const name = [u?.firstName, u?.lastName].filter(Boolean).join(' ') || 'Client';
    const stamp = new Date().toLocaleString('fr-FR');
    const txRows = this.filteredHistoryTransactions
      .map(
        (t) =>
          `<tr><td>${this.escapeHtml(t.transactionDate ?? '')}</td><td>${this.escapeHtml(t.type ?? '')}</td><td>${this.escapeHtml(String(t.amount ?? ''))}</td><td>${this.escapeHtml(t.description ?? '')}</td></tr>`
      )
      .join('');
    const goalRows = this.savingsGoals
      .map(
        (g) =>
          `<tr><td>${g.id}</td><td>${this.escapeHtml(g.description ?? '')}</td><td>${g.targetAmount}</td><td>${g.currentAmount}</td><td>${this.escapeHtml(g.deadline)}</td><td>${this.escapeHtml(g.status)}</td></tr>`
      )
      .join('');
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/><title>Financia — Rapport épargne</title>
<style>
body{font-family:system-ui,-apple-system,sans-serif;padding:28px;color:#0f172a;max-width:900px;margin:0 auto}
h1{font-size:1.35rem;margin:0 0 8px}
p.meta{color:#64748b;font-size:0.9rem;margin:0 0 24px}
h2{font-size:1.05rem;margin:24px 0 12px}
table{border-collapse:collapse;width:100%;font-size:0.88rem}
th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left}
th{background:#f8fafc;font-weight:700}
.actions{margin-bottom:20px}
button{padding:10px 18px;border-radius:10px;border:none;background:#4338ca;color:#fff;font-weight:700;cursor:pointer}
@media print{button{display:none}}
</style></head><body>
<p class="meta">Généré le ${this.escapeHtml(stamp)} — ${this.escapeHtml(name)}</p>
<h1>Rapport épargne Financia</h1>
<div class="actions"><button type="button" onclick="window.print()">Imprimer ou enregistrer en PDF</button></div>
<h2>Objectifs</h2>
<table><thead><tr><th>Id</th><th>Description</th><th>Cible</th><th>Actuel</th><th>Échéance</th><th>Statut</th></tr></thead><tbody>${goalRows || '<tr><td colspan="6">Aucun objectif</td></tr>'}</tbody></table>
<h2>Mouvements (filtre courant)</h2>
<table><thead><tr><th>Date</th><th>Type</th><th>Montant</th><th>Description</th></tr></thead><tbody>${txRows || '<tr><td colspan="4">Aucun mouvement</td></tr>'}</tbody></table>
</body></html>`;
    const w = window.open('', '_blank');
    if (!w) {
      this.toast.show('Autorisez les pop-ups pour imprimer le rapport.', 'warn');
      return;
    }
    w.document.write(html);
    w.document.close();
    this.toast.show('Rapport ouvert : utilisez Imprimer pour PDF.', 'info', 5000);
  }

  private escapeCsvCell(v: unknown): string {
    const s = String(v ?? '');
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  private escapeHtml(s: string): string {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private downloadTextFile(filename: string, content: string, mime: string): void {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Vue « santé financière » : épargne + crédit + alertes (réutilise la cloche briefing). */
  financialSnapshot(): {
    savingsLine: string;
    creditLine: string;
    alertLevel: 'ok' | 'warn' | 'danger';
    alertText: string;
  } {
    const savingsLine =
      this.totalSavingsBalance.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + ' TND';

    let creditLine = 'Pas de crédit actif avec échéances.';
    if (this.blockingCredit) {
      if (this.remboursements.length && this.nextPayableRemboursement) {
        creditLine =
          this.primaryDueCaption +
          ' · ' +
          this.amountDueNow.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) +
          ' TND';
      } else {
        creditLine = 'Crédit actif — consultez la section remboursements.';
      }
    }

    let alertLevel: 'ok' | 'warn' | 'danger' = 'ok';
    let alertText = 'Situation sous contrôle.';

    if (this.overduePayable.length > 0) {
      alertLevel = 'danger';
      alertText =
        this.overduePayable.length +
        ' échéance(s) en retard — priorité au remboursement.';
    } else {
      const items = this.briefing.items();
      const hasDanger = items.some((i) => i.severity === 'danger');
      if (hasDanger) {
        alertLevel = 'danger';
        alertText = 'Point critique : objectif ou échéance — voir notifications ou épargne.';
      } else if (items.length > 0) {
        alertLevel = 'warn';
        alertText = items.length + ' rappel(s) dans le centre de notifications.';
      }
    }

    return { savingsLine, creditLine, alertLevel, alertText };
  }

  whatIfDisplayGoals(): SavingsGoal[] {
    return this.savingsGoals.filter((g) => String(g.status ?? '').toUpperCase() === 'IN_PROGRESS');
  }

  whatIfSelectedGoal(): SavingsGoal | null {
    const list = this.whatIfDisplayGoals();
    if (!list.length) return null;
    if (this.whatIfGoalId != null) {
      return list.find((g) => g.id === this.whatIfGoalId) ?? list[0];
    }
    return list[0];
  }

  onWhatIfGoalChange(ev: Event): void {
    const v = (ev.target as HTMLSelectElement).value;
    this.whatIfGoalId = v ? Number(v) : null;
  }

  /**
   * Projection linéaire simple (indicatif). La prévision ML reste disponible via Forecast.
   */
  whatIfInsight(): {
    remaining: number;
    monthsNeeded: number;
    estimatedLabel: string;
    requiredMonthlyToDeadline: number;
    meetsDeadline: boolean;
    deadlineLabel: string;
  } | null {
    const g = this.whatIfSelectedGoal();
    if (!g) return null;

    const remaining = Math.max(0, Number(g.targetAmount) - Number(g.currentAmount ?? 0));
    const m = this.whatIfMonthly;
    const dl = this.parseDateOnly(g.deadline);
    const deadlineLabel = g.deadline ?? '';

    if (remaining <= 0) {
      return {
        remaining: 0,
        monthsNeeded: 0,
        estimatedLabel: 'Objectif déjà atteint',
        requiredMonthlyToDeadline: 0,
        meetsDeadline: true,
        deadlineLabel,
      };
    }

    const monthsNeeded = m > 0 ? Math.ceil(remaining / m) : 0;
    const est = m > 0 ? this.addMonths(new Date(), monthsNeeded) : new Date();

    const today = new Date();
    const monthsToDeadline = dl ? Math.max(1, this.wholeMonthsBetween(today, dl)) : 12;
    const requiredMonthlyToDeadline = remaining / monthsToDeadline;

    let meetsDeadline = true;
    if (dl && m > 0) {
      meetsDeadline = est.getTime() <= dl.getTime();
    } else if (m <= 0) {
      meetsDeadline = false;
    }

    const estimatedLabel = m > 0 ? est.toLocaleDateString('fr-FR') : 'Indiquez un versement mensuel';

    return {
      remaining,
      monthsNeeded,
      estimatedLabel,
      requiredMonthlyToDeadline,
      meetsDeadline,
      deadlineLabel,
    };
  }

  private parseDateOnly(s: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s).trim());
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 59, 999);
  }

  private addMonths(d: Date, n: number): Date {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setMonth(x.getMonth() + n);
    return x;
  }

  private wholeMonthsBetween(from: Date, to: Date): number {
    let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    if (to.getDate() < from.getDate()) {
      months -= 1;
    }
    return Math.max(0, months);
  }

  private syncBriefing(): void {
    if (!this.auth.user()) return;
    this.briefing.sync({
      remboursements: this.remboursements,
      savingsGoals: this.savingsGoals,
      savingsAccounts: this.savingsAccounts,
      historyTransactions: this.historyTransactions,
    });
  }
}
