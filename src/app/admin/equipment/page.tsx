import pool from '@/lib/db';
import Link from 'next/link';
import { PlusCircle, Search, Edit } from 'lucide-react';
import ExportQrPdfButton from '@/components/ExportQrPdfButton';

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
          <ExportQrPdfButton data={equipments} />
          <Link href="/admin/equipment/new" className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition">
            <PlusCircle size={20} />
            <span>เพิ่มครุภัณฑ์ใหม่</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="ค้นหารหัสครุภัณฑ์, ยี่ห้อ, หมวดหมู่..." 
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสครุภัณฑ์</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท/ยี่ห้อ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานที่</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equipments.map((eq) => (
                <tr key={eq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{eq.asset_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{eq.category}</div>
                    <div className="text-gray-500 text-xs">{eq.brand}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${eq.status === 'ใช้งานได้' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {eq.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <Link href={`/admin/equipment/${eq.id}/edit`} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                      <Edit size={16} className="mr-1"/> แก้ไข
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
