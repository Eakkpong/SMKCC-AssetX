"use client";

import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { THSarabunFont } from '@/lib/fonts/THSarabun';

export default function ExportStickerGuidePdfButton({ data }: { data: any[] }) {
  function handleExport() {
    const doc = new jsPDF('portrait');

    // Add Thai Font
    doc.addFileToVFS('THSarabun.ttf', THSarabunFont);
    doc.addFont('THSarabun.ttf', 'THSarabun', 'normal');
    doc.setFont('THSarabun');

    // Header Text
    doc.setFontSize(22);
    doc.text('ตารางรายละเอียดครุภัณฑ์สำหรับติดสติ๊กเกอร์', 14, 20);

    // Prepare table data
    const head = [['รหัสครุภัณฑ์', 'สถานที่ตั้ง', 'ผู้ครอบครอง']];
    const body = data.map((eq) => [
      eq.asset_code || '-',
      eq.location || '-',
      eq.first_name ? `${eq.title || ''}${eq.first_name} ${eq.last_name}` : '-'
    ]);

    const printDate = `วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}`;

    autoTable(doc, {
      head: head,
      body: body,
      startY: 28,
      styles: {
        font: 'THSarabun',
        fontSize: 14, // Larger font size for easy reading while applying stickers
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [30, 58, 138], // #1e3a8a
        textColor: 255,
        fontStyle: 'normal',
        font: 'THSarabun',
        fontSize: 14,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 25 },
      didDrawPage: function (data) {
        // Footer (Print Date)
        doc.setFontSize(10);
        doc.setFont('THSarabun');
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        
        // Align text to right
        doc.text(printDate, pageWidth - 14, pageHeight - 10, { align: 'right' });
      }
    });

    // Save
    doc.save('sticker-guide.pdf');
  }

  return (
    <button 
      onClick={handleExport}
      className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition"
    >
      <FileText size={20} />
      <span>พิมพ์ข้อมูลติด QR</span>
    </button>
  );
}
