import { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { FuturisticButton } from '../ui/FuturisticButton';
import { FuturisticPill } from '../ui/FuturisticPill';
import { FileText, Plus, Download, Eye, X } from 'lucide-react';

export function FuturisticContrats() {
  const [selectedContract, setSelectedContract] = useState<number | null>(null);

  const contracts = [
    {
      reference: 'CNT-2026-001',
      type: 'Crédit Auto',
      status: 'ACTIVE' as const,
      dateDebut: '15 Jan 2024',
      dateFin: '15 Jan 2029',
      montant: '50 000 €',
      description: 'Contrat de crédit automobile pour l\'acquisition d\'un véhicule neuf.',
      conditions: 'Taux fixe de 3.5%, remboursement mensuel de 850€'
    },
    {
      reference: 'CNT-2026-002',
      type: 'Assurance Crédit',
      status: 'ACTIVE' as const,
      dateDebut: '15 Jan 2024',
      dateFin: '15 Jan 2029',
      montant: '2 500 €',
      description: 'Assurance de protection du crédit automobile.',
      conditions: 'Couverture décès, invalidité et perte d\'emploi'
    },
    {
      reference: 'CNT-2025-087',
      type: 'Épargne Placement',
      status: 'PENDING' as const,
      dateDebut: '01 Mai 2026',
      dateFin: '01 Mai 2031',
      montant: '10 000 €',
      description: 'Plan d\'épargne à moyen terme avec rendement garanti.',
      conditions: 'Taux garanti de 2.8%, versements mensuels possibles'
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0B1220] mb-2 tracking-tight">Contrats</h1>
          <p className="text-[#56627A]">Gérez tous vos contrats financiers</p>
        </div>
        <FuturisticButton variant="gradient">
          <Plus className="w-5 h-5" />
          Créer un contrat
        </FuturisticButton>
      </div>

      <GlassCard>
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(40,60,90,0.12)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#56627A]">Référence</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#56627A]">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#56627A]">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#56627A]">Date début</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#56627A]">Date fin</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#56627A]">Montant</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[#56627A]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[rgba(40,60,90,0.08)] hover:bg-[rgba(52,215,255,0.05)] transition-colors cursor-pointer"
                  onClick={() => setSelectedContract(idx)}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#34D7FF]/20 to-[#7C5CFF]/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#34D7FF]" />
                      </div>
                      <span className="text-sm font-medium text-[#0B1220]">{contract.reference}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#0B1220]">{contract.type}</td>
                  <td className="py-4 px-4">
                    <FuturisticPill status={contract.status} />
                  </td>
                  <td className="py-4 px-4 text-sm text-[#56627A]">{contract.dateDebut}</td>
                  <td className="py-4 px-4 text-sm text-[#56627A]">{contract.dateFin}</td>
                  <td className="py-4 px-4 text-sm font-semibold text-[#0B1220] tabular-nums">{contract.montant}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <FuturisticButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedContract(idx); }}>
                        <Eye className="w-4 h-4" />
                      </FuturisticButton>
                      <FuturisticButton variant="outline-glow" size="sm" onClick={(e) => e.stopPropagation()}>
                        <Download className="w-4 h-4" />
                      </FuturisticButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden space-y-4">
          {contracts.map((contract, idx) => (
            <div
              key={idx}
              className="p-4 rounded-[18px] border border-[rgba(40,60,90,0.12)] backdrop-blur-sm space-y-3 hover:border-[rgba(52,215,255,0.3)] hover:shadow-[0_0_16px_rgba(52,215,255,0.1)] transition-all cursor-pointer"
              onClick={() => setSelectedContract(idx)}
              style={{ background: 'rgba(255, 255, 255, 0.5)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#34D7FF]/20 to-[#7C5CFF]/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#34D7FF]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0B1220] mb-1">{contract.reference}</p>
                    <p className="text-xs text-[#56627A]">{contract.type}</p>
                  </div>
                </div>
                <FuturisticPill status={contract.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[rgba(40,60,90,0.12)]">
                <div>
                  <p className="text-xs text-[#56627A] mb-1">Date début</p>
                  <p className="text-sm text-[#0B1220]">{contract.dateDebut}</p>
                </div>
                <div>
                  <p className="text-xs text-[#56627A] mb-1">Montant</p>
                  <p className="text-sm font-semibold text-[#0B1220] tabular-nums">{contract.montant}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {selectedContract !== null && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedContract(null)}
        >
          <div
            className="rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[rgba(40,60,90,0.2)] backdrop-blur-[18px]"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.85) 100%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 40px rgba(52,215,255,0.1)',
            }}
          >
            <div className="sticky top-0 backdrop-blur-[14px] border-b border-[rgba(40,60,90,0.12)] px-6 py-4 flex items-center justify-between rounded-t-[24px]" style={{ background: 'rgba(255,255,255,0.8)' }}>
              <h3 className="text-xl font-semibold text-[#0B1220]">Détails du contrat</h3>
              <button onClick={() => setSelectedContract(null)} className="p-2 hover:bg-[rgba(52,215,255,0.1)] rounded-[12px] transition-colors">
                <X className="w-5 h-5 text-[#56627A]" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#34D7FF] to-[#7C5CFF] flex items-center justify-center"
                  style={{ boxShadow: '0 0 20px rgba(52, 215, 255, 0.4)' }}
                >
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-[#0B1220]">{contracts[selectedContract].reference}</h4>
                    <FuturisticPill status={contracts[selectedContract].status} />
                  </div>
                  <p className="text-sm text-[#56627A]">{contracts[selectedContract].type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-[16px] border border-[rgba(40,60,90,0.12)] backdrop-blur-sm" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
                <div>
                  <p className="text-xs text-[#56627A] mb-1">Date début</p>
                  <p className="text-sm font-medium text-[#0B1220]">{contracts[selectedContract].dateDebut}</p>
                </div>
                <div>
                  <p className="text-xs text-[#56627A] mb-1">Date fin</p>
                  <p className="text-sm font-medium text-[#0B1220]">{contracts[selectedContract].dateFin}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#56627A] mb-1">Montant total</p>
                  <p className="text-2xl font-semibold text-[#0B1220] tabular-nums tracking-tight">{contracts[selectedContract].montant}</p>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-[#0B1220] mb-2">Description</h5>
                <p className="text-sm text-[#56627A]">{contracts[selectedContract].description}</p>
              </div>

              <div>
                <h5 className="text-sm font-medium text-[#0B1220] mb-2">Conditions</h5>
                <p className="text-sm text-[#56627A]">{contracts[selectedContract].conditions}</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[rgba(40,60,90,0.12)]">
                <FuturisticButton variant="outline-glow" className="flex-1">
                  <Download className="w-4 h-4" />
                  Télécharger PDF
                </FuturisticButton>
                <FuturisticButton variant="gradient" className="flex-1">
                  <Download className="w-4 h-4" />
                  Télécharger contrat
                </FuturisticButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
