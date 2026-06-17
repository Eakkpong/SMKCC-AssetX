"use client";

import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { THSarabunFont } from '@/lib/fonts/THSarabun';
import { logoBase64 } from '@/lib/logoBase64';

export default function ExportSatisfactionPdfButton({ data, month }: { data: any[], month?: string }) {
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
    let title = 'รายงานผลการประเมินความพึงพอใจการให้บริการซ่อมบำรุง';
    if (month) {
      const [y, m] = month.split('-');
      const thMonth = new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
      title += ` (ประจำเดือน ${thMonth})`;
    }
    doc.text(title, 32, 19);

    // Filter only repairs that have been rated
    const ratedRepairs = data.filter(r => r.rating_overall != null);

    let currentY = 28;
    const printDate = `วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}`;

    if (ratedRepairs.length > 0) {
      const head = [['ลำดับ', 'วันที่ประเมิน', 'รหัสครุภัณฑ์', 'รายการ/อาการเสีย', 'ความรวดเร็ว', 'คุณภาพ', 'บริการ', 'ภาพรวม', 'เฉลี่ย', 'ข้อเสนอแนะ']];
      
      let totalSpeed = 0, totalQuality = 0, totalService = 0, totalOverall = 0;

      const body = ratedRepairs.map((r, index) => {
        totalSpeed += r.rating_speed || 0;
        totalQuality += r.rating_quality || 0;
        totalService += r.rating_service || 0;
        totalOverall += r.rating_overall || 0;
        
        const avgScore = ((r.rating_speed + r.rating_quality + r.rating_service + r.rating_overall) / 4).toFixed(2);
        
        return [
          (index + 1).toString(),
          new Date(r.rated_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          r.asset_code || '-',
          `[${r.category}] ${r.issue_description || '-'}`,
          r.rating_speed,
          r.rating_quality,
          r.rating_service,
          r.rating_overall,
          avgScore,
          r.feedback || '-'
        ];
      });

      // Add Total Row
      const count = ratedRepairs.length;
      const avgSpeed = (totalSpeed / count).toFixed(2);
      const avgQuality = (totalQuality / count).toFixed(2);
      const avgService = (totalService / count).toFixed(2);
      const avgOverall = (totalOverall / count).toFixed(2);
      const avgTotal = (((totalSpeed + totalQuality + totalService + totalOverall) / 4) / count).toFixed(2);

      body.push(['', '', '', 'เฉลี่ยรวมทั้งหมด', avgSpeed, avgQuality, avgService, avgOverall, avgTotal, '']);

      autoTable(doc, {
        head: head,
        body: body,
        startY: currentY,
        styles: { font: 'THSarabun', fontSize: 10, cellPadding: 1.5 },
        headStyles: { fillColor: [217, 119, 6], textColor: 255, fontStyle: 'bold', font: 'THSarabun', halign: 'center' }, // amber-600
        columnStyles: {
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'center' },
          7: { halign: 'center' },
          8: { halign: 'center', fontStyle: 'bold', textColor: [217, 119, 6] }
        },
        alternateRowStyles: { fillColor: [254, 252, 232] }, // yellow-50
        willDrawCell: function(data) {
          if (data.row.index === body.length - 1) {
            doc.setFont('THSarabun', 'bold');
            doc.setTextColor(180, 83, 9); // amber-700
          }
        },
        didDrawPage: function (data) {
          doc.setFontSize(10); doc.setFont('THSarabun', 'normal');
          doc.setTextColor(100, 100, 100);
          const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
          doc.text(printDate, pageWidth - 14, pageHeight - 10, { align: 'right' });
        }
      });
    } else {
      doc.setFontSize(14);
      doc.text('ไม่มีรายการแจ้งซ่อมที่ได้รับการประเมินความพึงพอใจในเดือนนี้', 14, currentY);
    }

    // Save
    doc.save(`satisfaction-report-${month || 'all'}.pdf`);
  }

  return (
    <button 
      onClick={handleExport}
      className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md font-medium text-sm transition shadow-sm"
    >
      <Download size={20} />
      <span>โหลดรายงานประเมิน (PDF)</span>
    </button>
  );
}
