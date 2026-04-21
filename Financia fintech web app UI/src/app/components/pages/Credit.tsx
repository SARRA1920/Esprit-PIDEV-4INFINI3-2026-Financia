import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';
import { Download, ArrowRight, Calendar, DollarSign, TrendingDown } from 'lucide-react';

export function Credit() {
  const hasCredit = true;

  const creditData = {
    status: 'ACTIVE' as const,
    montant: '50 000 €',
    duree: '60 mois',
    resteAPayer: '45 000 €',
    tauxInteret: '3.5%',
    mensualite: '850 €',
    dateDebut: '15 Janvier 2024',
    dateFin: '15 Janvier 2029',
  };

  if (!hasCredit) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold text-[#0F2747]">Crédit</h1>
        <Card className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#F6F8FC] flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-[#64748B]" />
            </div>
            <h3 className="text-xl font-semibold text-[#0F2747] mb-2">Aucun crédit actif</h3>
            <p className="text-[#64748B] mb-6">
              Vous n'avez pas de crédit en cours. Découvrez nos offres de financement adaptées à vos besoins.
            </p>
            <Button size="lg">
              Demander un crédit <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold text-[#0F2747]">Crédit</h1>

      <Card className="bg-gradient-to-br from-[#0F2747] to-[#1a3a5f] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5B301] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-2xl font-semibold">Crédit Auto</h2>
                <StatusPill status={creditData.status} label="Actif" />
              </div>
              <p className="text-white/70">Référence: CR-2024-00123</p>
            </div>
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4" />
              Télécharger l'échéancier
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-white/70 text-sm mb-1">Montant emprunté</p>
              <p className="text-2xl font-semibold">{creditData.montant}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Reste à payer</p>
              <p className="text-2xl font-semibold">{creditData.resteAPayer}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Mensualité</p>
              <p className="text-2xl font-semibold">{creditData.mensualite}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Taux d'intérêt</p>
              <p className="text-2xl font-semibold">{creditData.tauxInteret}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" className="flex-1">
              <ArrowRight className="w-5 h-5" />
              Voir mes remboursements
            </Button>
            <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
              Simuler un remboursement anticipé
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-[#64748B] mb-1">Durée du crédit</h3>
          <p className="text-2xl font-semibold text-[#0F2747] mb-1">{creditData.duree}</p>
          <p className="text-xs text-[#64748B]">Du {creditData.dateDebut} au {creditData.dateFin}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-[#64748B] mb-1">Progression</h3>
          <p className="text-2xl font-semibold text-[#0F2747] mb-2">10%</p>
          <div className="w-full bg-[#E2E8F0] rounded-full h-2">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full" style={{ width: '10%' }} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-[#64748B] mb-1">Prochaine échéance</h3>
          <p className="text-2xl font-semibold text-[#0F2747] mb-1">{creditData.mensualite}</p>
          <p className="text-xs text-[#64748B]">15 Mai 2026</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-[#0F2747] mb-4">Historique des paiements</h3>
        <div className="space-y-3">
          {[
            { date: '15 Avril 2026', amount: '850 €', status: 'PAID' as const },
            { date: '15 Mars 2026', amount: '850 €', status: 'PAID' as const },
            { date: '15 Février 2026', amount: '850 €', status: 'PAID' as const },
          ].map((payment, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F2747]">Échéance mensuelle</p>
                  <p className="text-xs text-[#64748B]">{payment.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-[#0F2747]">{payment.amount}</p>
                <StatusPill status={payment.status} label="Payé" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
