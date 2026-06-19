import pool from '@/lib/db';
import Link from 'next/link';
import SignatureManager from './SignatureManager';

export const dynamic = 'force-dynamic';

export default async function SignaturesPage() {
  const result = await pool.query(`
    SELECT id, title, first_name, last_name, position, signature_data 
    FROM personnel 
    WHERE position LIKE '%พัสดุ%'
    ORDER BY id ASC
  `);
  
  const officers = result.rows;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">จัดการลายเซ็นเจ้าหน้าที่พัสดุ</h1>
            <p className="text-gray-500 mt-1">ตั้งค่าลายเซ็นประจำตัว เพื่อใช้สำหรับการรับคืนพัสดุแบบ 1-Click</p>
          </div>
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">
            &larr; กลับหน้าแอดมิน
          </Link>
        </div>
        
        <SignatureManager officers={officers} />
      </div>
    </div>
  );
}
