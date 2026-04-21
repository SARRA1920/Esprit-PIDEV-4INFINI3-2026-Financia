import { Outlet } from 'react-router';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      <TopBar />
      <Sidebar />
      <main className="pt-16 lg:pl-64">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
