import { NavLink } from 'react-router';
import {
  Home,
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
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/credit', label: 'Mon crédit', icon: CreditCard },
  { path: '/remboursements', label: 'Remboursements', icon: Receipt },
  { path: '/savings', label: 'Savings', icon: PiggyBank },
  { path: '/contrats', label: 'Contrats', icon: FileText },
  { path: '/formation', label: 'Formation', icon: GraduationCap },
  { path: '/partenaires', label: 'Partenaires', icon: Handshake },
  { path: '/design-system', label: 'Design System', icon: Palette },
];

const supportItem = { path: '#', label: 'Support', icon: HelpCircle };

export function FuturisticSidebar() {
  return (
    <aside
      className="hidden lg:flex lg:flex-col w-64 border-r border-[rgba(40,60,90,0.12)] fixed left-0 top-16 bottom-0 backdrop-blur-[14px]"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.6) 100%)',
      }}
    >
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-[18px] transition-all duration-300 relative ${
                isActive
                  ? 'text-[#0B1220] font-medium'
                  : 'text-[#56627A] hover:bg-[rgba(52,215,255,0.08)] hover:text-[#0B1220]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <>
                    <div
                      className="absolute inset-0 rounded-[18px] bg-gradient-to-r from-[rgba(52,215,255,0.15)] to-[rgba(124,92,255,0.15)]"
                      style={{
                        boxShadow: '0 0 16px rgba(52, 215, 255, 0.2)',
                      }}
                    />
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-[#34D7FF] to-[#7C5CFF]"
                      style={{
                        boxShadow: '0 0 12px rgba(52, 215, 255, 0.5)',
                      }}
                    />
                  </>
                )}
                <item.icon className="w-5 h-5 relative z-10" strokeWidth={isActive ? 2.5 : 2} />
                <span className="relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-[rgba(40,60,90,0.12)]">
        <a
          href={supportItem.path}
          className="flex items-center gap-3 px-4 py-3 rounded-[18px] text-[#56627A] hover:bg-[rgba(52,215,255,0.08)] hover:text-[#0B1220] transition-all duration-300"
        >
          <supportItem.icon className="w-5 h-5" />
          <span>{supportItem.label}</span>
        </a>
      </div>
    </aside>
  );
}
