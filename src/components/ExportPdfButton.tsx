"use client";

import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { THSarabunFont } from '@/lib/fonts/THSarabun';

export default function ExportPdfButton({ data }: { data: any[] }) {
  function handleExport() {
    const doc = new jsPDF('landscape');

    // Add Thai Font
    doc.addFileToVFS('THSarabun.ttf', THSarabunFont);
    doc.addFont('THSarabun.ttf', 'THSarabun', 'normal');
    doc.setFont('THSarabun');

    // Header
    doc.setFontSize(18);
    doc.text('รายงานครุภัณฑ์คอมพิวเตอร์ วิทยาลัยชุมชนสมุทรสาคร', 14, 15);

    // Prepare table data
    // ลำดับที่ | รหัสครุภัณฑ์ | ประเภท/ยี่ห้อ | สถานที่ตั้ง | สังกัด | ผู้ครอบครอง | สถานะ
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

    autoTable(doc, {
      head: head,
      body: body,
      startY: 20,
      styles: {
        font: 'THSarabun',
        fontSize: 14,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [30, 58, 138], // #1e3a8a
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
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
