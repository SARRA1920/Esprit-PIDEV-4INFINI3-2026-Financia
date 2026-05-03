import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { SavingsService } from '../core/savings.service';
import {
  SavingsAccount,
  SavingsAccountStatus,
  SavingsAccountType,
  SavingsGoal,
  SavingsGoalStatus,
  SavingsTransaction,
  SavingsTransactionStatus,
  SavingsTransactionType,
} from '../models/savings.model';

@Component({
  selector: 'app-savings-crud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './savings-crud.component.html',
  styleUrl: './savings-crud.component.scss',
})
export class SavingsCrudComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly savings = inject(SavingsService);
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly token = this.auth.token;

  readonly accounts = signal<SavingsAccount[]>([]);
  readonly goals = signal<SavingsGoal[]>([]);
  readonly transactions = signal<SavingsTransaction[]>([]);
  readonly flaggedTransactions = signal<SavingsTransaction[]>([]);
  readonly systemStats = signal<Record<string, unknown> | null>(null);
  readonly selectedAccountStats = signal<Record<string, unknown> | null>(null);
  readonly selectedReport = signal('');

  readonly accountError = signal('');
  readonly goalError = signal('');
  readonly transactionError = signal('');
  readonly panelMessage = signal('');

  readonly accountsLoading = signal(true);
  readonly goalsLoading = signal(true);
  readonly transactionsLoading = signal(true);

  readonly selectedAccountId = signal<number | null>(null);
  readonly selectedGoalId = signal<number | null>(null);
  readonly selectedTransactionId = signal<number | null>(null);

  readonly accountCreateForm = this.fb.nonNullable.group({
    type: ['CLASSIC' as SavingsAccountType, Validators.required],
    balance: [0],
  });

  readonly accountEditForm = this.fb.nonNullable.group({
    type: ['CLASSIC' as SavingsAccountType, Validators.required],
  });

  readonly goalCreateForm = this.fb.nonNullable.group({
    savingsAccountId: [0, [Validators.required, Validators.min(1)]],
    targetAmount: [0, [Validators.required, Validators.min(0.01)]],
    currentAmount: [0],
    deadline: [this.todayIso(), Validators.required],
    description: [''],
  });

  readonly goalEditForm = this.fb.nonNullable.group({
    currentAmount: [0, [Validators.required, Validators.min(0)]],
  });

  readonly transactionCreateForm = this.fb.nonNullable.group({
    savingsAccountId: [0, [Validators.required, Validators.min(1)]],
    type: ['DEPOSIT' as SavingsTransactionType, Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    description: [''],
    status: ['PENDING' as SavingsTransactionStatus, Validators.required],
  });

  readonly transactionEditForm = this.fb.nonNullable.group({
    status: ['SUCCESS' as SavingsTransactionStatus, Validators.required],
  });

  ngOnInit(): void {
    this.reloadAll();
  }

  reloadAll(): void {
    this.loadAccounts();
    this.loadGoals();
    this.loadTransactions();
    this.loadSystemStats();
  }

  private todayIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private resetPanelMessage(): void {
    this.panelMessage.set('');
  }

  loadAccounts(): void {
    this.accountsLoading.set(true);
    this.accountError.set('');
    this.savings.listAccounts().pipe(finalize(() => this.accountsLoading.set(false))).subscribe({
      next: (list) => this.accounts.set(list ?? []),
      error: (err: Error) => this.accountError.set(err.message),
    });
  }

  loadGoals(): void {
    this.goalsLoading.set(true);
    this.goalError.set('');
    this.savings.listGoals().pipe(finalize(() => this.goalsLoading.set(false))).subscribe({
      next: (list) => this.goals.set(list ?? []),
      error: (err: Error) => this.goalError.set(err.message),
    });
  }

  loadTransactions(): void {
    this.transactionsLoading.set(true);
    this.transactionError.set('');
    this.savings.listTransactions().pipe(finalize(() => this.transactionsLoading.set(false))).subscribe({
      next: (list) => this.transactions.set(list ?? []),
      error: (err: Error) => this.transactionError.set(err.message),
    });
    this.savings.listFlaggedTransactions().subscribe({
      next: (list) => this.flaggedTransactions.set(list ?? []),
      error: () => this.flaggedTransactions.set([]),
    });
  }

  private loadSystemStats(): void {
    this.savings.getSystemStatistics().subscribe({
      next: (stats) => this.systemStats.set(stats),
      error: () => this.systemStats.set(null),
    });
  }

  selectAccount(account: SavingsAccount): void {
    this.selectedAccountId.set(account.id);
    this.accountEditForm.patchValue({ type: account.type });
    this.selectedAccountStats.set(null);
    this.selectedReport.set('');
  }

  selectGoal(goal: SavingsGoal): void {
    this.selectedGoalId.set(goal.id);
    this.goalEditForm.patchValue({ currentAmount: goal.currentAmount });
  }

  selectTransaction(transaction: SavingsTransaction): void {
    this.selectedTransactionId.set(transaction.id);
    this.transactionEditForm.patchValue({ status: transaction.status });
  }

  createAccount(): void {
    if (this.accountCreateForm.invalid) {
      this.accountCreateForm.markAllAsTouched();
      return;
    }

    const value = this.accountCreateForm.getRawValue();
    this.resetPanelMessage();
    this.savings.createAccount({
      type: value.type,
      balance: Number(value.balance ?? 0),
    }).subscribe({
      next: () => {
        this.panelMessage.set('Account created.');
        this.accountCreateForm.reset({ type: 'CLASSIC', balance: 0 });
        this.loadAccounts();
        this.loadSystemStats();
      },
      error: (err: Error) => this.accountError.set(err.message),
    });
  }

  updateAccount(): void {
    const id = this.selectedAccountId();
    if (!id) return;

    if (this.accountEditForm.invalid) {
      this.accountEditForm.markAllAsTouched();
      return;
    }

    this.savings.updateAccount(id, { type: this.accountEditForm.getRawValue().type }).subscribe({
      next: () => {
        this.panelMessage.set('Account updated.');
        this.loadAccounts();
      },
      error: (err: Error) => this.accountError.set(err.message),
    });
  }

  deleteAccount(id: number): void {
    if (!confirm(`Close account #${id}?`)) return;
    this.savings.deleteAccount(id).subscribe({
      next: () => {
        if (this.selectedAccountId() === id) {
          this.selectedAccountId.set(null);
        }
        this.panelMessage.set('Account closed.');
        this.loadAccounts();
        this.loadSystemStats();
      },
      error: (err: Error) => this.accountError.set(err.message),
    });
  }

  loadAccountStats(id: number): void {
    this.savings.getAccountStatistics(id).subscribe({
      next: (stats) => this.selectedAccountStats.set(stats),
      error: (err: Error) => this.accountError.set(err.message),
    });
    this.savings.generateReport(id).subscribe({
      next: (report) => this.selectedReport.set(report),
      error: () => this.selectedReport.set(''),
    });
  }

  createGoal(): void {
    if (this.goalCreateForm.invalid) {
      this.goalCreateForm.markAllAsTouched();
      return;
    }
    const v = this.goalCreateForm.getRawValue();
    this.savings.createGoal({
      targetAmount: Number(v.targetAmount),
      currentAmount: Number(v.currentAmount ?? 0),
      deadline: v.deadline,
      description: v.description || undefined,
      savingsAccount: { id: Number(v.savingsAccountId) },
    }).subscribe({
      next: () => {
        this.panelMessage.set('Goal created.');
        this.goalCreateForm.reset({
          savingsAccountId: 0,
          targetAmount: 0,
          currentAmount: 0,
          deadline: this.todayIso(),
          description: '',
        });
        this.loadGoals();
      },
      error: (err: Error) => this.goalError.set(err.message),
    });
  }

  updateGoal(): void {
    const id = this.selectedGoalId();
    if (!id) return;
    if (this.goalEditForm.invalid) {
      this.goalEditForm.markAllAsTouched();
      return;
    }
    const currentAmount = Number(this.goalEditForm.getRawValue().currentAmount);
    this.savings.updateGoal(id, { currentAmount }).subscribe({
      next: () => {
        this.panelMessage.set('Goal updated.');
        this.loadGoals();
      },
      error: (err: Error) => this.goalError.set(err.message),
    });
  }

  deleteGoal(id: number): void {
    if (!confirm(`Delete goal #${id}?`)) return;
    this.savings.deleteGoal(id).subscribe({
      next: () => {
        if (this.selectedGoalId() === id) {
          this.selectedGoalId.set(null);
        }
        this.panelMessage.set('Goal deleted.');
        this.loadGoals();
      },
      error: (err: Error) => this.goalError.set(err.message),
    });
  }

  forecastGoal(id: number): void {
    this.savings.forecastGoal(id).subscribe({
      next: (result) => this.selectedReport.set(JSON.stringify(result, null, 2)),
      error: (err: Error) => this.goalError.set(err.message),
    });
  }

  adviceGoal(id: number): void {
    this.savings.getAgentAdvice(id).subscribe({
      next: (result) => this.selectedReport.set(result),
      error: (err: Error) => this.goalError.set(err.message),
    });
  }

  createTransaction(): void {
    if (this.transactionCreateForm.invalid) {
      this.transactionCreateForm.markAllAsTouched();
      return;
    }
    const v = this.transactionCreateForm.getRawValue();
    this.savings.createTransaction({
      type: v.type,
      amount: Number(v.amount),
      description: v.description || undefined,
      status: v.status,
      savingsAccount: { id: Number(v.savingsAccountId) },
    }).subscribe({
      next: () => {
        this.panelMessage.set('Transaction created.');
        this.transactionCreateForm.reset({
          savingsAccountId: 0,
          type: 'DEPOSIT',
          amount: 0,
          description: '',
          status: 'PENDING',
        });
        this.loadTransactions();
      },
      error: (err: Error) => this.transactionError.set(err.message),
    });
  }

  updateTransaction(): void {
    const id = this.selectedTransactionId();
    if (!id) return;
    if (this.transactionEditForm.invalid) {
      this.transactionEditForm.markAllAsTouched();
      return;
    }
    this.savings.updateTransaction(id, { status: this.transactionEditForm.getRawValue().status }).subscribe({
      next: () => {
        this.panelMessage.set('Transaction updated.');
        this.loadTransactions();
      },
      error: (err: Error) => this.transactionError.set(err.message),
    });
  }

  deleteTransaction(id: number): void {
    if (!confirm(`Delete transaction #${id}?`)) return;
    this.savings.deleteTransaction(id).subscribe({
      next: () => {
        if (this.selectedTransactionId() === id) {
          this.selectedTransactionId.set(null);
        }
        this.panelMessage.set('Transaction deleted.');
        this.loadTransactions();
      },
      error: (err: Error) => this.transactionError.set(err.message),
    });
  }

  formatStatus(value: string | undefined | null): string {
    return value ? value.replace(/_/g, ' ') : 'N/A';
  }

  asCurrency(value: number | undefined | null): string {
    return `${Number(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TND`;
  }

  accountTypes(): SavingsAccountType[] {
    return ['CLASSIC', 'LOCKED', 'GOAL_BASED'];
  }

  accountStatuses(): SavingsAccountStatus[] {
    return ['ACTIVE', 'SUSPENDED', 'CLOSED'];
  }

  goalStatuses(): SavingsGoalStatus[] {
    return ['IN_PROGRESS', 'COMPLETED', 'FAILED'];
  }

  transactionTypes(): SavingsTransactionType[] {
    return ['DEPOSIT', 'WITHDRAWAL'];
  }

  transactionStatuses(): SavingsTransactionStatus[] {
    return ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'];
  }
}