import pool from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';

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
    <div className="min-h-screen bg-[#f4f6f8] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl mx-auto bg-white border border-gray-300 shadow-md">
        
        {/* Government Header */}
        <div className="flex flex-col items-center pt-10 pb-6 border-b-[3px] border-[#1e3a8a]">
          <Image src="/logo.png" alt="วิทยาลัยชุมชนสมุทรสาคร" width={100} height={100} className="object-contain mb-4" />
          <h1 className="text-2xl font-bold text-[#1e3a8a] tracking-wide text-center">วิทยาลัยชุมชนสมุทรสาคร</h1>
          <h2 className="text-lg font-semibold text-gray-700 mt-1">รายละเอียดทะเบียนครุภัณฑ์</h2>
        </div>
        
        {/* Content Section */}
        <div className="px-6 sm:px-10 py-8 space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-4">
            <div className="w-full sm:w-1/3 text-sm font-bold text-gray-600 mb-1 sm:mb-0">รหัสครุภัณฑ์</div>
            <div className="w-full sm:w-2/3 text-lg font-bold text-[#1e3a8a]">{eq.asset_code}</div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-4">
            <div className="w-full sm:w-1/3 text-sm font-bold text-gray-600 mb-1 sm:mb-0">ประเภท</div>
            <div className="w-full sm:w-2/3 text-base text-gray-800">{eq.category || '-'}</div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-4">
            <div className="w-full sm:w-1/3 text-sm font-bold text-gray-600 mb-1 sm:mb-0">ยี่ห้อ / รุ่น</div>
            <div className="w-full sm:w-2/3 text-base text-gray-800">
              {eq.brand || '-'} {eq.model ? ` / ${eq.model}` : ''}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-4">
            <div className="w-full sm:w-1/3 text-sm font-bold text-gray-600 mb-1 sm:mb-0">ผู้ครอบครอง</div>
            <div className="w-full sm:w-2/3 text-base text-gray-800">
              {eq.owner_id ? `${eq.first_name || ''} ${eq.last_name || ''}`.trim() : 'ส่วนกลาง'}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-4">
            <div className="w-full sm:w-1/3 text-sm font-bold text-gray-600 mb-1 sm:mb-0">สถานที่ตั้ง</div>
            <div className="w-full sm:w-2/3 text-base text-gray-800">{eq.location || '-'}</div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center pb-2">
            <div className="w-full sm:w-1/3 text-sm font-bold text-gray-600 mb-1 sm:mb-0">สถานะ</div>
            <div className="w-full sm:w-2/3 text-base text-gray-800">
              <span className={`inline-block px-3 py-1 text-sm font-semibold border ${eq.status === 'ใช้งานได้' ? 'border-green-600 text-green-700 bg-green-50' : 'border-gray-500 text-gray-700 bg-gray-50'}`}>
                {eq.status || '-'}
              </span>
            </div>
          </div>

        </div>

        {/* Official Footer */}
        <div className="bg-[#1e3a8a] px-6 py-4 text-center">
          <p className="text-sm text-white font-medium tracking-wide">
            งานเทคโนโลยีสารสนเทศ วิทยาลัยชุมชนสมุทรสาคร
          </p>
        </div>
      </div>
    </div>
  );
}