'use client';

import { Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export default function ExportSingleQrPdfButton({ equipment }: { equipment: any }) {
  
  const handleExport = async () => {
    try {
      // 1. Generate QR Code image
      const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://smkcc-asset-x.vercel.app'}/equipment/${equipment.asset_code}`;
      const qrDataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: 'H', margin: 1, width: 300 });

      // 2. Load Logo
      const logoImg = new Image();
      logoImg.src = '/logo.png';
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
      });

      // 3. Create PDF (38x55 mm standard sticker size, matching the old A4 grid proportions)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [38, 55]
      });

      // Draw Border (matching 1px solid #000)
      doc.setLineWidth(0.3);
      doc.rect(1, 1, 36, 53);

      // Draw Logo (approx 45px width = 12mm)
      doc.addImage(logoImg, 'PNG', 13, 3, 12, 12);

      // Draw QR Code (approx 80px width = 22mm)
      doc.addImage(qrDataUrl, 'PNG', 8, 16, 22, 22);

      // Draw Asset Code
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      // Center the text
      doc.text(equipment.asset_code || '-', 19, 44, { align: 'center' });

      // 4. Save
      doc.save(`QR_${equipment.asset_code}.pdf`);
    } catch (error) {
      console.error('Error generating QR PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้างสติ๊กเกอร์ QR Code');
    }
  };

  return (
    <button 
      onClick={handleExport}
      className="text-gray-600 hover:text-gray-900 inline-flex items-center"
      title="ดาวน์โหลด PDF สติ๊กเกอร์ QR Code แบบเดิม"
    >
      <Printer size={16} className="mr-1"/> พิมพ์ QR
    </button>
  );
}
