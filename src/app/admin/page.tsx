import pool from '@/lib/db';
import { MonitorSmartphone, Users, CheckCircle, AlertTriangle, Edit } from 'lucide-react';
import DashboardFilters from './DashboardFilters';
import Link from 'next/link';
import ExportPdfButton from '@/components/ExportPdfButton';

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ q?: string, status?: string, dept?: string }> }) {
  const { q, status, dept } = await searchParams;

  const deptResult = await pool.query('SELECT * FROM departments ORDER BY dept_name ASC');
  const departments = deptResult.rows;

  const eqCountResult = await pool.query('SELECT COUNT(*) FROM equipments');
  const eqTotal = parseInt(eqCountResult.rows[0].count);

  const personnelCountResult = await pool.query('SELECT COUNT(*) FROM personnel');
  const personnelTotal = parseInt(personnelCountResult.rows[0].count);

  const eqActiveResult = await pool.query('SELECT COUNT(*) FROM equipments WHERE status = $1', ['ใช้งานได้']);
  const eqActive = parseInt(eqActiveResult.rows[0].count);

  const eqBrokenResult = await pool.query('SELECT COUNT(*) FROM equipments WHERE status != $1', ['ใช้งานได้']);
  const eqBroken = parseInt(eqBrokenResult.rows[0].count);

  // Build query for table
  let tableQuery = `
    SELECT e.*, p.first_name, p.last_name, p.title, d.dept_name 
    FROM equipments e
    LEFT JOIN personnel p ON e.owner_id = p.id
    LEFT JOIN departments d ON p.department_id = d.id
    WHERE 1=1
  `;
  let queryParams: any[] = [];
  let paramIndex = 1;

  if (q) {
    tableQuery += ` AND (e.asset_code ILIKE $${paramIndex} OR e.category ILIKE $${paramIndex} OR e.brand ILIKE $${paramIndex} OR e.location ILIKE $${paramIndex})`;
    queryParams.push(`%${q}%`);
    paramIndex++;
  }

  if (status) {
    tableQuery += ` AND e.status = $${paramIndex}`;
    queryParams.push(status);
    paramIndex++;
  }

  if (dept) {
    tableQuery += ` AND p.department_id = $${paramIndex}`;
    queryParams.push(dept);
    paramIndex++;
  }

  tableQuery += ` ORDER BY e.updated_at DESC LIMIT 100`;

  const equipmentsResult = await pool.query(tableQuery, queryParams);
  const equipments = equipmentsResult.rows;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">ภาพรวมระบบ (Dashboard)</h1>
        <ExportPdfButton data={equipments} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Card 1 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="p-4 rounded-full bg-blue-100 text-blue-600 mr-4">
            <MonitorSmartphone size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">อุปกรณ์ทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900">{eqTotal}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="p-4 rounded-full bg-green-100 text-green-600 mr-4">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">พร้อมใช้งาน</p>
            <p className="text-2xl font-bold text-gray-900">{eqActive}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="p-4 rounded-full bg-red-100 text-red-600 mr-4">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">ส่งซ่อม / ชำรุด</p>
            <p className="text-2xl font-bold text-gray-900">{eqBroken}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="p-4 rounded-full bg-purple-100 text-purple-600 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">บุคลากรทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900">{personnelTotal}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">รายการครุภัณฑ์</h2>
          <DashboardFilters departments={departments} />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสครุภัณฑ์</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท/ยี่ห้อ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">สถานที่</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">สังกัด</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">ผู้ครอบครอง</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equipments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">ไม่พบข้อมูลครุภัณฑ์</td>
                </tr>
              ) : (
                equipments.map((eq, index) => (
                  <tr key={eq.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{eq.asset_code}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{eq.category}</div>
                      <div className="text-gray-500 text-xs">{eq.brand || '-'} {eq.model || ''}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{eq.location}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{eq.dept_name || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {eq.first_name ? `${eq.title || ''}${eq.first_name} ${eq.last_name}` : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${eq.status === 'ใช้งานได้' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {eq.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/equipment/${eq.id}/edit`} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                        <Edit size={16} className="mr-1"/> แก้ไข
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
