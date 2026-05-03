import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SavingsService } from '../../../core/savings.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  LucideAngularModule, Filter, Download, Search, History, Plus, Minus, 
  MoreVertical, Ban, RotateCcw, XCircle, TrendingUp, Target
} from 'lucide-angular';

import { SavingsAccount, SavingsGoal, SavingsTransaction } from '../../../models/savings.model';

type FilterType = 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
type TabType = 'accounts' | 'goals';
type OperationType = 'deposit' | 'withdraw' | null;

@Component({
  selector: 'app-admin-savings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-savings.component.html',
  styleUrl: './admin-savings.component.scss'
})
export class AdminSavingsComponent implements OnInit {
  private readonly savingsService = inject(SavingsService);

  readonly FilterIcon = Filter;
  readonly DownloadIcon = Download;
  readonly SearchIcon = Search;
  readonly HistoryIcon = History;
  readonly PlusIcon = Plus;
  readonly MinusIcon = Minus;
  readonly MoreVerticalIcon = MoreVertical;
  readonly BanIcon = Ban;
  readonly RotateCcwIcon = RotateCcw;
  readonly XCircleIcon = XCircle;
  readonly TrendingUpIcon = TrendingUp;
  readonly TargetIcon = Target;

  activeFilter = signal<FilterType>('ALL');
  activeTab = signal<TabType>('accounts');
  searchQuery = signal('');

  showTransactionModal = signal(false);
  showOperationModal = signal(false);
  selectedAccount = signal<SavingsAccount | null>(null);
  operationType = signal<OperationType>(null);
  operationAmount = signal('');
  operationDescription = signal('');

  savingsAccounts: SavingsAccount[] = [];
  savingsGoals: SavingsGoal[] = [];
  mockTransactions: SavingsTransaction[] = [];

  filters: { value: FilterType; label: string }[] = [
    { value: 'ALL', label: 'Tous' },
    { value: 'ACTIVE', label: 'Actifs' },
    { value: 'SUSPENDED', label: 'Suspendus' },
    { value: 'CLOSED', label: 'Clôturés' },
  ];

  ngOnInit() {
    this.loadAccounts();
    this.loadGoals();
  }

  loadAccounts() {
    this.savingsService.listAccounts().subscribe({
      next: (accounts) => this.savingsAccounts = accounts,
      error: (err) => console.error('Erreur', err)
    });
  }

  loadGoals() {
    this.savingsService.listGoals().subscribe({
      next: (goals) => this.savingsGoals = goals,
      error: (err) => console.error('Erreur', err)
    });
  }

  get filteredAccounts(): SavingsAccount[] {
    const filter = this.activeFilter();
    let accs = filter === 'ALL' 
      ? this.savingsAccounts 
      : this.savingsAccounts.filter(a => a.status === filter);
      
    if (this.searchQuery().trim()) {
      const q = this.searchQuery().toLowerCase();
      accs = accs.filter(a => 
        (a.id + '').toLowerCase().includes(q) || 
        a.user?.firstName?.toLowerCase().includes(q) ||
        a.user?.lastName?.toLowerCase().includes(q)
      );
    }
    return accs;
  }

  get totalBalance(): number {
    return this.savingsAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  }

  get activeAccountsCount(): number {
    return this.savingsAccounts.filter(a => a.status === 'ACTIVE').length;
  }

  get activeGoalsCount(): number {
    return this.savingsGoals.filter(g => g.status === 'IN_PROGRESS').length;
  }

  get avgInterestRate(): string {
    if (this.savingsAccounts.length === 0) return '0.00';
    return (this.savingsAccounts.reduce((sum, acc) => sum + (acc.interestRate || 0), 0) / this.savingsAccounts.length).toFixed(2);
  }

  handleOperation(account: SavingsAccount, type: 'deposit' | 'withdraw'): void {
    if(account.status !== 'ACTIVE') return;
    this.selectedAccount.set(account);
    this.operationType.set(type);
    this.operationAmount.set('');
    this.operationDescription.set('');
    this.showOperationModal.set(true);
  }

  handleViewTransactions(account: SavingsAccount): void {
    this.selectedAccount.set(account);
    this.savingsService.listTransactionsByAccount(account.id).subscribe({
      next: (txs) => {
        this.mockTransactions = txs;
        this.showTransactionModal.set(true);
      },
      error: (err) => console.error(err)
    });
  }

  handleSuspendAccount(accountId: number): void {
    if(confirm('Voulez-vous suspendre ce compte ?')) {
      this.savingsService.suspendAccount(accountId).subscribe({
        next: () => {
          this.loadAccounts();
          alert('Compte suspendu.');
        },
        error: (err) => alert(err.message)
      });
    }
  }

  handleReactivateAccount(accountId: number): void {
    if(confirm('Voulez-vous réactiver ce compte ?')) {
      this.savingsService.reactivateAccount(accountId).subscribe({
        next: () => {
          this.loadAccounts();
          alert('Compte réactivé.');
        },
        error: (err) => alert(err.message)
      });
    }
  }

  handleCloseAccount(accountId: number): void {
    if (confirm('Êtes-vous sûr de vouloir clôturer ce compte ?')) {
      this.savingsService.deleteAccount(accountId).subscribe({
        next: () => {
          this.loadAccounts();
          alert('Compte clôturé.');
        },
        error: (err) => alert(err.message)
      });
    }
  }

  submitOperation(): void {
    const account = this.selectedAccount();
    const amountStr = this.operationAmount();
    if (!account || !amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert('Montant invalide');
      return;
    }

    const payload = { amount, description: this.operationDescription() };
    
    const request = this.operationType() === 'deposit'
      ? this.savingsService.deposit(account.id, payload)
      : this.savingsService.withdraw(account.id, payload);

    request.subscribe({
      next: () => {
        this.showOperationModal.set(false);
        this.loadAccounts();
        alert('Opération confirmée !');
      },
      error: (err) => alert(err.message)
    });
  }

  exportPdf(): void {
    const doc = new jsPDF();
    doc.text("Rapport des Comptes d\'Épargne FINANCIA", 14, 15);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = this.filteredAccounts.map((acc: any) => [
      String(acc.id),
      (acc.user?.firstName || 'N/A') + ' ' + (acc.user?.lastName || ''),
      acc.type || '',
      (acc.balance || 0).toLocaleString() + ' TND',
      (acc.interestRate || '0') + '%',
      acc.status || '',
      acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : '-'
    ]);
    
    autoTable(doc, {
      startY: 25,
      head: [['ID', 'Client', 'Type', 'Solde', 'Taux', 'Statut', 'Créé le']],
      body: body,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] }
    });
    
    doc.save('Financia_Comptes_Epargne.pdf');
  }
}
