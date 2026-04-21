import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: LucideIcon;
  iconColor?: string;
}

export function KPICard({ label, value, change, icon: Icon, iconColor = '#10B981' }: KPICardProps) {
  return (
    <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6 hover:border-[#10B981]/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-[#94A3B8] mb-1">{label}</p>
          <p className="text-3xl font-semibold text-[#F8FAFC] tabular-nums tracking-tight">{value}</p>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-2 text-sm">
          <span
            className={
              change.trend === 'up'
                ? 'text-[#10B981]'
                : change.trend === 'down'
                ? 'text-[#EF4444]'
                : 'text-[#94A3B8]'
            }
          >
            {change.trend === 'up' ? '↑' : change.trend === 'down' ? '↓' : '→'} {change.value}
          </span>
          <span className="text-[#64748B]">vs dernier mois</span>
        </div>
      )}
    </div>
  );
}
