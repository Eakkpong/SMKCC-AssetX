import pool from '@/lib/db';
import BorrowList from './BorrowList';

export const dynamic = 'force-dynamic';

export default async function BorrowPage() {
  // Fetch available equipment
  const eqResult = await pool.query(`
    SELECT id, asset_code, category, brand, model, location 
    FROM equipments 
    WHERE status = 'ว่าง' OR owner_id IS NULL 
    ORDER BY asset_code ASC
  `);
  // Note: we fetch where status='ว่าง' to be strict, but just in case some are 'ใช้งานได้' and have no owner, maybe we show them?
  // User explicitly wanted 'ว่าง' status. So let's stick to status='ว่าง'.
  const availableEquipmentResult = await pool.query(`
    SELECT id, asset_code, category, brand, model, location 
    FROM equipments 
    WHERE status = 'ว่าง'
    ORDER BY asset_code ASC
  `);
  const availableEquipments = availableEquipmentResult.rows;

  // Fetch personnel
  const personnelResult = await pool.query('SELECT * FROM personnel ORDER BY first_name ASC');
  const personnel = personnelResult.rows;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ยืม-คืนพัสดุ (Paperless)</h1>
          <p className="text-gray-500 mt-1">จัดการเอกสารใบยืมและลายเซ็นดิจิทัลสำหรับ iPad</p>
        </div>
      </div>
      
      <BorrowList availableEquipments={availableEquipments} personnel={personnel} />
    </div>
  );
}
