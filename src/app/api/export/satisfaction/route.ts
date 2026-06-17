import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import ExcelJS from 'exceljs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const client = await pool.connect();
    
    const query = `
      SELECT r.id, r.reported_at, r.reporter_name, r.issue_description, r.status,
             r.rating_speed, r.rating_quality, r.rating_service, r.rating_overall, r.feedback, r.rated_at,
             e.asset_code, e.category, e.brand, e.model
      FROM repair_requests r
      JOIN equipments e ON r.equipment_id = e.id
      WHERE r.rating_overall IS NOT NULL
      ORDER BY r.rated_at DESC
    `;
    
    const { rows } = await client.query(query);
    client.release();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Satisfaction Report');

    // Title
    worksheet.mergeCells('A1:J1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'รายงานผลการประเมินความพึงพอใจการให้บริการซ่อมบำรุง';
    titleCell.font = { name: 'Sarabun', size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Headers
    const headers = [
      'รหัสการซ่อม', 'วันที่ประเมิน', 'รหัสครุภัณฑ์', 'รายการ/อาการเสีย', 
      'ความรวดเร็ว', 'คุณภาพ', 'มารยาท/บริการ', 'ภาพรวม', 'คะแนนเฉลี่ย', 'ข้อเสนอแนะ'
    ];
    
    worksheet.getRow(3).values = headers;
    worksheet.getRow(3).font = { bold: true };
    worksheet.getRow(3).alignment = { horizontal: 'center' };
    
    // Set column widths
    worksheet.columns = [
      { width: 15 }, { width: 20 }, { width: 20 }, { width: 40 },
      { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 40 }
    ];

    // Add data
    let totalSpeed = 0, totalQuality = 0, totalService = 0, totalOverall = 0;
    
    rows.forEach((row, index) => {
      totalSpeed += row.rating_speed || 0;
      totalQuality += row.rating_quality || 0;
      totalService += row.rating_service || 0;
      totalOverall += row.rating_overall || 0;
      
      const avgScore = ((row.rating_speed + row.rating_quality + row.rating_service + row.rating_overall) / 4).toFixed(2);
      
      const rowData = [
        `REP-${row.id}`,
        new Date(row.rated_at).toLocaleDateString('th-TH'),
        row.asset_code,
        `[${row.category}] ${row.issue_description}`,
        row.rating_speed,
        row.rating_quality,
        row.rating_service,
        row.rating_overall,
        avgScore,
        row.feedback || '-'
      ];
      worksheet.addRow(rowData);
    });
    
    // Add Summary Row
    const count = rows.length;
    if (count > 0) {
      const summaryRow = worksheet.addRow([
        'ค่าเฉลี่ยรวมทั้งหมด', '', '', '',
        (totalSpeed / count).toFixed(2),
        (totalQuality / count).toFixed(2),
        (totalService / count).toFixed(2),
        (totalOverall / count).toFixed(2),
        (((totalSpeed + totalQuality + totalService + totalOverall) / 4) / count).toFixed(2),
        ''
      ]);
      summaryRow.font = { bold: true, color: { argb: 'FF0000FF' } };
      worksheet.mergeCells(`A${summaryRow.number}:D${summaryRow.number}`);
      summaryRow.getCell(1).alignment = { horizontal: 'right' };
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="satisfaction_report.xlsx"`
      }
    });

  } catch (error) {
    console.error('Error exporting satisfaction report:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
