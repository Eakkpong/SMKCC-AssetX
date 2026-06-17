"use client";

import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { THSarabunFont } from '@/lib/fonts/THSarabun';
import { logoBase64 } from '@/lib/logoBase64';

export default function ExportRepairPdfButton({ data, month }: { data: any[], month?: string }) {
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
    let title = 'รายงานการแจ้งซ่อม วิทยาลัยชุมชนสมุทรสาคร';
    if (month) {
      const [y, m] = month.split('-');
      const thMonth = new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
      title += ` (ประจำเดือน ${thMonth})`;
    }
    doc.text(title, 32, 19);

    // Prepare table data
    const head = [['ลำดับ', 'วันที่แจ้ง', 'ชื่อผู้แจ้ง', 'รหัสครุภัณฑ์', 'อาการเสีย', 'เวลาที่ซ่อมเสร็จ', 'สถานะ']];
    const body = data.map((r, index) => [
      (index + 1).toString(),
      new Date(r.reported_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      r.reporter_name || '-',
      r.asset_code || '-',
      r.issue_description || '-',
      r.resolved_at ? new Date(r.resolved_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
      r.status || '-'
    ]);

    const printDate = `วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}`;

    autoTable(doc, {
      head: head,
      body: body,
      startY: 28,
      styles: {
        font: 'THSarabun',
        fontSize: 10,
        cellPadding: 1.5,
      },
      headStyles: {
        fillColor: [30, 58, 138], // #1e3a8a
        textColor: 255,
        fontStyle: 'normal',
        font: 'THSarabun',
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
    doc.save(`repair-report-${month || 'all'}.pdf`);
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
