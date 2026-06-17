import pool from '@/lib/db';
import Link from 'next/link';
import { Edit, Filter } from 'lucide-react';
import ExportRepairPdfButton from '@/components/ExportRepairPdfButton';

export const dynamic = 'force-dynamic';

export default async function AdminRepairsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams;

  // Build query
  let query = `
    SELECT r.*, e.asset_code, e.category, e.brand, e.model, e.location 
    FROM repair_requests r
    JOIN equipments e ON r.equipment_id = e.id
    WHERE 1=1
  `;
  const queryParams: any[] = [];
  
  if (month) {
    const [y, m] = month.split('-');
    if (y && m) {
      query += ` AND EXTRACT(YEAR FROM r.reported_at) = $1 AND EXTRACT(MONTH FROM r.reported_at) = $2`;
      queryParams.push(y, m);
    }
  }
  
  query += ` ORDER BY r.reported_at DESC`;

  const result = await pool.query(query, queryParams);
  const repairs = result.rows;

  // Get current date for default month value
  const now = new Date();
  const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">รายการแจ้งซ่อม / ปัญหาการใช้งาน</h1>
        <ExportRepairPdfButton data={repairs} month={month} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
          <Filter size={20} className="text-gray-500" />
          <span className="font-medium text-gray-700">กรองตามเดือน:</span>
          <form className="flex items-center gap-3">
            <input 
              type="month" 
              name="month" 
              defaultValue={month || currentMonthValue}
              className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 font-medium text-sm">
              กรองข้อมูล
            </button>
            {month && (
              <Link href="/admin/repairs" className="text-sm text-gray-500 hover:text-gray-700 underline">
                แสดงทั้งหมด
              </Link>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่แจ้ง</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อผู้แจ้ง</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสครุภัณฑ์</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อาการเสีย</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ค่าใช้จ่าย</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {repairs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">ไม่มีรายการแจ้งซ่อม</td>
                </tr>
              ) : (
                repairs.map((r) => {
                  let statusBadge = 'bg-yellow-100 text-yellow-800'; // รอดำเนินการ
                  if (r.status === 'กำลังซ่อม') statusBadge = 'bg-blue-100 text-blue-800';
                  if (r.status === 'ส่งซ่อมภายนอก') statusBadge = 'bg-purple-100 text-purple-800';
                  if (r.status === 'เสร็จสิ้น') statusBadge = 'bg-green-100 text-green-800';
                  if (r.status === 'ยกเลิก') statusBadge = 'bg-red-100 text-red-800';

                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(r.reported_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {r.reporter_name || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        <Link href={`/admin/equipment/${r.equipment_id}/edit`}>{r.asset_code}</Link>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {r.issue_description}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-red-600">
                        {r.repair_cost ? `฿${Number(r.repair_cost).toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
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
