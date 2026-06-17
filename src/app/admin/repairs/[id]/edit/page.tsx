import pool from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { updateRepairStatus } from './actions';

export default async function AdminEditRepairPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await pool.query(`
    SELECT r.*, e.asset_code, e.category, e.brand, e.model, e.location 
    FROM repair_requests r
    JOIN equipments e ON r.equipment_id = e.id
    WHERE r.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    notFound();
  }

  const r = result.rows[0];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link href="/admin/repairs" className="text-gray-500 hover:text-gray-700 mr-4">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">จัดการรายการแจ้งซ่อม #{r.id}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">ข้อมูลอุปกรณ์</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">รหัสครุภัณฑ์</p>
            <p className="font-semibold text-gray-900">{r.asset_code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">ประเภท / ยี่ห้อ</p>
            <p className="font-semibold text-gray-900">{r.category} / {r.brand} {r.model}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">สถานที่ตั้ง</p>
            <p className="font-semibold text-gray-900">{r.location}</p>
          </div>
        </div>
      </div>

      {r.rating_overall && (
        <div className="bg-white rounded-lg shadow-sm border border-yellow-200 overflow-hidden mb-6">
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <h2 className="text-lg font-bold text-yellow-800">ผลการประเมินความพึงพอใจ</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <p className="text-xs text-yellow-700 mb-1">ความรวดเร็ว</p>
                <div className="text-xl font-bold text-yellow-600">{r.rating_speed} ⭐</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <p className="text-xs text-yellow-700 mb-1">คุณภาพ</p>
                <div className="text-xl font-bold text-yellow-600">{r.rating_quality} ⭐</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <p className="text-xs text-yellow-700 mb-1">มารยาท/บริการ</p>
                <div className="text-xl font-bold text-yellow-600">{r.rating_service} ⭐</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <p className="text-xs text-yellow-700 mb-1">ภาพรวม</p>
                <div className="text-xl font-bold text-yellow-600">{r.rating_overall} ⭐</div>
              </div>
            </div>
            {r.feedback && (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-1">ข้อเสนอแนะเพิ่มเติม:</p>
                <p className="text-sm text-gray-800">{r.feedback}</p>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-3 text-right">
              ประเมินเมื่อ: {new Date(r.rated_at).toLocaleString('th-TH')}
            </p>
          </div>
        </div>
      )}

      <form action={updateRepairStatus} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <input type="hidden" name="repair_id" value={r.id} />
        <input type="hidden" name="equipment_id" value={r.equipment_id} />
        
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">รายละเอียดการแจ้งซ่อม</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">เวลาที่แจ้ง</p>
            <p className="font-semibold text-gray-900">
              {new Date(r.reported_at).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">ชื่อผู้แจ้ง</p>
            <p className="font-semibold text-gray-900">
              {r.reporter_name || '-'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">อาการเสียเบื้องต้น (จากผู้แจ้ง)</p>
            <div className="p-3 bg-red-50 border border-red-100 rounded-md text-red-900 whitespace-pre-wrap">
              {r.issue_description}
            </div>
          </div>

          <hr className="border-gray-200" />

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">สถานะการซ่อม</label>
            <select
              id="status"
              name="status"
              defaultValue={r.status}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="รอดำเนินการ">รอดำเนินการ</option>
              <option value="กำลังซ่อม">กำลังซ่อม</option>
              <option value="ส่งซ่อมภายนอก">ส่งซ่อมภายนอก</option>
              <option value="เสร็จสิ้น">เสร็จสิ้น (เปลี่ยนสถานะเครื่องเป็น "ใช้งานได้")</option>
              <option value="ยกเลิก">ยกเลิกรายการ</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">หากเลือก "เสร็จสิ้น" สถานะของอุปกรณ์นี้จะถูกเปลี่ยนกลับเป็น "ใช้งานได้" ทันที</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
            <div>
              <label htmlFor="external_shop" className="block text-sm font-medium text-gray-700 mb-1">ข้อมูลร้านที่ส่งซ่อม (เฉพาะกรณีส่งซ่อมภายนอก)</label>
              <input
                type="text"
                id="external_shop"
                name="external_shop"
                defaultValue={r.external_shop || ''}
                placeholder="เช่น ร้าน JIB, ร้านซ่อมคอมพิวเตอร์หน้าปากซอย"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="repair_cost" className="block text-sm font-medium text-gray-700 mb-1">ค่าใช้จ่าย (บาท)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                id="repair_cost"
                name="repair_cost"
                defaultValue={r.repair_cost || ''}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin_notes" className="block text-sm font-medium text-gray-700 mb-1">บันทึกการปฏิบัติงาน (สำหรับเจ้าหน้าที่)</label>
            <textarea
              id="admin_notes"
              name="admin_notes"
              rows={4}
              defaultValue={r.admin_notes || ''}
              placeholder="ระบุรายละเอียดการซ่อมแซม อะไหล่ที่ใช้ หรือหมายเหตุอื่นๆ"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <Link href="/admin/repairs" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 mr-3 font-medium">
              ยกเลิก
            </Link>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
              บันทึกข้อมูล
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
