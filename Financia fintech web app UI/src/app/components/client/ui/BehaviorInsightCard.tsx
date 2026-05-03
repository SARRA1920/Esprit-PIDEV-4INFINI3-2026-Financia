import { Activity, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface BehaviorInsightCardProps {
  insights: {
    regularityScore: number;
    avgDeposit: number;
    depositFrequency: string;
    monthComparison: {
      deposits: { current: number; previous: number };
      withdrawals: { current: number; previous: number };
    };
    alert?: string;
  };
}

export function BehaviorInsightCard({ insights }: BehaviorInsightCardProps) {
  const depositTrend = insights.monthComparison.deposits.current > insights.monthComparison.deposits.previous ? 'up' : 'down';
  const withdrawalTrend = insights.monthComparison.withdrawals.current > insights.monthComparison.withdrawals.previous ? 'up' : 'down';

  return (
    <div className="bg-white rounded-[20px] border border-[rgba(40,60,90,0.12)] p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center"
          style={{ boxShadow: '0 4px 16px rgba(124, 92, 255, 0.2)' }}
        >
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#0B1220]">Analyse comportementale</h3>
          <p className="text-sm text-[#56627A]">Vos habitudes d'épargne ce mois-ci</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-[12px] bg-[#F6F8FC]">
          <p className="text-xs text-[#56627A] mb-2">Régularité</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-semibold text-[#0B1220] tabular-nums">{insights.regularityScore}</p>
            <p className="text-sm text-[#56627A] mb-1">/100</p>
          </div>
          <div className="mt-2 w-full bg-[#E2E8F0] rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] h-1.5 rounded-full"
              style={{ width: `${insights.regularityScore}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-[12px] bg-[#F6F8FC]">
          <p className="text-xs text-[#56627A] mb-2">Dépôt moyen</p>
          <p className="text-2xl font-semibold text-[#0B1220] tabular-nums">{insights.avgDeposit} €</p>
          <p className="text-xs text-[#56627A] mt-1">{insights.depositFrequency}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <p className="text-sm font-medium text-[#0B1220]">Évolution vs mois précédent :</p>

        <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F6F8FC]">
          <span className="text-sm text-[#56627A]">Dépôts</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#0B1220] tabular-nums">
              {insights.monthComparison.deposits.current}
            </span>
            {depositTrend === 'up' ? (
              <div className="flex items-center gap-1 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">
                  +{insights.monthComparison.deposits.current - insights.monthComparison.deposits.previous}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {insights.monthComparison.deposits.current - insights.monthComparison.deposits.previous}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F6F8FC]">
          <span className="text-sm text-[#56627A]">Retraits</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#0B1220] tabular-nums">
              {insights.monthComparison.withdrawals.current}
            </span>
            {withdrawalTrend === 'up' ? (
              <div className="flex items-center gap-1 text-amber-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">
                  +{insights.monthComparison.withdrawals.current - insights.monthComparison.withdrawals.previous}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-emerald-600">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {insights.monthComparison.withdrawals.current - insights.monthComparison.withdrawals.previous}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {insights.alert && (
        <div className="p-4 rounded-[12px] bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900 mb-1">Alerte douce</p>
            <p className="text-sm text-amber-700">{insights.alert}</p>
          </div>
        </div>
      )}
    </div>
  );
}
