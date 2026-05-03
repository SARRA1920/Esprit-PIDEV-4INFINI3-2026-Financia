import { useState } from 'react';
import { FinCoach } from '../ui/FinCoach';
import { SavingsGoalCardML } from '../ui/SavingsGoalCardML';
import { PiggyBank, Plus, TrendingUp } from 'lucide-react';

// Mock data - À remplacer par vos vraies APIs
const mockGoals = [
  {
    id: 'goal-001',
    name: 'Objectif voyage',
    current: 3500,
    target: 5000,
    deadline: '01/09/2026',
  },
  {
    id: 'goal-002',
    name: 'Épargne urgence',
    current: 8000,
    target: 10000,
    deadline: '31/12/2026',
  },
  {
    id: 'goal-003',
    name: 'Projet immobilier',
    current: 950,
    target: 20000,
    deadline: '01/06/2027',
  },
];

export function ClientSavingsCoach() {
  const [selectedGoals, setSelectedGoals] = useState<Record<string, { forecast?: any; advice?: any }>>({});

  // Simulation des appels API ML
  const handleGetForecast = async (goalId: string) => {
    // TODO: Remplacer par votre vraie API
    // const response = await fetch(`/f/savings-goals/${goalId}/forecast`);
    // const data = await response.json();

    const mockForecast = {
      estimatedDate: '12/09/2026',
      status: 'SLIGHT_DELAY' as const,
      daysGap: 11,
      recommendation: 'Ajoutez 100€ par mois pour atteindre votre objectif 18 jours plus tôt',
    };

    setSelectedGoals((prev) => ({
      ...prev,
      [goalId]: { ...prev[goalId], forecast: mockForecast },
    }));
  };

  const handleGetAdvice = async (goalId: string) => {
    // TODO: Remplacer par votre vraie API
    // const response = await fetch(`/f/savings-goals/${goalId}/agent-advice`);
    // const data = await response.json();

    const mockAdvice = {
      verdict: 'STABLE' as const,
      summary: 'Vous maintenez un bon rythme d\'épargne avec une régularité appréciable.',
      recommendations: [
        'Augmenter de 50€ par mois pour atteindre votre objectif 2 semaines plus tôt',
        'Éviter les retraits les 10 premiers jours du mois',
        'Envisager un virement automatique le 5 de chaque mois',
      ],
    };

    setSelectedGoals((prev) => ({
      ...prev,
      [goalId]: { ...prev[goalId], advice: mockAdvice },
    }));
  };

  const handleAskGlobalAdvice = () => {
    // Demander un conseil global au coach
    console.log('Demander conseil global');
  };

  const coachMessages = [
    {
      type: 'greeting' as const,
      text: "Bonjour ! Je suis votre coach épargne IA. Je vous aide à atteindre vos objectifs financiers."
    },
    {
      type: 'insight' as const,
      text: "Vous êtes sur la bonne voie ! Votre régularité d'épargne s'améliore ce mois-ci."
    },
    {
      type: 'recommendation' as const,
      text: "Astuce : un virement automatique le 5 du mois optimiserait vos intérêts de 15%."
    },
    {
      type: 'celebration' as const,
      text: "Félicitations ! Vous avez atteint 70% de votre objectif voyage. Plus que 1 500€ !"
    },
  ];

  const totalSavings = mockGoals.reduce((sum, goal) => sum + goal.current, 0);

  return (
    <div className="min-h-screen bg-[#F7FAFF] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#34D7FF] to-[#7C5CFF] flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-[#0B1220] tracking-tight">Mon épargne</h1>
          </div>
          <p className="text-[#56627A]">Coach IA personnalisé pour optimiser votre épargne</p>
        </div>

        {/* Coach Section */}
        <FinCoach
          messages={coachMessages}
          onAskAdvice={handleAskGlobalAdvice}
        />

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-[20px] border border-[rgba(40,60,90,0.12)] p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-[#56627A] mb-2">Solde total</p>
                <p className="text-4xl font-semibold text-[#0B1220] tabular-nums tracking-tight">
                  {totalSavings.toLocaleString()} €
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

          <div className="bg-white rounded-[20px] border border-[rgba(40,60,90,0.12)] p-6 shadow-sm">
            <p className="text-sm text-[#56627A] mb-2">Objectifs actifs</p>
            <p className="text-4xl font-semibold text-[#0B1220] tabular-nums tracking-tight">
              {mockGoals.length}
            </p>
            <p className="text-sm text-[#56627A] mt-2">En cours de réalisation</p>
          </div>

          <button className="bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] rounded-[20px] p-6 shadow-lg hover:shadow-xl transition-all text-white text-left group">
            <div className="flex items-center justify-between mb-2">
              <Plus className="w-8 h-8" />
              <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <p className="font-semibold text-lg">Créer un nouvel objectif</p>
            <p className="text-sm text-white/80 mt-1">Définissez votre prochain défi</p>
          </button>
        </div>

        {/* Savings Goals with ML */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#0B1220]">Mes objectifs d'épargne</h2>
            <div className="flex items-center gap-2 text-sm text-[#56627A]">
              <div className="w-2 h-2 bg-[#34D7FF] rounded-full animate-pulse" />
              <span>IA activée sur tous les objectifs</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockGoals.map((goal) => (
              <SavingsGoalCardML
                key={goal.id}
                goal={goal}
                onGetForecast={handleGetForecast}
                onGetAdvice={handleGetAdvice}
                forecast={selectedGoals[goal.id]?.forecast}
                advice={selectedGoals[goal.id]?.advice}
              />
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-[#34D7FF]/10 to-[#7C5CFF]/10 rounded-[20px] border border-[#34D7FF]/20 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#34D7FF] to-[#7C5CFF] flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0B1220] mb-2">
                💡 Conseil du jour
              </h3>
              <p className="text-[#0B1220] mb-3">
                Vos dépôts sont plus réguliers ce mois-ci ! Continuez ainsi pour atteindre vos objectifs plus rapidement.
              </p>
              <button className="text-sm text-[#34D7FF] hover:text-[#7C5CFF] font-medium">
                Voir tous les conseils →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
