import { logout } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, MonitorSmartphone, LogOut, Users, Wrench, ClipboardCheck, FileSignature } from 'lucide-react';
import Image from 'next/image';

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
        <div className="p-6 border-b border-blue-800 flex items-center space-x-3">
          <Image src="/logo.png" alt="Logo" width={40} height={40} className="bg-white rounded-full p-1" />
          <div>
            <h1 className="text-xl font-bold tracking-wider">SMKCC ASSET</h1>
            <p className="text-blue-300 text-xs mt-1">Admin Dashboard</p>
          </div>
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
          <Link href="/admin/personnel" className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-blue-800 transition">
            <Users size={20} />
            <span>จัดการบุคลากร</span>
          </Link>
          <Link href="/admin/repairs" className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-blue-800 transition">
            <Wrench size={20} />
            <span>รายการแจ้งซ่อม</span>
          </Link>
          <Link href="/admin/audit" className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-blue-800 transition">
            <ClipboardCheck size={20} />
            <span>จัดการการตรวจนับ</span>
          </Link>
          <Link href="/admin/borrow" className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-blue-800 transition">
            <FileSignature size={20} />
            <span>ยืม-คืนพัสดุ</span>
          </Link>
          <Link href="/admin/personnel/signatures" className="flex items-center space-x-3 px-4 py-3 ml-4 rounded-md hover:bg-blue-800 transition text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <span>ตั้งค่าลายเซ็นรับคืนพัสดุ</span>
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
      <main className="flex-1 p-6 md:p-10 flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        
        {/* Footer Credit */}
        <footer className="mt-auto pt-8 pb-4 text-center border-t border-gray-200">
          <p className="text-sm text-gray-500 font-medium">
            พัฒนาระบบโดย งานเทคโนโลยีสารสนเทศ วิทยาลัยชุมชนสมุทรสาคร
          </p>
        </footer>
      </main>
    </div>
  );
}
