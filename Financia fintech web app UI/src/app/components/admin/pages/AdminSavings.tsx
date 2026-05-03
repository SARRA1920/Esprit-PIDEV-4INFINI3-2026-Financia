import { useState } from 'react';
import { KPICard } from '../ui/KPICard';
import { StatusBadge } from '../ui/StatusBadge';
import {
  PiggyBank,
  TrendingUp,
  Target,
  Users,
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Plus,
  Minus,
  Ban,
  RotateCcw,
  XCircle,
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  X
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Mock data - À remplacer par vos vraies APIs Spring Boot
const savingsEvolution = [
  { month: 'Jan', total: 145000 },
  { month: 'Fév', total: 158000 },
  { month: 'Mar', total: 172000 },
  { month: 'Avr', total: 189000 },
  { month: 'Mai', total: 204000 },
  { month: 'Juin', total: 223000 },
];

const savingsAccounts = [
  {
    id: 'SA-001',
    clientName: 'Sophie Martin',
    clientId: 'CL-2026-0123',
    accountType: 'LIVRET_A',
    balance: 12500,
    interestRate: 3.0,
    status: 'ACTIVE',
    createdDate: '2024-01-15',
    lastTransaction: '2024-04-20',
  },
  {
    id: 'SA-002',
    clientName: 'Marc Dubois',
    clientId: 'CL-2026-0124',
    accountType: 'COMPTE_TERME',
    balance: 25000,
    interestRate: 4.5,
    status: 'ACTIVE',
    createdDate: '2024-02-10',
    lastTransaction: '2024-04-18',
  },
  {
    id: 'SA-003',
    clientName: 'Claire Bernard',
    clientId: 'CL-2026-0125',
    accountType: 'PEL',
    balance: 8000,
    interestRate: 2.5,
    status: 'BLOCKED',
    createdDate: '2024-03-05',
    lastTransaction: '2024-04-10',
  },
  {
    id: 'SA-004',
    clientName: 'Jean Dupont',
    clientId: 'CL-2026-0126',
    accountType: 'LIVRET_A',
    balance: 5400,
    interestRate: 3.0,
    status: 'ACTIVE',
    createdDate: '2024-01-20',
    lastTransaction: '2024-04-22',
  },
];

const savingsGoals = [
  {
    id: 'SG-001',
    clientName: 'Sophie Martin',
    goalName: 'Voyage Japon',
    accountId: 'SA-001',
    target: 5000,
    current: 3500,
    deadline: '2026-09-01',
    status: 'ON_TRACK',
    aiStatus: 'STABLE',
  },
  {
    id: 'SG-002',
    clientName: 'Marc Dubois',
    goalName: 'Projet immobilier',
    accountId: 'SA-002',
    target: 20000,
    current: 8000,
    deadline: '2027-06-01',
    status: 'SLIGHT_DELAY',
    aiStatus: 'A_RISQUE',
  },
  {
    id: 'SG-003',
    clientName: 'Jean Dupont',
    goalName: 'Épargne urgence',
    accountId: 'SA-004',
    target: 10000,
    current: 5400,
    deadline: '2026-12-31',
    status: 'ON_TRACK',
    aiStatus: 'EN_AVANCE',
  },
];

const mockTransactions = [
  { id: 'TX-001', type: 'DEPOSIT', amount: 500, date: '2024-04-20 14:30', description: 'Dépôt virement' },
  { id: 'TX-002', type: 'WITHDRAWAL', amount: 200, date: '2024-04-15 09:15', description: 'Retrait ATM' },
  { id: 'TX-003', type: 'DEPOSIT', amount: 1500, date: '2024-04-10 16:45', description: 'Dépôt mensuel' },
  { id: 'TX-004', type: 'INTEREST', amount: 35.50, date: '2024-04-01 00:00', description: 'Intérêts trimestriels' },
];

type FilterType = 'ALL' | 'ACTIVE' | 'BLOCKED' | 'CLOSED';
type TabType = 'accounts' | 'goals';
type OperationType = 'deposit' | 'withdraw' | null;

export function AdminSavings() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [activeTab, setActiveTab] = useState<TabType>('accounts');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<typeof savingsAccounts[0] | null>(null);
  const [operationType, setOperationType] = useState<OperationType>(null);
  const [operationAmount, setOperationAmount] = useState('');
  const [operationDescription, setOperationDescription] = useState('');

  const filters: { value: FilterType; label: string }[] = [
    { value: 'ALL', label: 'Tous' },
    { value: 'ACTIVE', label: 'Actifs' },
    { value: 'BLOCKED', label: 'Bloqués' },
    { value: 'CLOSED', label: 'Clôturés' },
  ];

  const filteredAccounts = activeFilter === 'ALL'
    ? savingsAccounts
    : savingsAccounts.filter(a => a.status === activeFilter);

  const totalBalance = savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeAccountsCount = savingsAccounts.filter(a => a.status === 'ACTIVE').length;
  const activeGoalsCount = savingsGoals.length;
  const avgInterestRate = (savingsAccounts.reduce((sum, acc) => sum + acc.interestRate, 0) / savingsAccounts.length).toFixed(2);

  // Handlers
  const handleOperation = (account: typeof savingsAccounts[0], type: 'deposit' | 'withdraw') => {
    setSelectedAccount(account);
    setOperationType(type);
    setOperationAmount('');
    setOperationDescription('');
    setShowOperationModal(true);
  };

  const handleViewTransactions = (account: typeof savingsAccounts[0]) => {
    setSelectedAccount(account);
    setShowTransactionModal(true);
  };

  const handleSuspendAccount = async (accountId: string) => {
    // TODO: await fetch(`/f/api/savings/accounts/${accountId}/suspend`, { method: 'PUT' })
    console.log('Suspending account:', accountId);
  };

  const handleReactivateAccount = async (accountId: string) => {
    // TODO: await fetch(`/f/api/savings/accounts/${accountId}/reactivate`, { method: 'PUT' })
    console.log('Reactivating account:', accountId);
  };

  const handleCloseAccount = async (accountId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir clôturer ce compte ?')) {
      // TODO: await fetch(`/f/api/savings/accounts/${accountId}/close`, { method: 'PUT' })
      console.log('Closing account:', accountId);
    }
  };

  const submitOperation = async () => {
    if (!selectedAccount || !operationAmount) return;

    const amount = parseFloat(operationAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Montant invalide');
      return;
    }

    // TODO: Integrate with Spring Boot API
    // const endpoint = operationType === 'deposit'
    //   ? `/f/api/savings/accounts/${selectedAccount.id}/deposit`
    //   : `/f/api/savings/accounts/${selectedAccount.id}/withdraw`;
    // await fetch(endpoint, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ amount, description: operationDescription })
    // });

    console.log(`${operationType} of ${amount}€ on account ${selectedAccount.id}`);
    setShowOperationModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#F8FAFC] tracking-tight mb-1">Épargnes & Objectifs</h1>
          <p className="text-sm text-[#94A3B8]">Gestion des comptes d'épargne et objectifs clients</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-[#1E293B] border border-[#334155] text-[#F8FAFC] rounded-lg hover:border-[#10B981]/30 transition-colors text-sm font-medium">
            <Filter className="w-4 h-4 inline mr-2" />
            Filtres avancés
          </button>
          <button className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors flex items-center gap-2 text-sm font-medium">
            <Download className="w-4 h-4" />
            Exporter rapport
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Encours total épargne"
          value={`${(totalBalance / 1000).toFixed(0)}k €`}
          change={{ value: '+12.3%', trend: 'up' }}
          icon={PiggyBank}
          iconColor="#10B981"
        />
        <KPICard
          label="Comptes actifs"
          value={activeAccountsCount.toString()}
          change={{ value: '+3', trend: 'up' }}
          icon={Users}
          iconColor="#3B82F6"
        />
        <KPICard
          label="Objectifs en cours"
          value={activeGoalsCount.toString()}
          change={{ value: '+2', trend: 'up' }}
          icon={Target}
          iconColor="#EAB308"
        />
        <KPICard
          label="Taux moyen"
          value={`${avgInterestRate}%`}
          change={{ value: '+0.2%', trend: 'up' }}
          icon={TrendingUp}
          iconColor="#10B981"
        />
      </div>

      {/* Evolution Chart */}
      <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-1">Évolution de l'encours épargne</h3>
          <p className="text-sm text-[#94A3B8]">Montant total épargné des 6 derniers mois</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={savingsEvolution} key="savings-evolution-chart">
            <defs>
              <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" key="chart-grid" />
            <XAxis dataKey="month" stroke="#64748B" style={{ fontSize: 12 }} key="chart-xaxis" />
            <YAxis
              stroke="#64748B"
              style={{ fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              key="chart-yaxis"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#F8FAFC',
              }}
              formatter={(value: number) => [`${value.toLocaleString()} €`, 'Encours']}
              key="chart-tooltip"
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#colorSavings)"
              key="chart-area"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tabs */}
      <div className="bg-[#1E293B] rounded-xl border border-[#334155]">
        <div className="border-b border-[#334155]">
          <div className="flex items-center gap-4 px-6">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'accounts'
                  ? 'border-[#10B981] text-[#10B981]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Comptes d'épargne
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === 'goals'
                  ? 'border-[#10B981] text-[#10B981]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Objectifs clients
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                placeholder={activeTab === 'accounts' ? 'Rechercher un compte...' : 'Rechercher un objectif...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111827] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              />
            </div>
            {activeTab === 'accounts' && (
              <div className="flex items-center gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === filter.value
                        ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                        : 'bg-[#111827] text-[#94A3B8] border border-[#334155] hover:border-[#10B981]/30 hover:text-[#F8FAFC]'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Accounts Table */}
          {activeTab === 'accounts' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#111827] sticky top-0">
                  <tr>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">ID</th>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Client</th>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Solde</th>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Taux</th>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Statut</th>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Créé le</th>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Dernière opération</th>
                    <th className="text-right text-xs font-medium text-[#94A3B8] px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-[#273549] transition-colors">
                      <td className="px-6 py-4 text-sm text-[#F8FAFC] font-mono">{account.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-[#F8FAFC]">{account.clientName}</p>
                          <p className="text-xs text-[#94A3B8] font-mono">{account.clientId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#94A3B8]">{account.accountType}</td>
                      <td className="px-6 py-4 text-sm text-[#F8FAFC] font-mono tabular-nums">
                        {account.balance.toLocaleString()} €
                      </td>
                      <td className="px-6 py-4 text-sm text-[#10B981] font-mono tabular-nums">{account.interestRate}%</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={account.status as any} />
                      </td>
                      <td className="px-6 py-4 text-sm text-[#94A3B8] font-mono tabular-nums">{account.createdDate}</td>
                      <td className="px-6 py-4 text-sm text-[#94A3B8] font-mono tabular-nums">{account.lastTransaction}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewTransactions(account)}
                            className="p-1.5 rounded hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#10B981] transition-colors"
                            title="Historique transactions"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOperation(account, 'deposit')}
                            className="p-1.5 rounded hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#10B981] transition-colors"
                            title="Dépôt"
                            disabled={account.status !== 'ACTIVE'}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOperation(account, 'withdraw')}
                            className="p-1.5 rounded hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#EF4444] transition-colors"
                            title="Retrait"
                            disabled={account.status !== 'ACTIVE'}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="relative group">
                            <button className="p-1.5 rounded hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-[#1E293B] border border-[#334155] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="py-1">
                                {account.status === 'ACTIVE' && (
                                  <button
                                    onClick={() => handleSuspendAccount(account.id)}
                                    className="w-full px-4 py-2 text-left text-sm text-[#F8FAFC] hover:bg-[#273549] flex items-center gap-2"
                                  >
                                    <Ban className="w-4 h-4" />
                                    Suspendre
                                  </button>
                                )}
                                {account.status === 'BLOCKED' && (
                                  <button
                                    onClick={() => handleReactivateAccount(account.id)}
                                    className="w-full px-4 py-2 text-left text-sm text-[#F8FAFC] hover:bg-[#273549] flex items-center gap-2"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                    Réactiver
                                  </button>
                                )}
                                <button
                                  onClick={() => handleCloseAccount(account.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-[#EF4444] hover:bg-[#273549] flex items-center gap-2"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Clôturer
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Goals Table */}
          {activeTab === 'goals' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#111827] sticky top-0">
                  <tr>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">ID</th>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Client</th>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Objectif</th>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Progression</th>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Montant</th>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Deadline</th>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Statut ML</th>
                    <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">IA Verdict</th>
                    <th className="text-right text-xs font-medium text-[#94A3B8] px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {savingsGoals.map((goal) => {
                    const progress = (goal.current / goal.target) * 100;
                    return (
                      <tr key={goal.id} className="hover:bg-[#273549] transition-colors">
                        <td className="px-6 py-4 text-sm text-[#F8FAFC] font-mono">{goal.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-[#F8FAFC]">{goal.clientName}</td>
                        <td className="px-6 py-4 text-sm text-[#F8FAFC]">{goal.goalName}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="w-24 h-2 bg-[#111827] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-[#94A3B8] tabular-nums">{progress.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#F8FAFC] font-mono tabular-nums">
                          {goal.current.toLocaleString()} / {goal.target.toLocaleString()} €
                        </td>
                        <td className="px-6 py-4 text-sm text-[#94A3B8] font-mono tabular-nums">{goal.deadline}</td>
                        <td className="px-6 py-4">
                          {goal.status === 'ON_TRACK' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                              <CheckCircle className="w-3 h-3" />
                              Sur la voie
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                              <AlertCircle className="w-3 h-3" />
                              Retard
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                            goal.aiStatus === 'EN_AVANCE'
                              ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                              : goal.aiStatus === 'STABLE'
                              ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20'
                              : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                          }`}>
                            <Sparkles className="w-3 h-3" />
                            {goal.aiStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1.5 rounded hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors" title="Voir prévision IA">
                              <Sparkles className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Transaction History Modal */}
      {showTransactionModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-xl border border-[#334155] w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#334155]">
              <div>
                <h2 className="text-xl font-semibold text-[#F8FAFC]">Historique des transactions</h2>
                <p className="text-sm text-[#94A3B8] mt-1">
                  {selectedAccount.clientName} • {selectedAccount.id}
                </p>
              </div>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="p-2 rounded-lg hover:bg-[#273549] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="space-y-3">
                {mockTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-[#111827] rounded-lg border border-[#334155]"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tx.type === 'DEPOSIT'
                            ? 'bg-[#10B981]/10 text-[#10B981]'
                            : tx.type === 'WITHDRAWAL'
                            ? 'bg-[#EF4444]/10 text-[#EF4444]'
                            : 'bg-[#3B82F6]/10 text-[#3B82F6]'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' ? (
                          <ArrowUpCircle className="w-5 h-5" />
                        ) : tx.type === 'WITHDRAWAL' ? (
                          <ArrowDownCircle className="w-5 h-5" />
                        ) : (
                          <TrendingUp className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#F8FAFC]">{tx.description}</p>
                        <p className="text-xs text-[#94A3B8] font-mono mt-0.5">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-base font-semibold font-mono ${
                          tx.type === 'DEPOSIT' || tx.type === 'INTEREST'
                            ? 'text-[#10B981]'
                            : 'text-[#EF4444]'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' || tx.type === 'INTEREST' ? '+' : '-'}
                        {tx.amount.toLocaleString()} €
                      </p>
                      <p className="text-xs text-[#64748B] font-mono mt-0.5">{tx.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deposit/Withdraw Operation Modal */}
      {showOperationModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-xl border border-[#334155] w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[#334155]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    operationType === 'deposit'
                      ? 'bg-[#10B981]/10 text-[#10B981]'
                      : 'bg-[#EF4444]/10 text-[#EF4444]'
                  }`}
                >
                  {operationType === 'deposit' ? (
                    <Plus className="w-5 h-5" />
                  ) : (
                    <Minus className="w-5 h-5" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-[#F8FAFC]">
                  {operationType === 'deposit' ? 'Effectuer un dépôt' : 'Effectuer un retrait'}
                </h2>
              </div>
              <button
                onClick={() => setShowOperationModal(false)}
                className="p-2 rounded-lg hover:bg-[#273549] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-[#111827] rounded-lg border border-[#334155]">
                <p className="text-sm text-[#94A3B8]">Compte</p>
                <p className="text-base font-medium text-[#F8FAFC] mt-1">
                  {selectedAccount.clientName}
                </p>
                <p className="text-xs text-[#64748B] font-mono mt-0.5">{selectedAccount.id}</p>
                <p className="text-sm text-[#94A3B8] mt-2">Solde actuel</p>
                <p className="text-lg font-semibold text-[#10B981] font-mono mt-1">
                  {selectedAccount.balance.toLocaleString()} €
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F8FAFC] mb-2">
                  Montant (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={operationAmount}
                  onChange={(e) => setOperationAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#111827] border border-[#334155] rounded-lg px-4 py-2.5 text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent font-mono text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F8FAFC] mb-2">
                  Description (optionnel)
                </label>
                <input
                  type="text"
                  value={operationDescription}
                  onChange={(e) => setOperationDescription(e.target.value)}
                  placeholder="Ex: Dépôt mensuel, retrait ATM..."
                  className="w-full bg-[#111827] border border-[#334155] rounded-lg px-4 py-2.5 text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowOperationModal(false)}
                  className="flex-1 px-4 py-2.5 bg-[#111827] border border-[#334155] text-[#F8FAFC] rounded-lg hover:border-[#10B981]/30 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={submitOperation}
                  disabled={!operationAmount || parseFloat(operationAmount) <= 0}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    operationType === 'deposit'
                      ? 'bg-[#10B981] hover:bg-[#059669] text-white'
                      : 'bg-[#EF4444] hover:bg-[#DC2626] text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Confirmer {operationType === 'deposit' ? 'dépôt' : 'retrait'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
