import pool from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Monitor, MapPin, User, ShieldCheck } from 'lucide-react';

export default async function EquipmentPage({ params }: { params: Promise<{ asset_code: string }> }) {
  const { asset_code } = await params;
  
  // Fetch equipment details
  const result = await pool.query(
    `SELECT e.*, p.first_name, p.last_name 
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-white px-6 py-6 text-center border-b border-gray-100 flex flex-col items-center justify-center">
          <Image src="/logo.png" alt="วิทยาลัยชุมชนสมุทรสาคร" width={120} height={120} className="object-contain" />
        </div>
        <div className="bg-blue-600 px-6 py-6 text-center">
          <Monitor className="mx-auto h-12 w-12 text-white mb-4" />
          <h1 className="text-2xl font-bold text-white">{eq.category || 'ไม่ระบุประเภทอุปกรณ์'}</h1>
          <p className="text-blue-100 mt-2">รหัสครุภัณฑ์: {eq.asset_code}</p>
        </div>
        
        <div className="px-6 py-6 space-y-6">
          <div className="flex items-start">
            <MapPin className="h-6 w-6 text-gray-400 mr-3 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500">สถานที่ตั้ง (Location)</p>
              <p className="text-lg text-gray-900">{eq.location || 'ไม่ระบุสถานที่ตั้ง'}</p>
            </div>
          </div>

          <div className="flex items-start">
            <User className="h-6 w-6 text-gray-400 mr-3 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500">ผู้ครอบครอง (Owner)</p>
              <p className="text-lg text-gray-900">
                {eq.owner_id ? `${eq.first_name || ''} ${eq.last_name || ''}`.trim() : 'ส่วนกลาง (ไม่มีผู้ครอบครอง)'}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <ShieldCheck className="h-6 w-6 text-gray-400 mr-3 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500">สถานะอุปกรณ์ (Status)</p>
              <span className="inline-flex items-center px-3 py-1 mt-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {eq.status || 'ไม่ระบุสถานะ'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Section Inside Card */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium tracking-wide">
            งานเทคโนโลยีสารสนเทศ วิทยาลัยชุมชนสมุทรสาคร
          </p>
        </div>
      </div>
    </div>
  );
}