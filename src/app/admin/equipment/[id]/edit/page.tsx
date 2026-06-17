import pool from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { updateEquipment } from './actions';
import { notFound, redirect } from 'next/navigation';

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const result = await pool.query('SELECT * FROM equipments WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    notFound();
  }
  
  const eq = result.rows[0];

  const personnelResult = await pool.query('SELECT * FROM personnel ORDER BY first_name ASC');
  const personnel = personnelResult.rows;

  async function handleUpdate(formData: FormData) {
    'use server';
    const result = await updateEquipment(id, formData);
    if (result.success) {
      redirect('/admin/equipment');
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/admin/equipment" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">แก้ไขข้อมูลครุภัณฑ์</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form action={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสครุภัณฑ์ *</label>
              <input type="text" name="asset_code" defaultValue={eq.asset_code} required className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" readOnly />
              <p className="text-xs text-gray-500 mt-1">ไม่อนุญาตให้แก้รหัสครุภัณฑ์ หากผิดต้องลบและสร้างใหม่</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทอุปกรณ์ *</label>
              <input type="text" name="category" defaultValue={eq.category} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อ (Brand)</label>
              <input type="text" name="brand" defaultValue={eq.brand} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รุ่น (Model)</label>
              <input type="text" name="model" defaultValue={eq.model} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่ตั้ง *</label>
              <input type="text" name="location" defaultValue={eq.location} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ผู้ครอบครอง (Owner)</label>
              <select name="owner_id" defaultValue={eq.owner_id || ""} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">-- ไม่ระบุ (ส่วนกลาง) --</option>
                {personnel.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title}{p.first_name} {p.last_name} ({p.position})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <select name="status" defaultValue={eq.status} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="ใช้งานได้">ใช้งานได้</option>
                <option value="ชำรุด">ชำรุด</option>
                <option value="ส่งซ่อม">ส่งซ่อม</option>
                <option value="แทงจำหน่าย">แทงจำหน่าย</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Link href="/admin/equipment" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium">
              ยกเลิก
            </Link>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center space-x-2">
              <Save size={18} />
              <span>บันทึกการเปลี่ยนแปลง</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}