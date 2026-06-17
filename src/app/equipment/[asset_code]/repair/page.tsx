import pool from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { submitRepairRequest } from './actions';

export default async function RepairRequestPage({ params }: { params: Promise<{ asset_code: string }> }) {
  const { asset_code } = await params;

  // Fetch equipment details with owner info
  const result = await pool.query(
    `SELECT e.*, p.first_name, p.last_name, p.title 
     FROM equipments e
     LEFT JOIN personnel p ON e.owner_id = p.id
     WHERE e.asset_code = $1`, 
    [asset_code]
  );

  if (result.rows.length === 0) {
    notFound();
  }

  const eq = result.rows[0];

  return (
    <div className="min-h-screen bg-[#f4f6f8] py-8 px-4 sm:px-6 lg:px-8 font-sans flex flex-col items-center">
      <div className="w-full max-w-xl mb-4">
        <Link href={`/equipment/${asset_code}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 transition font-medium">
          <ArrowLeft size={18} className="mr-1" /> ย้อนกลับ
        </Link>
      </div>

      <div className="w-full max-w-xl bg-white border border-gray-300 shadow-md rounded-lg overflow-hidden">
        {/* Government Header */}
        <div className="flex flex-col items-center pt-8 pb-6 border-b border-gray-200 bg-gray-50">
          <Image src="/logo.png" alt="วิทยาลัยชุมชนสมุทรสาคร" width={80} height={80} className="object-contain mb-3" />
          <h1 className="text-xl font-bold text-[#1e3a8a] tracking-wide text-center">แบบฟอร์มแจ้งซ่อม / แจ้งปัญหา</h1>
          <p className="text-gray-500 mt-1">รหัสครุภัณฑ์: <span className="font-semibold text-gray-800">{eq.asset_code}</span></p>
        </div>
        
        {/* Form Section */}
        <div className="px-6 sm:px-10 py-8">
          <form action={submitRepairRequest} className="space-y-6">
            <input type="hidden" name="equipment_id" value={eq.id} />
            <input type="hidden" name="asset_code" value={eq.asset_code} />

            {eq.first_name ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อผู้แจ้ง</label>
                <input 
                  type="text" 
                  name="reporter_name" 
                  value={`${eq.title || ''}${eq.first_name} ${eq.last_name}`} 
                  readOnly 
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-md text-gray-600 focus:outline-none cursor-not-allowed" 
                />
              </div>
            ) : (
              <div>
                <label htmlFor="reporter_name" className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อผู้แจ้ง <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="reporter_name" 
                  name="reporter_name" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder:text-gray-400 appearance-none" 
                  placeholder="เช่น สมหมาย ใจดี" 
                  style={{ color: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                />
                <p className="text-xs text-gray-500 mt-1">เครื่องส่วนกลาง กรุณาระบุชื่อผู้แจ้งซ่อม</p>
              </div>
            )}

            <div>
              <label htmlFor="issue_description" className="block text-sm font-medium text-gray-700 mb-2">
                ระบุอาการเสีย / ปัญหาการใช้งานเบื้องต้น <span className="text-red-500">*</span>
              </label>
              <textarea
                id="issue_description"
                name="issue_description"
                rows={5}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder:text-gray-400 appearance-none"
                placeholder="ตัวอย่าง: เปิดไม่ติด, หน้าจอกระพริบ, เครื่องพิมพ์ไม่ทำงาน..."
                style={{ color: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              ยืนยันการแจ้งซ่อม
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
