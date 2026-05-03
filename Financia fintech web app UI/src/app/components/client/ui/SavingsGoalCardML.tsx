import { useState } from 'react';
import { Target, TrendingUp, Calendar, Zap, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface SavingsGoalCardMLProps {
  goal: {
    id: string;
    name: string;
    current: number;
    target: number;
    deadline: string;
  };
  onGetForecast?: (goalId: string) => void;
  onGetAdvice?: (goalId: string) => void;
  forecast?: {
    estimatedDate: string;
    status: 'ON_TRACK' | 'SLIGHT_DELAY' | 'AT_RISK';
    daysGap: number;
    recommendation: string;
  };
  advice?: {
    verdict: 'EN_AVANCE' | 'STABLE' | 'A_RISQUE';
    summary: string;
    recommendations: string[];
  };
}

export function SavingsGoalCardML({
  goal,
  onGetForecast,
  onGetAdvice,
  forecast,
  advice
}: SavingsGoalCardMLProps) {
  const [showDetails, setShowDetails] = useState(false);
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
      label: 'À risque',
      color: 'text-red-600',
      bg: 'bg-red-100',
      gradient: 'from-red-400 to-pink-500',
    },
  };

  const verdictConfig = {
    EN_AVANCE: { label: 'En avance', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    STABLE: { label: 'Stable', color: 'text-blue-600', bg: 'bg-blue-100' },
    A_RISQUE: { label: 'À risque', color: 'text-amber-600', bg: 'bg-amber-100' },
  };

  const config = forecast ? statusConfig[forecast.status] : null;

  return (
    <div className="bg-white rounded-[20px] border border-[rgba(40,60,90,0.12)] p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${config?.gradient || 'from-blue-400 to-cyan-500'} flex items-center justify-center`}
            style={{ boxShadow: '0 4px 16px rgba(52, 215, 255, 0.2)' }}
          >
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#0B1220]">{goal.name}</h3>
            <p className="text-sm text-[#56627A]">Deadline: {goal.deadline}</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 rounded-lg hover:bg-[#F6F8FC] transition-colors"
        >
          {showDetails ? (
            <ChevronUp className="w-5 h-5 text-[#56627A]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#56627A]" />
          )}
        </button>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#56627A]">Progression</span>
          <span className="text-sm font-semibold text-[#0B1220]">
            {goal.current.toLocaleString()} € / {goal.target.toLocaleString()} €
          </span>
        </div>
        <div className="relative h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${config?.gradient || 'from-blue-400 to-cyan-500'} rounded-full transition-all duration-500`}
            style={{
              width: `${progress}%`,
              boxShadow: '0 0 12px rgba(52, 215, 255, 0.4)',
            }}
          />
        </div>
        <p className="text-xs text-[#56627A] mt-1">{progress.toFixed(1)}%</p>
      </div>

      {/* ML Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => onGetForecast?.(goal.id)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-[12px] border-2 border-[#E2E8F0] hover:border-[#34D7FF] hover:bg-[rgba(52,215,255,0.05)] transition-all text-sm font-medium text-[#0B1220]"
        >
          <Calendar className="w-4 h-4 text-[#34D7FF]" />
          Prévision
        </button>
        <button
          onClick={() => onGetAdvice?.(goal.id)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-[12px] bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] text-white hover:shadow-[0_0_16px_rgba(52,215,255,0.3)] transition-all text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Conseil IA
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="pt-4 border-t border-[rgba(40,60,90,0.12)] space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Forecast */}
          {forecast && (
            <div className="p-4 rounded-[12px] bg-[#F6F8FC] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#0B1220]">📊 Prévision</span>
                <span className={`text-xs px-2 py-1 rounded-full ${config?.bg} ${config?.color} font-medium`}>
                  {config?.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[#56627A] mb-1">Date estimée</p>
                  <p className="font-semibold text-[#0B1220]">{forecast.estimatedDate}</p>
                </div>
                <div>
                  <p className="text-xs text-[#56627A] mb-1">Écart</p>
                  <p className="font-semibold text-[#0B1220]">
                    {forecast.daysGap > 0 ? '+' : ''}{forecast.daysGap} jours
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-[rgba(40,60,90,0.08)]">
                <p className="text-xs text-[#56627A] mb-1">💡 Recommandation</p>
                <p className="text-sm text-[#0B1220]">{forecast.recommendation}</p>
              </div>
            </div>
          )}

          {/* Advice */}
          {advice && (
            <div className="p-4 rounded-[12px] bg-gradient-to-r from-[#34D7FF]/10 to-[#7C5CFF]/10 border border-[#34D7FF]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#0B1220]">🤖 Conseil personnalisé</span>
                <span className={`text-xs px-2 py-1 rounded-full ${verdictConfig[advice.verdict].bg} ${verdictConfig[advice.verdict].color} font-medium`}>
                  {verdictConfig[advice.verdict].label}
                </span>
              </div>
              <p className="text-sm text-[#0B1220] font-medium">{advice.summary}</p>
              <div className="space-y-2">
                {advice.recommendations.slice(0, 2).map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#34D7FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-semibold">{idx + 1}</span>
                    </div>
                    <p className="text-xs text-[#0B1220]">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
