import { logout } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, MonitorSmartphone, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  async function handleLogout() {
    'use server';
    await logout();
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#1e3a8a] text-white flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold tracking-wider">SMKCC ASSET</h1>
          <p className="text-blue-300 text-xs mt-1">Admin Dashboard</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-blue-800 transition">
            <LayoutDashboard size={20} />
            <span>ภาพรวม (Dashboard)</span>
          </Link>
          <Link href="/admin/equipment" className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-blue-800 transition">
            <MonitorSmartphone size={20} />
            <span>จัดการครุภัณฑ์</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-blue-800">
          <form action={handleLogout}>
            <button type="submit" className="flex items-center space-x-3 w-full px-4 py-2 text-left text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition">
              <LogOut size={20} />
              <span>ออกจากระบบ</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
