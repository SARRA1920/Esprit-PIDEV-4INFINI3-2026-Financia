import { GlassCard } from '../ui/GlassCard';
import { FuturisticButton } from '../ui/FuturisticButton';
import { FuturisticPill } from '../ui/FuturisticPill';
import { CreditCard, Calendar, PiggyBank, FileText, Zap, TrendingUp, Clock, Target, ArrowRight, Play } from 'lucide-react';

export function FuturisticDashboard() {
  return (
    <div className="space-y-8">
      <GlassCard
        glow
        className="relative overflow-hidden"
      >
        <div
          className="absolute top-0 right-0 w-96 h-96 opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(52, 215, 255, 0.4) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(124, 92, 255, 0.4) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-[#0B1220] mb-2 tracking-tight">
                Bonjour, Salma
              </h1>
              <p className="text-[#56627A]">Votre espace Financia — aperçu et actions rapides.</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] animate-pulse" />
              <span className="text-xs text-[#56627A]">Synchronisé</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <FuturisticButton variant="gradient" size="lg">
              <Zap className="w-5 h-5" />
              Payer une échéance
            </FuturisticButton>
            <FuturisticButton variant="outline-glow">
              <CreditCard className="w-5 h-5" />
              Voir mon crédit
            </FuturisticButton>
            <FuturisticButton variant="outline-glow">
              <PiggyBank className="w-5 h-5" />
              Ajouter une épargne
            </FuturisticButton>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(52,215,255,0.5) 50%, transparent 100%)',
          }}
        />
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            label: 'Reste à payer',
            value: '45 000 €',
            note: 'Sur 50 000 € emprunté',
            icon: CreditCard,
            gradient: 'from-blue-400 to-blue-600',
          },
          {
            label: 'Prochaine échéance',
            value: '850 €',
            note: '15 Mai 2026',
            icon: Calendar,
            gradient: 'from-amber-400 to-amber-600',
          },
          {
            label: 'Épargne totale',
            value: '12 450 €',
            note: '+5.2% ce mois',
            icon: PiggyBank,
            gradient: 'from-emerald-400 to-emerald-600',
          },
          {
            label: 'Contrats actifs',
            value: '3',
            note: '1 en cours de signature',
            icon: FileText,
            gradient: 'from-violet-400 to-violet-600',
          },
        ].map((kpi, idx) => (
          <GlassCard key={idx} hover className="group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-[#56627A] mb-2">{kpi.label}</p>
                <p className="text-3xl font-semibold text-[#0B1220] mb-1 tracking-tight tabular-nums">
                  {kpi.value}
                </p>
                <p className="text-xs text-[#56627A]">{kpi.note}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${kpi.gradient} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}
                style={{ boxShadow: '0 4px 16px rgba(52, 215, 255, 0.2)' }}
              >
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#34D7FF] to-[#7C5CFF] flex items-center justify-center"
                style={{ boxShadow: '0 0 16px rgba(52, 215, 255, 0.3)' }}
              >
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#0B1220]">Échéances à venir</h3>
            </div>
            <FuturisticButton variant="ghost" size="sm">
              Voir tout <ArrowRight className="w-4 h-4" />
            </FuturisticButton>
          </div>
          <div className="space-y-3">
            {[
              { date: '15 Mai 2026', amount: '850 €', label: 'Crédit Auto', status: 'PENDING' as const },
              { date: '22 Mai 2026', amount: '1 200 €', label: 'Crédit Immobilier', status: 'PENDING' as const },
              { date: '28 Mai 2026', amount: '450 €', label: 'Crédit Personnel', status: 'PENDING' as const },
            ].map((payment, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-[16px] border border-[rgba(40,60,90,0.1)] backdrop-blur-sm hover:border-[rgba(52,215,255,0.3)] hover:shadow-[0_0_16px_rgba(52,215,255,0.1)] transition-all duration-300"
                style={{ background: 'rgba(255, 255, 255, 0.5)' }}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0B1220] mb-1">{payment.label}</p>
                  <p className="text-xs text-[#56627A]">{payment.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-[#0B1220] tabular-nums">{payment.amount}</p>
                  <FuturisticPill status={payment.status} label="À payer" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#7C5CFF] to-[#34D7FF] flex items-center justify-center"
                style={{ boxShadow: '0 0 16px rgba(124, 92, 255, 0.3)' }}
              >
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#0B1220]">Savings — Objectifs</h3>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Épargne vacances', current: 3500, target: 5000, color: 'from-blue-400 to-cyan-400' },
              { label: 'Épargne urgence', current: 8000, target: 10000, color: 'from-emerald-400 to-green-400' },
              { label: 'Projet immobilier', current: 950, target: 20000, color: 'from-violet-400 to-purple-400' },
            ].map((goal, idx) => {
              const percentage = (goal.current / goal.target) * 100;
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-[#0B1220]">{goal.label}</p>
                    <p className="text-xs text-[#56627A] tabular-nums">
                      {goal.current.toLocaleString()} € / {goal.target.toLocaleString()} €
                    </p>
                  </div>
                  <div className="relative h-2 bg-[rgba(86,98,122,0.1)] rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${goal.color} rounded-full transition-all duration-500`}
                      style={{
                        width: `${percentage}%`,
                        boxShadow: '0 0 8px rgba(52, 215, 255, 0.4)',
                      }}
                    />
                  </div>
                  <p className="text-xs text-[#56627A] mt-1">{percentage.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
              style={{ boxShadow: '0 0 16px rgba(245, 158, 11, 0.3)' }}
            >
              <Play className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#0B1220]">Formations recommandées</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Gérer son budget', duration: '2h 30min', level: 'Débutant' },
            { title: 'Crédit immobilier', duration: '3h 15min', level: 'Intermédiaire' },
            { title: 'Optimiser son épargne', duration: '1h 45min', level: 'Débutant' },
          ].map((course, idx) => (
            <div
              key={idx}
              className="p-4 rounded-[16px] border border-[rgba(40,60,90,0.1)] backdrop-blur-sm hover:border-[rgba(52,215,255,0.3)] hover:shadow-[0_0_16px_rgba(52,215,255,0.1)] transition-all duration-300 group cursor-pointer"
              style={{ background: 'rgba(255, 255, 255, 0.5)' }}
            >
              <div className="h-32 rounded-[12px] bg-gradient-to-br from-[#34D7FF]/20 to-[#7C5CFF]/20 flex items-center justify-center mb-3">
                <Play className="w-12 h-12 text-[#34D7FF] group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-sm font-semibold text-[#0B1220] mb-2">{course.title}</h4>
              <div className="flex items-center gap-3 text-xs text-[#56627A] mb-3">
                <span>{course.duration}</span>
                <span>•</span>
                <span>{course.level}</span>
              </div>
              <FuturisticButton variant="outline-glow" size="sm" className="w-full">
                Voir le cours
              </FuturisticButton>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
