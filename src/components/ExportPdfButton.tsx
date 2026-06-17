"use client";

import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { THSarabunFont } from '@/lib/fonts/THSarabun';
import { logoBase64 } from '@/lib/logoBase64';

export default function ExportPdfButton({ data }: { data: any[] }) {
  function handleExport() {
    const doc = new jsPDF('landscape');

    // Add Thai Font
    doc.addFileToVFS('THSarabun.ttf', THSarabunFont);
    doc.addFont('THSarabun.ttf', 'THSarabun', 'normal');
    doc.setFont('THSarabun');

    // Logo
    doc.addImage(logoBase64, 'PNG', 14, 8, 15, 15);

    // Header Text
    doc.setFontSize(22);
    doc.text('รายงานครุภัณฑ์คอมพิวเตอร์ วิทยาลัยชุมชนสมุทรสาคร', 32, 19);

    // Prepare table data
    const head = [['ลำดับที่', 'รหัสครุภัณฑ์', 'ประเภท/ยี่ห้อ', 'สถานที่ตั้ง', 'สังกัด', 'ผู้ครอบครอง', 'สถานะ']];
    const body = data.map((eq, index) => [
      (index + 1).toString(),
      eq.asset_code || '-',
      `${eq.category || ''} / ${eq.brand || ''} ${eq.model || ''}`,
      eq.location || '-',
      eq.dept_name || '-',
      eq.first_name ? `${eq.title || ''}${eq.first_name} ${eq.last_name}` : '-',
      eq.status || '-'
    ]);

    const printDate = `วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}`;

    autoTable(doc, {
      head: head,
      body: body,
      startY: 28,
      styles: {
        font: 'THSarabun',
        fontSize: 11,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [30, 58, 138], // #1e3a8a
        textColor: 255,
        fontStyle: 'bold',
        font: 'THSarabun',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 25 },
      didDrawPage: function (data) {
        // Footer (Print Date)
        doc.setFontSize(11);
        doc.setFont('THSarabun');
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        
        // Align text to right
        doc.text(printDate, pageWidth - 14, pageHeight - 10, { align: 'right' });
      }
    });

    // Save
    doc.save('equipment-report.pdf');
  }

  return (
    <button 
      onClick={handleExport}
      className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition"
    >
      <Download size={20} />
      <span>ดาวน์โหลด PDF</span>
    </button>
  );
}
