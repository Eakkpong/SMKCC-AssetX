'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';

export default function PrintQrClient({ equipment, url }: { equipment: any, url: string }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Slight delay to ensure fonts and styles are loaded
    setIsReady(true);
    setTimeout(() => {
      window.print();
    }, 800);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 print:bg-white print:min-h-0 p-4">
      
      {/* Hide controls when printing */}
      <div className="mb-6 print:hidden flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">ตัวอย่างหน้าตาสติ๊กเกอร์ QR Code</h1>
        <button 
          onClick={() => window.print()}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition"
        >
          <Printer size={20} />
          <span>สั่งพิมพ์ (Print)</span>
        </button>
        <p className="text-sm text-gray-500 mt-2">คำแนะนำ: ตั้งค่า Margin เป็น None และเปิด Background graphics ก่อนพิมพ์</p>
      </div>

      {/* The Printable Sticker Area */}
      {isReady && (
        <div className="bg-white p-4 rounded-xl shadow-lg print:shadow-none print:p-0 flex flex-col items-center justify-center border-2 border-black w-[80mm] h-[80mm]">
          <h2 className="text-lg font-bold text-center mb-1">SMKCC ASSET</h2>
          <div className="bg-white p-1 rounded-lg mb-1">
            <QRCodeSVG value={url} size={130} level="H" />
          </div>
          <div className="mt-1 text-center w-full px-2">
            <p className="font-bold text-md leading-tight break-all">{equipment.asset_code}</p>
            <p className="text-sm truncate">{equipment.category}</p>
            <p className="text-xs text-gray-600 truncate">{equipment.brand || ''} {equipment.model || ''}</p>
          </div>
        </div>
      )}
      
    </div>
  );
}
