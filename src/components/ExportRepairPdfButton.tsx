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

    // Split data into two groups
    const externalRepairs = data.filter(r => r.status === 'ส่งซ่อมภายนอก' || (r.repair_cost && Number(r.repair_cost) > 0));
    const internalRepairs = data.filter(r => !externalRepairs.includes(r));

    let currentY = 28;
    const printDate = `วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}`;

    // Table 1: Internal Repairs (ไม่มีค่าใช้จ่าย)
    if (internalRepairs.length > 0) {
      doc.setFontSize(16);
      doc.text('รายการที่ไม่มีค่าใช้จ่าย (เจ้าหน้าที่ซ่อมเอง)', 14, currentY);
      currentY += 4;

      const head1 = [['ลำดับ', 'วันที่แจ้ง', 'ชื่อผู้แจ้ง', 'รหัสครุภัณฑ์', 'อาการเสีย', 'เวลาที่ซ่อมเสร็จ', 'สถานะ']];
      const body1 = internalRepairs.map((r, index) => [
        (index + 1).toString(),
        new Date(r.reported_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        r.reporter_name || '-',
        r.asset_code || '-',
        r.issue_description || '-',
        r.resolved_at ? new Date(r.resolved_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
        r.status || '-'
      ]);

      autoTable(doc, {
        head: head1,
        body: body1,
        startY: currentY,
        styles: { font: 'THSarabun', fontSize: 10, cellPadding: 1.5 },
        headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'normal', font: 'THSarabun' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        didDrawPage: function (data) {
          doc.setFontSize(10); doc.setFont('THSarabun');
          const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
          doc.text(printDate, pageWidth - 14, pageHeight - 10, { align: 'right' });
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Table 2: External Repairs (มีค่าใช้จ่าย)
    if (externalRepairs.length > 0) {
      doc.setFontSize(16);
      doc.text('รายการที่มีค่าใช้จ่าย (ส่งซ่อมภายนอก)', 14, currentY);
      currentY += 4;

      const head2 = [['ลำดับ', 'วันที่แจ้ง', 'รหัสครุภัณฑ์', 'อาการเสีย', 'ร้านที่ส่งซ่อม', 'เวลาที่ซ่อมเสร็จ', 'ค่าใช้จ่าย (บาท)', 'สถานะ']];
      let totalCost = 0;

      const body2 = externalRepairs.map((r, index) => {
        const cost = Number(r.repair_cost) || 0;
        totalCost += cost;
        return [
          (index + 1).toString(),
          new Date(r.reported_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          r.asset_code || '-',
          r.issue_description || '-',
          r.external_shop || '-',
          r.resolved_at ? new Date(r.resolved_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
          cost > 0 ? cost.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-',
          r.status || '-'
        ];
      });

      // Add Total Row
      body2.push(['', '', '', '', '', 'รวมค่าใช้จ่ายทั้งหมด', totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2 }), '']);

      autoTable(doc, {
        head: head2,
        body: body2,
        startY: currentY,
        styles: { font: 'THSarabun', fontSize: 10, cellPadding: 1.5 },
        headStyles: { fillColor: [107, 33, 168], textColor: 255, fontStyle: 'normal', font: 'THSarabun' }, // purple-800
        alternateRowStyles: { fillColor: [250, 245, 255] },
        willDrawCell: function(data) {
          if (data.row.index === body2.length - 1) {
            doc.setFont('THSarabun');
            if (data.column.index === 5 || data.column.index === 6) {
              doc.setTextColor(220, 38, 38); // red-600
            }
          }
        },
        didDrawPage: function (data) {
          if (internalRepairs.length === 0) {
             doc.setFontSize(10); doc.setFont('THSarabun');
             const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
             const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
             doc.text(printDate, pageWidth - 14, pageHeight - 10, { align: 'right' });
          }
        }
      });
    }

    if (internalRepairs.length === 0 && externalRepairs.length === 0) {
      doc.setFontSize(14);
      doc.text('ไม่มีรายการแจ้งซ่อมในเดือนนี้', 14, currentY);
    }

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
