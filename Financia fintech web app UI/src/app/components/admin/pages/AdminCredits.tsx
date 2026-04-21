import { useState } from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { Search, Filter, Download, MoreVertical, ChevronRight } from 'lucide-react';

const credits = [
  {
    id: 'CR-2026-0482',
    client: 'Sophie Martin',
    amount: 25000,
    rate: 3.5,
    duration: 60,
    status: 'ACTIVE',
    riskScore: 'A',
    remaining: 21500,
    created: '2024-01-15',
    approved: '2024-01-18',
  },
  {
    id: 'CR-2026-0481',
    client: 'Marc Dubois',
    amount: 50000,
    rate: 4.2,
    duration: 84,
    status: 'ACTIVE',
    riskScore: 'B+',
    remaining: 48200,
    created: '2024-01-12',
    approved: '2024-01-16',
  },
  {
    id: 'CR-2026-0480',
    client: 'Claire Bernard',
    amount: 15000,
    rate: 3.8,
    duration: 48,
    status: 'PENDING',
    riskScore: 'A-',
    remaining: 15000,
    created: '2024-01-20',
    approved: null,
  },
  {
    id: 'CR-2026-0479',
    client: 'Jean Dupont',
    amount: 35000,
    rate: 4.5,
    duration: 72,
    status: 'APPROVED',
    riskScore: 'B',
    remaining: 35000,
    created: '2024-01-18',
    approved: '2024-01-20',
  },
  {
    id: 'CR-2026-0478',
    client: 'Marie Laurent',
    amount: 8000,
    rate: 3.2,
    duration: 36,
    status: 'ACTIVE',
    riskScore: 'A+',
    remaining: 5200,
    created: '2023-12-05',
    approved: '2023-12-08',
  },
  {
    id: 'CR-2026-0477',
    client: 'Pierre Moreau',
    amount: 42000,
    rate: 4.8,
    duration: 96,
    status: 'ACTIVE',
    riskScore: 'B-',
    remaining: 40100,
    created: '2024-01-08',
    approved: '2024-01-12',
  },
  {
    id: 'CR-2026-0476',
    client: 'Anne Petit',
    amount: 12000,
    rate: 3.6,
    duration: 48,
    status: 'CLOSED',
    riskScore: 'A',
    remaining: 0,
    created: '2023-06-10',
    approved: '2023-06-12',
  },
];

const filters = ['Tous', 'PENDING', 'APPROVED', 'ACTIVE', 'CLOSED'];

export function AdminCredits() {
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const filteredCredits = activeFilter === 'Tous'
    ? credits
    : credits.filter(c => c.status === activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#F8FAFC] tracking-tight mb-1">Crédits & dossiers</h1>
          <p className="text-sm text-[#94A3B8]">Gestion du portefeuille crédit</p>
        </div>
        <button className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors flex items-center gap-2 text-sm font-medium">
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Rechercher par ID, client, montant..."
              className="w-full bg-[#111827] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-[#94A3B8]">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filtres:</span>
            </div>
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                    : 'bg-[#111827] text-[#94A3B8] border border-[#334155] hover:border-[#10B981]/30 hover:text-[#F8FAFC]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#111827] sticky top-0">
              <tr>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">ID</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Client</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Montant</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Taux</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Durée</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Reste à payer</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Score</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Statut</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Créé le</th>
                <th className="text-right text-xs font-medium text-[#94A3B8] px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {filteredCredits.map((credit) => (
                <tr
                  key={credit.id}
                  onClick={() => setSelectedRow(selectedRow === credit.id ? null : credit.id)}
                  className={`hover:bg-[#273549] transition-colors cursor-pointer ${
                    selectedRow === credit.id ? 'bg-[#273549]' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-[#F8FAFC] font-mono">{credit.id}</td>
                  <td className="px-6 py-4 text-sm text-[#F8FAFC] font-medium">{credit.client}</td>
                  <td className="px-6 py-4 text-sm text-[#F8FAFC] font-mono tabular-nums">
                    {credit.amount.toLocaleString()} €
                  </td>
                  <td className="px-6 py-4 text-sm text-[#94A3B8] font-mono tabular-nums">{credit.rate}%</td>
                  <td className="px-6 py-4 text-sm text-[#94A3B8] tabular-nums">{credit.duration} mois</td>
                  <td className="px-6 py-4 text-sm text-[#F8FAFC] font-mono tabular-nums">
                    {credit.remaining.toLocaleString()} €
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium ${
                        credit.riskScore.startsWith('A')
                          ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                          : credit.riskScore.startsWith('B')
                          ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                          : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
                      }`}
                    >
                      {credit.riskScore}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={credit.status as any} />
                  </td>
                  <td className="px-6 py-4 text-sm text-[#94A3B8] font-mono tabular-nums">{credit.created}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <ChevronRight
                        className={`w-4 h-4 text-[#64748B] transition-transform ${
                          selectedRow === credit.id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCredits.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#94A3B8]">Aucun crédit trouvé pour ce filtre</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-[#94A3B8]">
          Affichage de {filteredCredits.length} résultat{filteredCredits.length > 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#10B981]/30 transition-colors">
            Précédent
          </button>
          <button className="px-3 py-2 bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg text-[#10B981] font-medium">
            1
          </button>
          <button className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#10B981]/30 transition-colors">
            2
          </button>
          <button className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#10B981]/30 transition-colors">
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
