import { GlassCard } from '../ui/GlassCard';
import { FuturisticButton } from '../ui/FuturisticButton';
import { FuturisticPill } from '../ui/FuturisticPill';
import { Download, ArrowRight, Calendar, DollarSign, TrendingDown, Activity } from 'lucide-react';

export function FuturisticCredit() {
  const hasCredit = true;

  if (!hasCredit) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold text-[#0B1220] tracking-tight">Mon crédit</h1>
        <GlassCard className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#34D7FF]/20 to-[#7C5CFF]/20 flex items-center justify-center mx-auto mb-4"
            >
              <DollarSign className="w-10 h-10 text-[#56627A]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#0B1220] mb-2">Aucun crédit actif</h3>
            <p className="text-[#56627A] mb-6">
              Vous n'avez pas de crédit en cours. Découvrez nos offres de financement adaptées à vos besoins.
            </p>
            <FuturisticButton variant="gradient" size="lg">
              Demander un crédit <ArrowRight className="w-5 h-5" />
            </FuturisticButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold text-[#0B1220] tracking-tight">Mon crédit</h1>

      <GlassCard glow className="relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(52, 215, 255, 0.6) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(124, 92, 255, 0.6) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-2xl font-semibold text-[#0B1220] tracking-tight">Crédit Auto</h2>
                <FuturisticPill status="ACTIVE" label="Actif" />
              </div>
              <p className="text-[#56627A]">Référence: CR-2024-00123</p>
            </div>
            <FuturisticButton variant="outline-glow" size="sm">
              <Download className="w-4 h-4" />
              Télécharger l'échéancier
            </FuturisticButton>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Montant emprunté', value: '50 000 €' },
              { label: 'Reste à payer', value: '45 000 €' },
              { label: 'Mensualité', value: '850 €' },
              { label: "Taux d'intérêt", value: '3.5%' },
            ].map((metric, idx) => (
              <div key={idx}>
                <p className="text-sm text-[#56627A] mb-1">{metric.label}</p>
                <p className="text-2xl font-semibold text-[#0B1220] tabular-nums tracking-tight">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#56627A]">Progression du remboursement</span>
              <span className="text-sm font-medium text-[#0B1220]">10%</span>
            </div>
            <div className="relative h-3 bg-[rgba(86,98,122,0.1)] rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] rounded-full"
                style={{
                  width: '10%',
                  boxShadow: '0 0 16px rgba(52, 215, 255, 0.5)',
                }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <FuturisticButton variant="gradient" className="flex-1">
              <ArrowRight className="w-5 h-5" />
              Voir mes remboursements
            </FuturisticButton>
            <FuturisticButton variant="outline-glow" className="flex-1">
              Simuler un remboursement anticipé
            </FuturisticButton>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          {
            icon: Calendar,
            label: 'Durée du crédit',
            value: '60 mois',
            detail: 'Du 15 Jan 2024 au 15 Jan 2029',
            gradient: 'from-blue-400 to-blue-600',
          },
          {
            icon: TrendingDown,
            label: 'Progression',
            value: '10%',
            detail: '5 000 € remboursé sur 50 000 €',
            gradient: 'from-emerald-400 to-emerald-600',
          },
          {
            icon: DollarSign,
            label: 'Prochaine échéance',
            value: '850 €',
            detail: '15 Mai 2026',
            gradient: 'from-amber-400 to-amber-600',
          },
        ].map((card, idx) => (
          <GlassCard key={idx} hover>
            <div
              className="w-12 h-12 rounded-[14px] bg-gradient-to-br flex items-center justify-center mb-4"
              style={{
                backgroundImage: `linear-gradient(to bottom right, ${card.gradient.split(' ')[0].replace('from-', 'var(--tw-gradient-from)')}, ${card.gradient.split(' ')[1].replace('to-', 'var(--tw-gradient-to)')})`,
                boxShadow: '0 4px 16px rgba(52, 215, 255, 0.2)',
              }}
              className={`bg-gradient-to-br ${card.gradient}`}
            >
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm text-[#56627A] mb-1">{card.label}</h3>
            <p className="text-2xl font-semibold text-[#0B1220] mb-1 tabular-nums tracking-tight">{card.value}</p>
            <p className="text-xs text-[#56627A]">{card.detail}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#34D7FF] to-[#7C5CFF] flex items-center justify-center"
            style={{ boxShadow: '0 0 16px rgba(52, 215, 255, 0.3)' }}
          >
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-[#0B1220]">Historique des paiements</h3>
        </div>
        <div className="space-y-3">
          {[
            { date: '15 Avril 2026', amount: '850 €', status: 'PAID' as const },
            { date: '15 Mars 2026', amount: '850 €', status: 'PAID' as const },
            { date: '15 Février 2026', amount: '850 €', status: 'PAID' as const },
          ].map((payment, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-[16px] border border-[rgba(40,60,90,0.1)] backdrop-blur-sm"
              style={{ background: 'rgba(255, 255, 255, 0.5)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0B1220]">Échéance mensuelle</p>
                  <p className="text-xs text-[#56627A]">{payment.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-[#0B1220] tabular-nums">{payment.amount}</p>
                <FuturisticPill status={payment.status} label="Payé" />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
