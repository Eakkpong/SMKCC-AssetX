import pool from '@/lib/db';
import Link from 'next/link';
import { Edit } from 'lucide-react';

export default async function AdminRepairsPage() {
  const result = await pool.query(`
    SELECT r.*, e.asset_code, e.category, e.brand, e.model, e.location 
    FROM repair_requests r
    JOIN equipments e ON r.equipment_id = e.id
    ORDER BY r.reported_at DESC
  `);
  
  const repairs = result.rows;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">รายการแจ้งซ่อม / ปัญหาการใช้งาน</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่แจ้ง</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสครุภัณฑ์</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อาการเสียเบื้องต้น</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานที่ตั้ง</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {repairs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">ไม่มีรายการแจ้งซ่อม</td>
                </tr>
              ) : (
                repairs.map((r) => {
                  let statusBadge = 'bg-yellow-100 text-yellow-800'; // รอดำเนินการ
                  if (r.status === 'กำลังซ่อม') statusBadge = 'bg-blue-100 text-blue-800';
                  if (r.status === 'เสร็จสิ้น') statusBadge = 'bg-green-100 text-green-800';
                  if (r.status === 'ยกเลิก') statusBadge = 'bg-red-100 text-red-800';

                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(r.reported_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        <Link href={`/admin/equipment/${r.equipment_id}/edit`}>{r.asset_code}</Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {r.issue_description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {r.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/admin/repairs/${r.id}/edit`} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                          <Edit size={16} className="mr-1"/> จัดการ
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
