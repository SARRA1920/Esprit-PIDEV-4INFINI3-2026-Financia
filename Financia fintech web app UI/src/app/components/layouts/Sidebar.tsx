import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  PiggyBank,
  FileText,
  GraduationCap,
  Handshake,
  HelpCircle,
  Palette
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/credit', label: 'Crédit', icon: CreditCard },
  { path: '/remboursements', label: 'Remboursements', icon: Receipt },
  { path: '/savings', label: 'Savings', icon: PiggyBank },
  { path: '/contrats', label: 'Contrats', icon: FileText },
  { path: '/formation', label: 'Formation', icon: GraduationCap },
  { path: '/partenaires', label: 'Partenaires', icon: Handshake },
  { path: '/design-system', label: 'Design System', icon: Palette },
];

const supportItem = { path: '#', label: 'Support / Contact', icon: HelpCircle };

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-[#E2E8F0] fixed left-0 top-16 bottom-0">
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-[#0F2747] text-white shadow-sm'
                  : 'text-[#64748B] hover:bg-[#F6F8FC] hover:text-[#0F2747]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-[#E2E8F0]">
        <a
          href={supportItem.path}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[#64748B] hover:bg-[#F6F8FC] hover:text-[#0F2747] transition-all duration-200"
        >
          <supportItem.icon className="w-5 h-5" />
          <span>{supportItem.label}</span>
        </a>
      </div>
    </aside>
  );
}
