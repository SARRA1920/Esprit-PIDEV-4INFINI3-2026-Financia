import { Search, Bell, ChevronDown } from 'lucide-react';

export function AdminTopBar() {
  return (
    <header className="h-16 bg-[#111827] border-b border-[#1E293B] fixed top-0 right-0 left-64 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Rechercher clients, crédits, ID..."
              className="w-full bg-[#1E293B] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-2 py-1 rounded bg-[#1E293B] border border-[#334155]">
            <span className="text-xs font-mono text-[#EAB308]">SANDBOX</span>
          </div>

          <button className="relative p-2 rounded-lg hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full"></span>
          </button>

          <div className="h-6 w-px bg-[#334155]"></div>

          <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1E293B] transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
              <span className="text-white font-semibold text-sm">A</span>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-[#F8FAFC]">Admin User</p>
              <p className="text-xs text-[#64748B]">admin@financia.io</p>
            </div>
            <ChevronDown className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>
      </div>
    </header>
  );
}
