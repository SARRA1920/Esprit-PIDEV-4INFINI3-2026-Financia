import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  GraduationCap,
  DollarSign,
  Settings,
  ChevronLeft,
  Shield,
  Palette
} from 'lucide-react';
import { useState } from 'react';

const navSections = [
  {
    items: [
      { path: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: 'Opérations',
    items: [
      { path: '/admin/clients', label: 'Utilisateurs', icon: Users },
      { path: '/admin/credits', label: 'Crédits & dossiers', icon: CreditCard },
      { path: '/admin/remboursements', label: 'Remboursements', icon: Receipt },
      { path: '/admin/formation', label: 'Formation (LMS)', icon: GraduationCap },
      { path: '/admin/paiements', label: 'Paiements / Stripe', icon: DollarSign },
    ],
  },
  {
    title: 'Système',
    items: [
      { path: '/admin/settings', label: 'Paramètres', icon: Settings },
      { path: '/admin/audit', label: 'Audit', icon: Shield },
      { path: '/admin/ui-kit', label: 'UI Kit', icon: Palette },
    ],
  },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-[#0B1220] border-r border-[#1E293B] transition-all duration-200 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E293B]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EAB308] to-[#CA8A04] flex items-center justify-center">
              <span className="text-[#0B1220] font-bold text-sm">F</span>
            </div>
            <div>
              <span className="text-[#F8FAFC] font-semibold text-sm">Financia</span>
              <span className="text-[#64748B] text-xs block">Admin</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-[#1E293B] text-[#64748B] hover:text-[#F8FAFC] transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="p-3 space-y-6 overflow-y-auto h-[calc(100vh-4rem)]">
        {navSections.map((section, idx) => (
          <div key={idx}>
            {section.title && !collapsed && (
              <div className="px-3 mb-2">
                <span className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
                  {section.title}
                </span>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#10B981]/10 text-[#10B981] font-medium'
                        : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
