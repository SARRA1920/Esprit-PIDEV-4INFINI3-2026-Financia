import { AICoachCard } from '../ui/AICoachCard';
import { ForecastCard } from '../ui/ForecastCard';
import { BehaviorInsightCard } from '../ui/BehaviorInsightCard';
import { QuickActionsCard } from '../ui/QuickActionsCard';
import { IntelligentHistoryCard } from '../ui/IntelligentHistoryCard';
import { PiggyBank, TrendingUp } from 'lucide-react';

// Mock data - En production, cela viendrait de vos APIs ML
const mockAdvice = {
  verdict: 'STABLE' as const,
  summary: 'Vous maintenez un bon rythme d\'épargne avec une régularité appréciable.',
  recommendations: [
    'Augmenter de 50 € par mois pour atteindre votre objectif vacances 2 semaines plus tôt',
    'Éviter les retraits les 10 premiers jours du mois pour optimiser les intérêts',
    'Envisager un virement automatique le 5 de chaque mois',
  ],
  confidence: 87,
  context: 'Basé sur vos dépôts des 3 derniers mois et votre historique de régularité',
};

const mockGoal = {
  name: 'Objectif voyage',
  current: 3500,
  target: 5000,
  deadline: '01/09/2026',
  forecast: {
    estimatedDate: '12/09/2026',
    status: 'SLIGHT_DELAY' as const,
    daysGap: 11,
    recommendation: 'Si vous ajoutez 100 € par mois, vous atteindrez l\'objectif le 25/08/2026',
  },
};

const mockInsights = {
  regularityScore: 78,
  avgDeposit: 285,
  depositFrequency: 'Tous les 12 jours',
  monthComparison: {
    deposits: { current: 4, previous: 3 },
    withdrawals: { current: 2, previous: 1 },
  },
  alert: 'Vous avez fait plus de retraits que d\'habitude ce mois-ci',
};

const mockTransactions = [
  { id: '1', date: '18 Avr 2026', type: 'DEPOSIT' as const, amount: 200, label: 'Virement mensuel' },
  { id: '2', date: '12 Avr 2026', type: 'DEPOSIT' as const, amount: 150, label: 'Dépôt manuel' },
  { id: '3', date: '08 Avr 2026', type: 'WITHDRAWAL' as const, amount: 80, label: 'Retrait courses' },
  { id: '4', date: '05 Avr 2026', type: 'DEPOSIT' as const, amount: 300, label: 'Prime mensuelle' },
  { id: '5', date: '02 Avr 2026', type: 'WITHDRAWAL' as const, amount: 50, label: 'Retrait urgence' },
  { id: '6', date: '28 Mar 2026', type: 'DEPOSIT' as const, amount: 200, label: 'Virement automatique' },
];

const mockQuickActions = [
  { label: 'Déposer 50 €', icon: 'deposit' as const, primary: true },
  { label: 'Créer un virement d\'épargne', icon: 'transfer' as const },
  { label: 'Revoir mon objectif', icon: 'goal' as const },
  { label: 'Demander un conseil', icon: 'advice' as const },
];

export function ClientSavingsEnriched() {
  return (
    <div className="min-h-screen bg-[#F7FAFF] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#34D7FF] to-[#7C5CFF] flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-[#0B1220] tracking-tight">Mon épargne</h1>
          </div>
          <p className="text-[#56627A]">Tableau de bord enrichi par intelligence artificielle</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-[20px] border border-[rgba(40,60,90,0.12)] p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-[#56627A] mb-2">Solde total</p>
                <p className="text-4xl font-semibold text-[#0B1220] tabular-nums tracking-tight">
                  3 500 €
                </p>
              </div>
              <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-emerald-600 font-medium">↑ +5.2%</span>
              <span className="text-[#56627A]">vs mois dernier</span>
            </div>
          </div>

          <QuickActionsCard actions={mockQuickActions} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AICoachCard advice={mockAdvice} />
            <BehaviorInsightCard insights={mockInsights} />
          </div>
          <div className="space-y-6">
            <ForecastCard goal={mockGoal} />
            <IntelligentHistoryCard
              transactions={mockTransactions}
              monthSummary={{
                totalDeposits: 850,
                totalWithdrawals: 130,
                netChange: 720,
                bestMonth: true,
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-[rgba(40,60,90,0.12)] p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#0B1220] mb-4">Simulateur rapide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0B1220] mb-2">
                Montant mensuel supplémentaire
              </label>
              <div className="relative">
                <input
                  type="number"
                  defaultValue="100"
                  className="w-full bg-[#F6F8FC] border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#34D7FF] focus:border-transparent"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#56627A]">€</span>
              </div>
            </div>
            <div className="flex items-end">
              <button className="w-full bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] text-white rounded-[12px] px-6 py-2.5 font-medium hover:shadow-[0_0_20px_rgba(52,215,255,0.3)] transition-all">
                Simuler l'impact
              </button>
            </div>
            <div className="flex items-center justify-center p-4 rounded-[12px] bg-gradient-to-r from-[#34D7FF]/10 to-[#7C5CFF]/10 border border-[#34D7FF]/20">
              <div className="text-center">
                <p className="text-xs text-[#56627A] mb-1">Nouvelle date estimée</p>
                <p className="text-lg font-semibold text-[#0B1220]">25/08/2026</p>
                <p className="text-xs text-emerald-600 font-medium">18 jours plus tôt</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
