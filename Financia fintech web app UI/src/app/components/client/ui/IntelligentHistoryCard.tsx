import { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  label: string;
}

interface IntelligentHistoryCardProps {
  transactions: Transaction[];
  monthSummary: {
    totalDeposits: number;
    totalWithdrawals: number;
    netChange: number;
    bestMonth: boolean;
  };
}

export function IntelligentHistoryCard({ transactions, monthSummary }: IntelligentHistoryCardProps) {
  const [filter, setFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL'>('ALL');

  const filteredTransactions = filter === 'ALL'
    ? transactions
    : transactions.filter(t => t.type === filter);

  return (
    <div className="bg-white rounded-[20px] border border-[rgba(40,60,90,0.12)] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#0B1220]">Historique intelligent</h3>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#56627A]" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm bg-transparent border-none text-[#0B1220] font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tout</option>
            <option value="DEPOSIT">Dépôts</option>
            <option value="WITHDRAWAL">Retraits</option>
          </select>
        </div>
      </div>

      {monthSummary.bestMonth && (
        <div className="mb-6 p-4 rounded-[12px] bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-emerald-900">Meilleur mois depuis 3 mois !</span>
          </div>
          <p className="text-sm text-emerald-700">
            Vous avez épargné {monthSummary.totalDeposits.toLocaleString()} € ce mois-ci
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-[12px] bg-[#F6F8FC]">
        <div>
          <p className="text-xs text-[#56627A] mb-1">Dépôts</p>
          <p className="text-lg font-semibold text-emerald-600 tabular-nums">
            +{monthSummary.totalDeposits.toLocaleString()} €
          </p>
        </div>
        <div>
          <p className="text-xs text-[#56627A] mb-1">Retraits</p>
          <p className="text-lg font-semibold text-red-600 tabular-nums">
            -{monthSummary.totalWithdrawals.toLocaleString()} €
          </p>
        </div>
        <div>
          <p className="text-xs text-[#56627A] mb-1">Variation nette</p>
          <p className={`text-lg font-semibold tabular-nums ${monthSummary.netChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {monthSummary.netChange >= 0 ? '+' : ''}{monthSummary.netChange.toLocaleString()} €
          </p>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 rounded-[12px] hover:bg-[#F6F8FC] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${
                transaction.type === 'DEPOSIT'
                  ? 'bg-emerald-100'
                  : 'bg-red-100'
              }`}>
                {transaction.type === 'DEPOSIT' ? (
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[#0B1220]">{transaction.label}</p>
                <div className="flex items-center gap-2 text-xs text-[#56627A]">
                  <Calendar className="w-3 h-3" />
                  {transaction.date}
                </div>
              </div>
            </div>
            <span className={`text-sm font-semibold tabular-nums ${
              transaction.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {transaction.type === 'DEPOSIT' ? '+' : '-'}{transaction.amount.toLocaleString()} €
            </span>
          </div>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#94A3B8]">Aucune transaction pour ce filtre</p>
        </div>
      )}
    </div>
  );
}
