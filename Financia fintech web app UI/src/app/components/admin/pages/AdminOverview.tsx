import { KPICard } from '../ui/KPICard';
import { StatusBadge } from '../ui/StatusBadge';
import { TrendingUp, CreditCard, AlertCircle, FileText, GraduationCap, Users } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const portfolioData = [
  { month: 'Jan', amount: 2400000 },
  { month: 'Fév', amount: 2550000 },
  { month: 'Mar', amount: 2780000 },
  { month: 'Avr', amount: 2920000 },
  { month: 'Mai', amount: 3100000 },
  { month: 'Juin', amount: 3280000 },
];

const statusData = [
  { name: 'ACTIVE', value: 145, color: '#10B981' },
  { name: 'PENDING', value: 28, color: '#F59E0B' },
  { name: 'APPROVED', value: 12, color: '#3B82F6' },
  { name: 'CLOSED', value: 89, color: '#64748B' },
];

const recentActivity = [
  { time: '14:32', actor: 'Admin User', action: 'Approved crédit', entity: 'CR-2026-0482', status: 'APPROVED' },
  { time: '14:18', actor: 'Agent Dubois', action: 'Updated remboursement', entity: 'RB-2026-1243', status: 'PAID' },
  { time: '13:55', actor: 'System', action: 'Marked overdue', entity: 'RB-2026-0891', status: 'OVERDUE' },
  { time: '13:42', actor: 'Admin User', action: 'Created course', entity: 'Formation #18', status: 'ACTIVE' },
  { time: '13:15', actor: 'Agent Martin', action: 'Added client', entity: 'CL-2026-0234', status: 'PENDING' },
  { time: '12:58', actor: 'System', action: 'Payment received', entity: 'RB-2026-1102', status: 'PAID' },
];

export function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#F8FAFC] tracking-tight mb-1">Tableau de bord</h1>
        <p className="text-sm text-[#94A3B8]">Vue d'ensemble des opérations Financia</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <KPICard
          label="Encours total"
          value="3,28M €"
          change={{ value: '+8.2%', trend: 'up' }}
          icon={TrendingUp}
          iconColor="#10B981"
        />
        <KPICard
          label="Crédits actifs"
          value="145"
          change={{ value: '+12', trend: 'up' }}
          icon={CreditCard}
          iconColor="#3B82F6"
        />
        <KPICard
          label="Échéances en retard"
          value="7"
          change={{ value: '-3', trend: 'down' }}
          icon={AlertCircle}
          iconColor="#EF4444"
        />
        <KPICard
          label="Nouvelles demandes"
          value="28"
          change={{ value: '+5', trend: 'up' }}
          icon={FileText}
          iconColor="#F59E0B"
        />
        <KPICard
          label="Cours actifs (LMS)"
          value="18"
          change={{ value: '+2', trend: 'up' }}
          icon={GraduationCap}
          iconColor="#EAB308"
        />
        <KPICard
          label="Apprenants inscrits"
          value="342"
          change={{ value: '+24', trend: 'up' }}
          icon={Users}
          iconColor="#10B981"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-[#1E293B] rounded-xl border border-[#334155] p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#F8FAFC] mb-1">Évolution du portefeuille crédit</h3>
            <p className="text-sm text-[#94A3B8]">Encours total des 6 derniers mois</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={portfolioData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748B" style={{ fontSize: 12 }} />
              <YAxis
                stroke="#64748B"
                style={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#F8FAFC',
                }}
                formatter={(value: number) => [`${(value / 1000000).toFixed(2)}M €`, 'Encours']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#F8FAFC] mb-1">Répartition par statut</h3>
            <p className="text-sm text-[#94A3B8]">Distribution des crédits</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#F8FAFC',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[#94A3B8]">{item.name}</span>
                </div>
                <span className="text-[#F8FAFC] font-mono tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-[#334155]">
        <div className="p-6 border-b border-[#334155]">
          <h3 className="text-lg font-semibold text-[#F8FAFC]">Activité récente</h3>
          <p className="text-sm text-[#94A3B8]">Dernières actions système et utilisateurs</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#111827] sticky top-0">
              <tr>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Heure</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Acteur</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Action</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Entité</th>
                <th className="text-left text-xs font-medium text-[#94A3B8] px-6 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {recentActivity.map((activity, idx) => (
                <tr key={idx} className="hover:bg-[#273549] transition-colors">
                  <td className="px-6 py-4 text-sm text-[#94A3B8] font-mono tabular-nums">{activity.time}</td>
                  <td className="px-6 py-4 text-sm text-[#F8FAFC]">{activity.actor}</td>
                  <td className="px-6 py-4 text-sm text-[#94A3B8]">{activity.action}</td>
                  <td className="px-6 py-4 text-sm text-[#F8FAFC] font-mono">{activity.entity}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={activity.status as any} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
