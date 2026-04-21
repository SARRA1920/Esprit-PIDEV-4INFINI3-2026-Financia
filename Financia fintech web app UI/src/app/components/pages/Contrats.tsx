import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';
import { FileText, Plus, Download, Eye, X } from 'lucide-react';

export function Contrats() {
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
          <h1 className="text-3xl font-semibold text-[#0F2747] mb-2">Contrats</h1>
          <p className="text-[#64748B]">Gérez tous vos contrats financiers</p>
        </div>
        <Button>
          <Plus className="w-5 h-5" />
          Créer un contrat
        </Button>
      </div>

      <Card>
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Référence</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Date début</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Date fin</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#64748B]">Montant</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[#64748B]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#E2E8F0] hover:bg-[#F6F8FC] transition-colors cursor-pointer"
                  onClick={() => setSelectedContract(idx)}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F6F8FC] flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#0F2747]" />
                      </div>
                      <span className="text-sm font-medium text-[#0F2747]">{contract.reference}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#0F2747]">{contract.type}</td>
                  <td className="py-4 px-4">
                    <StatusPill status={contract.status} />
                  </td>
                  <td className="py-4 px-4 text-sm text-[#64748B]">{contract.dateDebut}</td>
                  <td className="py-4 px-4 text-sm text-[#64748B]">{contract.dateFin}</td>
                  <td className="py-4 px-4 text-sm font-semibold text-[#0F2747]">{contract.montant}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedContract(idx); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                        <Download className="w-4 h-4" />
                      </Button>
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
              className="p-4 rounded-2xl border border-[#E2E8F0] space-y-3 hover:border-[#CBD5E1] hover:bg-[#F6F8FC] transition-all cursor-pointer"
              onClick={() => setSelectedContract(idx)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F6F8FC] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#0F2747]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0F2747] mb-1">{contract.reference}</p>
                    <p className="text-xs text-[#64748B]">{contract.type}</p>
                  </div>
                </div>
                <StatusPill status={contract.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E2E8F0]">
                <div>
                  <p className="text-xs text-[#64748B] mb-1">Date début</p>
                  <p className="text-sm text-[#0F2747]">{contract.dateDebut}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-1">Montant</p>
                  <p className="text-sm font-semibold text-[#0F2747]">{contract.montant}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {selectedContract !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedContract(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#0F2747]">Détails du contrat</h3>
              <button onClick={() => setSelectedContract(null)} className="p-2 hover:bg-[#F6F8FC] rounded-xl transition-colors">
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F2747] to-[#1a3a5f] flex items-center justify-center">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-[#0F2747]">{contracts[selectedContract].reference}</h4>
                    <StatusPill status={contracts[selectedContract].status} />
                  </div>
                  <p className="text-sm text-[#64748B]">{contracts[selectedContract].type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-[#F6F8FC] rounded-2xl">
                <div>
                  <p className="text-xs text-[#64748B] mb-1">Date début</p>
                  <p className="text-sm font-medium text-[#0F2747]">{contracts[selectedContract].dateDebut}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-1">Date fin</p>
                  <p className="text-sm font-medium text-[#0F2747]">{contracts[selectedContract].dateFin}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#64748B] mb-1">Montant total</p>
                  <p className="text-2xl font-semibold text-[#0F2747]">{contracts[selectedContract].montant}</p>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-[#0F2747] mb-2">Description</h5>
                <p className="text-sm text-[#64748B]">{contracts[selectedContract].description}</p>
              </div>

              <div>
                <h5 className="text-sm font-medium text-[#0F2747] mb-2">Conditions</h5>
                <p className="text-sm text-[#64748B]">{contracts[selectedContract].conditions}</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#E2E8F0]">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4" />
                  Télécharger PDF
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4" />
                  Télécharger contrat
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
