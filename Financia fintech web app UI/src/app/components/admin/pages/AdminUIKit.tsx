import { StatusBadge } from '../ui/StatusBadge';
import { KPICard } from '../ui/KPICard';
import { TrendingUp, Mail, Check, AlertCircle } from 'lucide-react';

export function AdminUIKit() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#F8FAFC] tracking-tight mb-1">UI Components</h1>
        <p className="text-sm text-[#94A3B8]">Design system de l'admin Financia</p>
      </div>

      {/* Colors */}
      <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">Couleurs</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Navy Dark', hex: '#0B1220', desc: 'Background' },
            { name: 'Slate', hex: '#1E293B', desc: 'Surface' },
            { name: 'Emerald', hex: '#10B981', desc: 'Success' },
            { name: 'Gold', hex: '#EAB308', desc: 'Accent' },
            { name: 'Amber', hex: '#F59E0B', desc: 'Warning' },
            { name: 'Red', hex: '#EF4444', desc: 'Danger' },
            { name: 'Blue', hex: '#3B82F6', desc: 'Info' },
            { name: 'Slate Text', hex: '#94A3B8', desc: 'Muted' },
          ].map((color) => (
            <div key={color.name} className="space-y-2">
              <div
                className="h-20 rounded-lg border border-[#334155]"
                style={{ backgroundColor: color.hex }}
              />
              <div>
                <p className="text-sm font-medium text-[#F8FAFC]">{color.name}</p>
                <p className="text-xs text-[#64748B] font-mono">{color.hex}</p>
                <p className="text-xs text-[#64748B]">{color.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">Typographie</h2>
        <div className="space-y-4">
          <div className="p-4 bg-[#111827] rounded-lg">
            <p className="text-xs text-[#64748B] mb-2">Display (Plus Jakarta Sans / Geist)</p>
            <h1 className="text-[#F8FAFC] tracking-tight">Tableau de bord</h1>
          </div>
          <div className="p-4 bg-[#111827] rounded-lg">
            <p className="text-xs text-[#64748B] mb-2">Body (Inter)</p>
            <p className="text-[#F8FAFC]">Gestion du portefeuille crédit</p>
          </div>
          <div className="p-4 bg-[#111827] rounded-lg">
            <p className="text-xs text-[#64748B] mb-2">Mono (IBM Plex Mono / JetBrains Mono)</p>
            <p className="text-[#F8FAFC] font-mono tabular-nums">3,280,000 €</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors text-sm font-medium">
            Primary
          </button>
          <button className="px-4 py-2 bg-[#1E293B] border border-[#334155] text-[#F8FAFC] rounded-lg hover:border-[#10B981]/30 transition-colors text-sm font-medium">
            Secondary
          </button>
          <button className="px-4 py-2 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] rounded-lg transition-colors text-sm font-medium">
            Ghost
          </button>
          <button className="p-2 bg-[#1E293B] border border-[#334155] text-[#F8FAFC] rounded-lg hover:border-[#10B981]/30 transition-colors">
            <Mail className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Pills */}
      <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">Status Pills</h2>
        <div className="flex flex-wrap gap-3">
          <StatusBadge status="PENDING" />
          <StatusBadge status="APPROVED" />
          <StatusBadge status="ACTIVE" />
          <StatusBadge status="PAID" />
          <StatusBadge status="OVERDUE" />
          <StatusBadge status="CLOSED" />
          <StatusBadge status="FAILED" />
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">Form Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Text Input</label>
            <input
              type="text"
              placeholder="Entrer une valeur..."
              className="w-full bg-[#111827] border border-[#334155] rounded-lg px-4 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Select</label>
            <select className="w-full bg-[#111827] border border-[#334155] rounded-lg px-4 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent">
              <option>Sélectionner...</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">KPI Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            label="Encours total"
            value="3.28M €"
            change={{ value: '+8.2%', trend: 'up' }}
            icon={TrendingUp}
            iconColor="#10B981"
          />
          <KPICard
            label="Nouvelles demandes"
            value="28"
            change={{ value: '+5', trend: 'up' }}
            icon={TrendingUp}
            iconColor="#F59E0B"
          />
          <KPICard
            label="Échéances en retard"
            value="7"
            change={{ value: '-3', trend: 'down' }}
            icon={AlertCircle}
            iconColor="#EF4444"
          />
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">Empty State</h2>
        <div className="bg-[#111827] rounded-lg border border-[#334155] border-dashed p-12 text-center">
          <div className="w-12 h-12 rounded-lg bg-[#1E293B] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-[#64748B]" />
          </div>
          <p className="text-[#F8FAFC] font-medium mb-1">Aucun résultat</p>
          <p className="text-sm text-[#94A3B8]">Aucune donnée disponible pour cette vue</p>
        </div>
      </div>

      {/* Toast Messages */}
      <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">Toast Messages</h2>
        <div className="space-y-3 max-w-md">
          <div className="flex items-start gap-3 p-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg">
            <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#10B981]">Succès</p>
              <p className="text-sm text-[#94A3B8]">Crédit approuvé avec succès</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg">
            <div className="w-5 h-5 rounded-full bg-[#EF4444] flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#EF4444]">Erreur</p>
              <p className="text-sm text-[#94A3B8]">Échec de la validation du dossier</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
