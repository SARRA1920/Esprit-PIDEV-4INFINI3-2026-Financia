import { GlassCard } from '../ui/GlassCard';
import { FuturisticButton } from '../ui/FuturisticButton';
import { PiggyBank, Target, TrendingUp, Plus, ArrowRight } from 'lucide-react';

export function FuturisticSavings() {
  const savingsAccounts = [
    {
      nom: 'Épargne vacances',
      montant: 3500,
      objectif: 5000,
      progression: 70,
      derniereOperation: '10 Avril 2026',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      nom: 'Épargne urgence',
      montant: 8000,
      objectif: 10000,
      progression: 80,
      derniereOperation: '05 Avril 2026',
      color: 'from-emerald-400 to-green-500'
    },
    {
      nom: 'Projet immobilier',
      montant: 950,
      objectif: 20000,
      progression: 4.75,
      derniereOperation: '01 Avril 2026',
      color: 'from-violet-400 to-purple-500'
    },
  ];

  const totalSavings = savingsAccounts.reduce((sum, acc) => sum + acc.montant, 0);
  const totalObjectifs = savingsAccounts.reduce((sum, acc) => sum + acc.objectif, 0);
  const globalProgression = Math.round((totalSavings / totalObjectifs) * 100);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0B1220] mb-2 tracking-tight">Savings</h1>
          <p className="text-[#56627A]">Gérez vos économies et objectifs</p>
        </div>
        <FuturisticButton variant="gradient">
          <Plus className="w-5 h-5" />
          Ajouter une épargne
        </FuturisticButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard glow className="relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-64 h-64 opacity-30 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(52, 215, 255, 0.5) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#34D7FF] to-[#7C5CFF] flex items-center justify-center"
                style={{ boxShadow: '0 0 20px rgba(52, 215, 255, 0.4)' }}
              >
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-[#56627A]">Solde total</p>
                <p className="text-3xl font-semibold text-[#0B1220] tabular-nums tracking-tight">
                  {totalSavings.toLocaleString()} €
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-500 font-medium">+5.2%</span>
              <span className="text-[#56627A]">ce mois</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#7C5CFF] to-[#34D7FF] flex items-center justify-center"
              style={{ boxShadow: '0 0 16px rgba(124, 92, 255, 0.3)' }}
            >
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#56627A]">Objectifs globaux</p>
              <p className="text-3xl font-semibold text-[#0B1220] tabular-nums tracking-tight">{globalProgression}%</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#56627A]">Progression</span>
              <span className="text-[#0B1220] font-medium tabular-nums">
                {totalSavings.toLocaleString()} € / {totalObjectifs.toLocaleString()} €
              </span>
            </div>
            <div className="relative h-3 bg-[rgba(86,98,122,0.1)] rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] rounded-full"
                style={{
                  width: `${globalProgression}%`,
                  boxShadow: '0 0 12px rgba(52, 215, 255, 0.5)',
                }}
              />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#0B1220]">Mes comptes d'épargne</h3>
        {savingsAccounts.map((account, idx) => (
          <GlassCard key={idx} hover className="cursor-pointer group">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`w-14 h-14 rounded-[16px] bg-gradient-to-br ${account.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                  style={{ boxShadow: '0 4px 20px rgba(52, 215, 255, 0.2)' }}
                >
                  <PiggyBank className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-[#0B1220] mb-1">{account.nom}</h4>
                  <p className="text-sm text-[#56627A]">Dernière opération: {account.derniereOperation}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#56627A] group-hover:text-[#34D7FF] transition-colors flex-shrink-0" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-[#56627A] mb-1">Montant actuel</p>
                <p className="text-2xl font-semibold text-[#0B1220] tabular-nums tracking-tight">
                  {account.montant.toLocaleString()} €
                </p>
              </div>
              <div>
                <p className="text-xs text-[#56627A] mb-1">Objectif</p>
                <p className="text-2xl font-semibold text-[#0B1220] tabular-nums tracking-tight">
                  {account.objectif.toLocaleString()} €
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#56627A]">Progression</span>
                <span className="text-[#0B1220] font-medium">{account.progression.toFixed(1)}%</span>
              </div>
              <div className="relative h-2 bg-[rgba(86,98,122,0.1)] rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${account.color} rounded-full`}
                  style={{
                    width: `${account.progression}%`,
                    boxShadow: '0 0 8px rgba(52, 215, 255, 0.4)',
                  }}
                />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
            style={{ boxShadow: '0 0 16px rgba(245, 158, 11, 0.3)' }}
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-[#0B1220]">Historique récent</h3>
        </div>
        <div className="space-y-3">
          {[
            { date: '10 Avril 2026', compte: 'Épargne vacances', montant: '+200 €', type: 'deposit' },
            { date: '05 Avril 2026', compte: 'Épargne urgence', montant: '+500 €', type: 'deposit' },
            { date: '01 Avril 2026', compte: 'Projet immobilier', montant: '+150 €', type: 'deposit' },
          ].map((transaction, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-[16px] border border-[rgba(40,60,90,0.1)] hover:border-[rgba(52,215,255,0.3)] hover:shadow-[0_0_12px_rgba(52,215,255,0.1)] transition-all duration-300 backdrop-blur-sm"
              style={{ background: 'rgba(255, 255, 255, 0.5)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0B1220]">{transaction.compte}</p>
                  <p className="text-xs text-[#56627A]">{transaction.date}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-emerald-600 tabular-nums">
                {transaction.montant}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
