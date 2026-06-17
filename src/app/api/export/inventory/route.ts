import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import ExcelJS from 'exceljs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get('audit_id');

    const client = await pool.connect();
    
    let query = `
      SELECT e.*, p.first_name, p.last_name, p.title 
      FROM equipments e
      LEFT JOIN personnel p ON e.owner_id = p.id
      ORDER BY e.created_at ASC
    `;
    let queryParams: any[] = [];
    let auditData = null;

    if (auditId) {
      // Fetch audit details first
      const auditRes = await client.query('SELECT * FROM audits WHERE id = $1', [auditId]);
      if (auditRes.rows.length > 0) {
        auditData = auditRes.rows[0];
      }

      // Filter by audit items
      query = `
        SELECT e.*, p.first_name, p.last_name, p.title 
        FROM equipments e
        LEFT JOIN personnel p ON e.owner_id = p.id
        INNER JOIN audit_items ai ON ai.equipment_id = e.id
        WHERE ai.audit_id = $1
        ORDER BY ai.scanned_at ASC
      `;
      queryParams = [auditId];
    }

    const { rows } = await client.query(query, queryParams);
    client.release();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SMKCC AssetX';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('ทะเบียนคุมครุภัณฑ์', {
      views: [{ showGridLines: true }]
    });

    // --- Format Columns ---
    sheet.columns = [
      { key: 'no', width: 6 },
      { key: 'date', width: 12 },
      { key: 'asset_code', width: 25 },
      { key: 'description', width: 40 },
      { key: 'quantity', width: 8 },
      { key: 'price', width: 15 },
      { key: 'method', width: 12 },
      { key: 'changes', width: 15 },
      { key: 'location', width: 20 },
      { key: 'remarks', width: 15 },
      { key: 'net_value', width: 20 },
      { key: 'life', width: 15 },
    ];

    // --- Add Header Rows ---
    const reportYear = auditData ? auditData.audit_year : '2568';
    
    sheet.mergeCells('A1:L1');
    const titleRow = sheet.getCell('A1');
    titleRow.value = `รายการพัสดุคงเหลือ ประจำปีงบประมาณ พ.ศ. ${reportYear}`;
    titleRow.font = { name: 'Sarabun', size: 16, bold: true };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 30;

    sheet.mergeCells('A2:L2');
    const subtitleRow = sheet.getCell('A2');
    subtitleRow.value = 'ส่วนราชการสถาบันวิทยาลัยชุมชน';
    subtitleRow.font = { name: 'Sarabun', size: 11 };
    subtitleRow.alignment = { horizontal: 'right', vertical: 'middle' };

    sheet.mergeCells('A3:F3');
    const catLeft = sheet.getCell('A3');
    catLeft.value = 'ประเภท ครุภัณฑ์คอมพิวเตอร์';
    catLeft.font = { name: 'Sarabun', size: 11, bold: true };
    catLeft.alignment = { horizontal: 'left', vertical: 'middle' };

    sheet.mergeCells('G3:L3');
    const deptRight = sheet.getCell('G3');
    deptRight.value = 'หน่วยงานวิทยาลัยชุมชนสมุทรสาคร';
    deptRight.font = { name: 'Sarabun', size: 11, bold: true };
    deptRight.alignment = { horizontal: 'right', vertical: 'middle' };

    const headers = [
      'ที่', 'ว/ด/ป', 'หมายเลขทะเบียน', 'รายการ ยี่ห้อ ชนิด แบบ และ\nลักษณะ', 
      'จำนวน', 'ราคาต่อหน่วย\nบาท', 'วิธีการได้มา', 'รายการ\nเปลี่ยนแปลง', 
      'ใช้งานที่', 'หมายเหตุ', 'มูลค่าคงเหลือตามบัญชี\nบาท', 'อายุคงเหลือ\nปี/เดือน'
    ];
    
    const headerRow = sheet.addRow(headers);
    headerRow.height = 40;
    
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Sarabun', size: 11, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    });

    // --- Add Data Rows ---
    rows.forEach((item, index) => {
      let formattedDate = '';
      if (item.purchase_date) {
        const d = new Date(item.purchase_date);
        const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        formattedDate = `${d.getDate()} ${thaiMonths[d.getMonth()]} ${(d.getFullYear() + 543).toString().substring(2)}`;
      }

      const description = `${item.category} ${item.brand} ${item.model}`;
      let usedAt = item.location || '';
      if (item.first_name) {
        usedAt = `${item.first_name} ${item.last_name}`;
      }

      const row = sheet.addRow([
        index + 1,
        formattedDate,
        item.asset_code || '',
        description,
        1,
        item.purchase_price ? parseFloat(item.purchase_price) : 0,
        'เจาะจง',
        '',
        usedAt,
        item.status || '',
        '',
        ''
      ]);

      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Sarabun', size: 11 };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        if ([1, 2, 5, 7].includes(colNumber)) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if ([6, 11].includes(colNumber)) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.00';
        } else {
          cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        }
      });
    });

    // --- Append Committee Signatures if Audit ID is present ---
    if (auditData && auditData.committee_members) {
      sheet.addRow([]);
      sheet.addRow([]);
      
      const members = auditData.committee_members.split(',').map((m: string) => m.trim());
      
      // Calculate spacing based on number of members
      const spacingCol = Math.floor(12 / members.length);
      
      const signRow1 = sheet.addRow([]);
      const signRow2 = sheet.addRow([]);
      const signRow3 = sheet.addRow([]);

      members.forEach((member: string, idx: number) => {
        const startColIndex = (idx * spacingCol) + 1;
        
        // Example output for 3 members: A, E, I
        const cell1 = signRow1.getCell(startColIndex + 1);
        cell1.value = 'ลงชื่อ................................................กรรมการ';
        cell1.font = { name: 'Sarabun', size: 12 };
        cell1.alignment = { horizontal: 'center' };

        const cell2 = signRow2.getCell(startColIndex + 1);
        cell2.value = `(${member})`;
        cell2.font = { name: 'Sarabun', size: 12 };
        cell2.alignment = { horizontal: 'center' };
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="inventory_report_${reportYear}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

  } catch (error) {
    console.error('Error generating Excel:', error);
    return NextResponse.json({ error: 'Failed to generate Excel file' }, { status: 500 });
  }
}
