import pool from '@/lib/db';
import BorrowList from '@/app/admin/borrow/BorrowList';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function KioskBorrowDashboard() {
  const availableEquipmentResult = await pool.query(`
    SELECT id, asset_code, category, brand, model, location 
    FROM equipments 
    WHERE status = 'ว่าง'
    ORDER BY asset_code ASC
  `);
  const availableEquipments = availableEquipmentResult.rows;

  const personnelResult = await pool.query('SELECT * FROM personnel ORDER BY first_name ASC');
  const personnel = personnelResult.rows;

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-blue-800 text-white p-6 rounded-xl shadow-lg">
        <div>
          <h1 className="text-3xl font-bold">Kiosk ยืม-คืนพัสดุ</h1>
          <p className="text-blue-200 mt-1">หน้าจอสำหรับเจ้าหน้าที่พัสดุ (iPad)</p>
        </div>
        <Link href="/admin" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition font-medium">
          กลับหน้าแอดมิน
        </Link>
      </div>
      
      <BorrowList availableEquipments={availableEquipments} personnel={personnel} />
    </div>
  );
}
