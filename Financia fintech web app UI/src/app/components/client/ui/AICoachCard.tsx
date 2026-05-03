import { Sparkles, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface AICoachCardProps {
  savingsGoalId?: string;
  advice: {
    verdict: 'EN_AVANCE' | 'STABLE' | 'A_RISQUE';
    summary: string;
    recommendations: string[];
    confidence: number;
    context: string;
  };
}

export function AICoachCard({ advice }: AICoachCardProps) {
  const verdictConfig = {
    EN_AVANCE: {
      icon: CheckCircle,
      color: 'from-emerald-400 to-green-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      label: 'En avance',
    },
    STABLE: {
      icon: TrendingUp,
      color: 'from-blue-400 to-cyan-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      label: 'Stable',
    },
    A_RISQUE: {
      icon: AlertCircle,
      color: 'from-amber-400 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      label: 'À risque',
    },
  };

  const config = verdictConfig[advice.verdict];
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-[20px] border border-[rgba(40,60,90,0.12)] p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${config.color} flex items-center justify-center`}
            style={{ boxShadow: '0 4px 16px rgba(52, 215, 255, 0.2)' }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#0B1220]">Mon coach épargne</h3>
            <p className="text-sm text-[#56627A]">Conseil personnalisé par IA</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full ${config.bg} ${config.text} text-sm font-medium flex items-center gap-2`}>
          <Icon className="w-4 h-4" />
          {config.label}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[#0B1220] font-medium mb-2">{advice.summary}</p>
        <p className="text-sm text-[#56627A]">{advice.context}</p>
      </div>

      <div className="space-y-3 mb-6">
        <p className="text-sm font-medium text-[#0B1220]">Recommandations :</p>
        {advice.recommendations.map((rec, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 rounded-[12px] bg-[#F6F8FC]">
            <div className="w-5 h-5 rounded-full bg-[#34D7FF] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-semibold">{idx + 1}</span>
            </div>
            <p className="text-sm text-[#0B1220]">{rec}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[rgba(40,60,90,0.12)]">
        <div className="flex items-center gap-2">
          <div className="w-full max-w-[120px] bg-[#E2E8F0] rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] h-2 rounded-full"
              style={{ width: `${advice.confidence}%` }}
            />
          </div>
          <span className="text-xs text-[#56627A]">Confiance {advice.confidence}%</span>
        </div>
        <button className="text-sm text-[#34D7FF] hover:text-[#7C5CFF] font-medium">
          Obtenir un nouveau conseil
        </button>
      </div>
    </div>
  );
}
