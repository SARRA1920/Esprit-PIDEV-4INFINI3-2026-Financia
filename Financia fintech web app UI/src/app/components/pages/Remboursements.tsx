import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';
import { Filter, CreditCard } from 'lucide-react';

type FilterType = 'ALL' | 'PENDING' | 'PAID' | 'OVERDUE' | 'FAILED';

export function Remboursements() {
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
        <h1 className="text-3xl font-semibold text-[#0F2747] mb-2">Remboursements</h1>
        <p className="text-[#64748B]">Gérez vos échéances et paiements</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-[#64748B]" />
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter.value
                    ? 'bg-[#0F2747] text-white shadow-sm'
                    : 'bg-[#F6F8FC] text-[#64748B] hover:bg-[#E2E8F0]'
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
              <tr className="border-b border-[#E2E8F0]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Échéance</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Montant</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Retard</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Date paiement</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[#64748B]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment, idx) => (
                <tr key={idx} className="border-b border-[#E2E8F0] hover:bg-[#F6F8FC] transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F6F8FC] flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[#0F2747]" />
                      </div>
                      <span className="text-sm font-medium text-[#0F2747]">{payment.type}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#0F2747]">{payment.echeance}</td>
                  <td className="py-4 px-4 text-sm font-semibold text-[#0F2747]">{payment.montant}</td>
                  <td className="py-4 px-4">
                    <StatusPill status={payment.status} />
                  </td>
                  <td className="py-4 px-4 text-sm text-[#64748B]">
                    {payment.retard > 0 ? `${payment.retard} jours` : '—'}
                  </td>
                  <td className="py-4 px-4 text-sm text-[#64748B]">{payment.paiement}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {payment.status === 'PENDING' || payment.status === 'OVERDUE' ? (
                        <>
                          <Button variant="outline" size="sm">Payer (Stripe)</Button>
                          <Button variant="primary" size="sm">Marquer payé</Button>
                        </>
                      ) : payment.status === 'FAILED' ? (
                        <Button variant="primary" size="sm">Réessayer</Button>
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
            <div key={idx} className="p-4 rounded-2xl border border-[#E2E8F0] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0F2747] mb-1">{payment.type}</p>
                  <p className="text-xs text-[#64748B]">Échéance: {payment.echeance}</p>
                </div>
                <StatusPill status={payment.status} />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                <div>
                  <p className="text-xs text-[#64748B] mb-1">Montant</p>
                  <p className="text-lg font-semibold text-[#0F2747]">{payment.montant}</p>
                </div>
                {payment.retard > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-[#64748B] mb-1">Retard</p>
                    <p className="text-sm font-medium text-orange-600">{payment.retard} jours</p>
                  </div>
                )}
              </div>
              {(payment.status === 'PENDING' || payment.status === 'OVERDUE' || payment.status === 'FAILED') && (
                <div className="flex gap-2 pt-3 border-t border-[#E2E8F0]">
                  {payment.status === 'FAILED' ? (
                    <Button variant="primary" size="sm" className="flex-1">Réessayer</Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" className="flex-1">Payer (Stripe)</Button>
                      <Button variant="primary" size="sm" className="flex-1">Marquer payé</Button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#64748B]">Aucun remboursement trouvé pour ce filtre</p>
          </div>
        )}
      </Card>
    </div>
  );
}
