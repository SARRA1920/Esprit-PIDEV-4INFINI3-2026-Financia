import { Outlet } from 'react-router';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#0B1220]">
      <AdminSidebar />
      <AdminTopBar />
      <main className="ml-64 mt-16 p-6">
        <Outlet />
      </main>
    </div>
  );
}
