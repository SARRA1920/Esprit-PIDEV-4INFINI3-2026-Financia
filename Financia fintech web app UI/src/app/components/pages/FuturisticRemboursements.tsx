import { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { FuturisticButton } from '../ui/FuturisticButton';
import { FuturisticPill } from '../ui/FuturisticPill';
import { Filter, CreditCard } from 'lucide-react';

type FilterType = 'ALL' | 'PENDING' | 'PAID' | 'OVERDUE' | 'FAILED';

export function FuturisticRemboursements() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  const filters: { value: FilterType; label: string }[] = [
    { value: 'ALL', label: 'Tous' },
    { value: 'PENDING', label: 'À payer' },
    { value: 'PAID', label: 'Payés' },
    { value: 'OVERDUE', label: 'En retard' },
    { value: 'FAILED', label: 'Échec / Annulé' },
  ];

  const payments = [
    { echeance: '15 Mai 2026', montant: '850 €', status: 'PENDING' as const, retard: 0, paiement: '—', type: 'Crédit Auto' },
    { echeance: '22 Mai 2026', montant: '1 200 €', status: 'PENDING' as const, retard: 0, paiement: '—', type: 'Crédit Immobilier' },
    { echeance: '15 Avril 2026', montant: '850 €', status: 'PAID' as const, retard: 0, paiement: '14 Avril 2026', type: 'Crédit Auto' },
    { echeance: '22 Avril 2026', montant: '1 200 €', status: 'PAID' as const, retard: 0, paiement: '20 Avril 2026', type: 'Crédit Immobilier' },
    { echeance: '15 Mars 2026', montant: '850 €', status: 'OVERDUE' as const, retard: 5, paiement: '—', type: 'Crédit Auto' },
    { echeance: '22 Mars 2026', montant: '1 200 €', status: 'FAILED' as const, retard: 8, paiement: '—', type: 'Crédit Immobilier' },
  ];

  const filteredPayments = activeFilter === 'ALL'
    ? payments
    : payments.filter(p => p.status === activeFilter);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#0B1220] mb-2 tracking-tight">Remboursements</h1>
        <p className="text-[#56627A]">Gérez vos échéances et paiements</p>
      </div>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-[#56627A]" />
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter.value
                    ? 'bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] text-white shadow-[0_0_16px_rgba(52,215,255,0.3)]'
                    : 'bg-[rgba(255,255,255,0.5)] text-[#56627A] hover:bg-[rgba(52,215,255,0.1)] hover:text-[#0B1220] border border-[rgba(40,60,90,0.1)]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(40,60,90,0.12)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#56627A]">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#56627A]">Échéance</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#56627A]">Montant</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#56627A]">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#56627A]">Retard</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#56627A]">Date paiement</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[#56627A]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[rgba(40,60,90,0.08)] hover:bg-[rgba(52,215,255,0.05)] transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#34D7FF]/20 to-[#7C5CFF]/20 flex items-center justify-center"
                      >
                        <CreditCard className="w-5 h-5 text-[#34D7FF]" />
                      </div>
                      <span className="text-sm font-medium text-[#0B1220]">{payment.type}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#0B1220]">{payment.echeance}</td>
                  <td className="py-4 px-4 text-sm font-semibold text-[#0B1220] tabular-nums">{payment.montant}</td>
                  <td className="py-4 px-4">
                    <FuturisticPill status={payment.status} />
                  </td>
                  <td className="py-4 px-4 text-sm text-[#56627A]">
                    {payment.retard > 0 ? `${payment.retard} jours` : '—'}
                  </td>
                  <td className="py-4 px-4 text-sm text-[#56627A]">{payment.paiement}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {payment.status === 'PENDING' || payment.status === 'OVERDUE' ? (
                        <>
                          <FuturisticButton variant="outline-glow" size="sm">Payer (Stripe)</FuturisticButton>
                          <FuturisticButton variant="gradient" size="sm">Marquer payé</FuturisticButton>
                        </>
                      ) : payment.status === 'FAILED' ? (
                        <FuturisticButton variant="gradient" size="sm">Réessayer</FuturisticButton>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden space-y-4">
          {filteredPayments.map((payment, idx) => (
            <div
              key={idx}
              className="p-4 rounded-[18px] border border-[rgba(40,60,90,0.12)] backdrop-blur-sm space-y-3"
              style={{ background: 'rgba(255, 255, 255, 0.5)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0B1220] mb-1">{payment.type}</p>
                  <p className="text-xs text-[#56627A]">Échéance: {payment.echeance}</p>
                </div>
                <FuturisticPill status={payment.status} />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[rgba(40,60,90,0.12)]">
                <div>
                  <p className="text-xs text-[#56627A] mb-1">Montant</p>
                  <p className="text-lg font-semibold text-[#0B1220] tabular-nums">{payment.montant}</p>
                </div>
                {payment.retard > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-[#56627A] mb-1">Retard</p>
                    <p className="text-sm font-medium text-orange-600">{payment.retard} jours</p>
                  </div>
                )}
              </div>
              {(payment.status === 'PENDING' || payment.status === 'OVERDUE' || payment.status === 'FAILED') && (
                <div className="flex gap-2 pt-3 border-t border-[rgba(40,60,90,0.12)]">
                  {payment.status === 'FAILED' ? (
                    <FuturisticButton variant="gradient" size="sm" className="flex-1">Réessayer</FuturisticButton>
                  ) : (
                    <>
                      <FuturisticButton variant="outline-glow" size="sm" className="flex-1">Payer (Stripe)</FuturisticButton>
                      <FuturisticButton variant="gradient" size="sm" className="flex-1">Marquer payé</FuturisticButton>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#56627A]">Aucun remboursement trouvé pour ce filtre</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
