import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SMKCC AssetX</h1>
        <p className="text-gray-500 mb-10">ระบบเบิกจ่ายและจัดการครุภัณฑ์</p>
        
        <div className="space-y-4">
          <Link 
            href="/kiosk/borrow" 
            className="block w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition shadow-lg shadow-blue-200"
          >
            หน้าจอให้บริการ (Kiosk)
          </Link>
          
          <Link 
            href="/admin" 
            className="block w-full py-4 px-4 bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition"
          >
            ระบบหลังบ้าน (Admin)
          </Link>
        </div>
      </div>
    </div>
  );
}
