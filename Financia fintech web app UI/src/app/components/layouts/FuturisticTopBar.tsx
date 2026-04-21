import { Search, LogOut } from 'lucide-react';

export function FuturisticTopBar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-[18px] border-b border-[rgba(40,60,90,0.12)]"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.65) 100%)',
      }}
    >
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[14px] flex items-center justify-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #34D7FF 0%, #7C5CFF 100%)',
                boxShadow: '0 0 20px rgba(52, 215, 255, 0.3)',
              }}
            >
              <span className="text-white font-bold text-xl tracking-tight">F</span>
            </div>
            <span
              className="text-xl font-semibold tracking-tight"
              style={{
                background: 'linear-gradient(90deg, #34D7FF, #7C5CFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Financia
            </span>
          </div>

          <div
            className="hidden md:flex items-center gap-2 rounded-[16px] px-4 py-2 w-96 border border-[rgba(40,60,90,0.12)] backdrop-blur-[10px]"
            style={{ background: 'rgba(255, 255, 255, 0.5)' }}
          >
            <Search className="w-4 h-4 text-[#56627A]" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent border-none outline-none text-sm w-full text-[#0B1220] placeholder:text-[#56627A]"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-3 px-4 py-2 rounded-[16px] hover:bg-[rgba(52,215,255,0.08)] transition-all duration-300 cursor-pointer"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #34D7FF 0%, #7C5CFF 100%)',
                boxShadow: '0 0 12px rgba(52, 215, 255, 0.25)',
              }}
            >
              <span className="text-white font-semibold text-sm">S</span>
            </div>
            <div className="hidden md:block">
              <p className="text-xs text-[#56627A]">Bonjour,</p>
              <p className="text-sm font-medium text-[#0B1220]">Salma</p>
            </div>
          </div>

          <button
            className="px-4 py-2 rounded-full text-sm font-medium text-[#56627A] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] transition-all duration-300 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Déconnexion</span>
          </button>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(52,215,255,0.3) 50%, transparent 100%)',
        }}
      />
    </header>
  );
}
