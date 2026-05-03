import { Target, Calendar, TrendingUp, Zap } from 'lucide-react';

interface ForecastCardProps {
  goal: {
    name: string;
    current: number;
    target: number;
    deadline: string;
    forecast: {
      estimatedDate: string;
      status: 'ON_TRACK' | 'SLIGHT_DELAY' | 'AT_RISK';
      daysGap: number;
      recommendation: string;
    };
  };
}

export function ForecastCard({ goal }: ForecastCardProps) {
  const progress = (goal.current / goal.target) * 100;

  const statusConfig = {
    ON_TRACK: {
      label: 'Sur la bonne voie',
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      gradient: 'from-emerald-400 to-green-500',
    },
    SLIGHT_DELAY: {
      label: 'Léger retard',
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      gradient: 'from-amber-400 to-orange-500',
    },
    AT_RISK: {
      label: 'Objectif à risque',
      color: 'text-red-600',
      bg: 'bg-red-100',
      gradient: 'from-red-400 to-pink-500',
    },
  };

  const config = statusConfig[goal.forecast.status];

  return (
    <div className="bg-white rounded-[20px] border border-[rgba(40,60,90,0.12)] p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
            style={{ boxShadow: '0 4px 16px rgba(52, 215, 255, 0.2)' }}
          >
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#0B1220]">{goal.name}</h3>
            <p className="text-sm text-[#56627A]">Projection automatique</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-xs text-[#56627A] mb-1">Progression</p>
          <p className="text-2xl font-semibold text-[#0B1220] tabular-nums">{progress.toFixed(0)}%</p>
        </div>
        <div>
          <p className="text-xs text-[#56627A] mb-1">Montant actuel</p>
          <p className="text-lg font-semibold text-[#0B1220] tabular-nums">{goal.current.toLocaleString()} €</p>
        </div>
        <div>
          <p className="text-xs text-[#56627A] mb-1">Objectif</p>
          <p className="text-lg font-semibold text-[#0B1220] tabular-nums">{goal.target.toLocaleString()} €</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#56627A]">Progression</span>
          <span className="text-sm font-medium text-[#0B1220]">{goal.current.toLocaleString()} € / {goal.target.toLocaleString()} €</span>
        </div>
        <div className="relative h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-500`}
            style={{
              width: `${progress}%`,
              boxShadow: '0 0 12px rgba(52, 215, 255, 0.4)',
            }}
          />
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F6F8FC]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#56627A]" />
            <span className="text-sm text-[#56627A]">Date estimée</span>
          </div>
          <span className="text-sm font-semibold text-[#0B1220]">{goal.forecast.estimatedDate}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F6F8FC]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#56627A]" />
            <span className="text-sm text-[#56627A]">Statut</span>
          </div>
          <span className={`text-sm font-semibold ${config.color} px-2 py-1 rounded-full ${config.bg}`}>
            {config.label}
          </span>
        </div>

        {goal.forecast.daysGap !== 0 && (
          <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F6F8FC]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#56627A]" />
              <span className="text-sm text-[#56627A]">Écart deadline</span>
            </div>
            <span className="text-sm font-semibold text-[#0B1220]">
              {goal.forecast.daysGap > 0 ? '+' : ''}{goal.forecast.daysGap} jours
            </span>
          </div>
        )}
      </div>

      <div className="p-4 rounded-[12px] bg-gradient-to-r from-[#34D7FF]/10 to-[#7C5CFF]/10 border border-[#34D7FF]/20">
        <p className="text-sm text-[#0B1220]">
          <span className="font-semibold">Conseil : </span>
          {goal.forecast.recommendation}
        </p>
      </div>
    </div>
  );
}
