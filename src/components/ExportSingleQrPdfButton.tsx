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

      // 2. Create PDF (50x50 mm standard sticker)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [50, 50]
      });

      // 3. Draw content
      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('SMKCC ASSET', 25, 7, { align: 'center' });

      // QR Code
      doc.addImage(qrDataUrl, 'PNG', 10, 9, 30, 30);

      // Asset Code
      doc.setFontSize(9);
      doc.text(equipment.asset_code || '-', 25, 43, { align: 'center' });

      // Category (Optional, use standard font as THSarabun might require setup)
      // Since it's a simple sticker, keeping it strictly English/Numbers for maximum compatibility in this small area is safer,
      // but let's try to add the brand/model if available.
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      const brandText = `${equipment.brand || ''} ${equipment.model || ''}`.trim();
      if (brandText) {
        doc.text(brandText.substring(0, 30), 25, 47, { align: 'center' });
      }

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
      title="ดาวน์โหลด PDF สติ๊กเกอร์ QR Code"
    >
      <Printer size={16} className="mr-1"/> พิมพ์ QR
    </button>
  );
}
