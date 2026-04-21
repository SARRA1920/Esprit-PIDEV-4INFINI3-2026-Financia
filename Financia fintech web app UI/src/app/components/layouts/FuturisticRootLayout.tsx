import { Outlet } from 'react-router';
import { FuturisticTopBar } from './FuturisticTopBar';
import { FuturisticSidebar } from './FuturisticSidebar';
import { MobileBottomNav } from './MobileBottomNav';

export function FuturisticRootLayout() {
  return (
    <div
      className="min-h-screen relative"
      style={{
        background: 'radial-gradient(circle at 20% 50%, rgba(52, 215, 255, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(124, 92, 255, 0.08) 0%, transparent 50%), #F7FAFF',
      }}
    >
      <FuturisticTopBar />
      <FuturisticSidebar />
      <main className="pt-16 lg:pl-64 pb-20 lg:pb-0">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
