import pool from '@/lib/db';
import Link from 'next/link';
import { PlusCircle, Search, Edit, Download } from 'lucide-react';
import ExportStickerGuidePdfButton from '@/components/ExportStickerGuidePdfButton';
import EquipmentTable from './EquipmentTable';

export default async function AdminEquipmentPage() {
  const result = await pool.query(`
    SELECT e.*, p.first_name, p.last_name, p.title, d.dept_name 
    FROM equipments e
    LEFT JOIN personnel p ON e.owner_id = p.id
    LEFT JOIN departments d ON p.department_id = d.id
    ORDER BY e.updated_at DESC LIMIT 500
  `);
  const equipments = result.rows;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">จัดการครุภัณฑ์</h1>
        <div className="flex space-x-3">
          <a href="/api/export/inventory" className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition" download>
            <Download size={20} />
            <span>ดาวน์โหลดทะเบียนคุม (Excel)</span>
          </a>
          <ExportStickerGuidePdfButton data={equipments} />
          <Link href="/admin/equipment/new" className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition">
            <PlusCircle size={20} />
            <span>เพิ่มครุภัณฑ์ใหม่</span>
          </Link>
        </div>
      </div>

      <EquipmentTable initialEquipments={JSON.parse(JSON.stringify(equipments))} />
    </div>
  );
}
