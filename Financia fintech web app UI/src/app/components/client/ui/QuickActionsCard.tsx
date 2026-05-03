import { Plus, Send, Target, Sparkles } from 'lucide-react';

interface QuickActionsCardProps {
  actions: Array<{
    label: string;
    icon: 'deposit' | 'transfer' | 'goal' | 'advice';
    primary?: boolean;
  }>;
}

export function QuickActionsCard({ actions }: QuickActionsCardProps) {
  const iconMap = {
    deposit: Plus,
    transfer: Send,
    goal: Target,
    advice: Sparkles,
  };

  return (
    <div className="bg-white rounded-[20px] border border-[rgba(40,60,90,0.12)] p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#0B1220] mb-4">Que faire maintenant ?</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action, idx) => {
          const Icon = iconMap[action.icon];
          return (
            <button
              key={idx}
              className={`flex items-center gap-3 p-4 rounded-[16px] border-2 transition-all duration-300 text-left group ${
                action.primary
                  ? 'bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] border-transparent text-white shadow-[0_0_20px_rgba(52,215,255,0.3)] hover:shadow-[0_0_28px_rgba(52,215,255,0.4)]'
                  : 'border-[#E2E8F0] hover:border-[#34D7FF] hover:bg-[rgba(52,215,255,0.05)]'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                  action.primary
                    ? 'bg-white/20'
                    : 'bg-gradient-to-br from-[#34D7FF] to-[#7C5CFF]'
                }`}
              >
                <Icon className={`w-6 h-6 ${action.primary ? 'text-white' : 'text-white'}`} />
              </div>
              <span className={`font-medium ${action.primary ? 'text-white' : 'text-[#0B1220]'}`}>
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
