import { NavLink } from 'react-router';
import { Home, CreditCard, Receipt, PiggyBank, MoreHorizontal } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/credit', label: 'Crédit', icon: CreditCard },
  { path: '/remboursements', label: 'Paiements', icon: Receipt },
  { path: '/savings', label: 'Savings', icon: PiggyBank },
  { path: '/contrats', label: 'Plus', icon: MoreHorizontal },
];

export function MobileBottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-[18px] border-t border-[rgba(40,60,90,0.12)] pb-safe"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-[14px] transition-all duration-300 relative ${
                isActive ? 'text-[#0B1220]' : 'text-[#56627A]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-[14px] bg-gradient-to-r from-[rgba(52,215,255,0.12)] to-[rgba(124,92,255,0.12)]"
                    style={{
                      boxShadow: '0 0 12px rgba(52, 215, 255, 0.2)',
                    }}
                  />
                )}
                <item.icon
                  className="w-5 h-5 relative z-10"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-xs font-medium relative z-10">{item.label}</span>
                {isActive && (
                  <div
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF]"
                    style={{
                      boxShadow: '0 -2px 8px rgba(52, 215, 255, 0.5)',
                    }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
