import pool from '@/lib/db';
import { MonitorSmartphone, Users, CheckCircle, AlertTriangle } from 'lucide-react';

export default async function AdminDashboard() {
  const eqCountResult = await pool.query('SELECT COUNT(*) FROM equipments');
  const eqTotal = parseInt(eqCountResult.rows[0].count);

  const personnelCountResult = await pool.query('SELECT COUNT(*) FROM personnel');
  const personnelTotal = parseInt(personnelCountResult.rows[0].count);

  const eqActiveResult = await pool.query('SELECT COUNT(*) FROM equipments WHERE status = $1', ['ใช้งานได้']);
  const eqActive = parseInt(eqActiveResult.rows[0].count);

  const eqBrokenResult = await pool.query('SELECT COUNT(*) FROM equipments WHERE status != $1', ['ใช้งานได้']);
  const eqBroken = parseInt(eqBrokenResult.rows[0].count);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">ภาพรวมระบบ (Dashboard)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  );
}
