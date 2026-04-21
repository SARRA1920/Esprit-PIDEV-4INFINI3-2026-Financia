import { Search, LogOut } from 'lucide-react';

export function TopBar() {
  return (
    <header className="bg-white border-b border-[#E2E8F0] fixed top-0 left-0 right-0 z-50 h-16">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F2747] to-[#1a3a5f] flex items-center justify-center">
              <span className="text-[#F5B301] font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-semibold text-[#0F2747]">Financia</span>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-[#F6F8FC] rounded-2xl px-4 py-2 w-80">
            <Search className="w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent border-none outline-none text-sm w-full text-[#0F172A] placeholder:text-[#64748B]"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl hover:bg-[#F6F8FC] transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5B301] to-[#e6a700] flex items-center justify-center">
              <span className="text-white font-semibold text-sm">S</span>
            </div>
            <div className="hidden md:block">
              <p className="text-xs text-[#64748B]">Bonjour,</p>
              <p className="text-sm font-medium text-[#0F2747]">Salma</p>
            </div>
          </div>

          <button className="p-2 rounded-2xl hover:bg-[#F6F8FC] text-[#64748B] hover:text-[#EF4444] transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
