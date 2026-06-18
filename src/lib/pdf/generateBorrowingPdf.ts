import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export async function generateBorrowingPdf(docData: any) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  try {
    const fontUrl = '/fonts/Sarabun-Regular.ttf';
    const response = await fetch(fontUrl);
    if (!response.ok) throw new Error('Font fetch failed');
    const fontBuffer = await response.arrayBuffer();
    const fontBase64 = arrayBufferToBase64(fontBuffer);

    doc.addFileToVFS('Sarabun-Regular.ttf', fontBase64);
    doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');
    // Map bold to normal to prevent autoTable Helvetica fallback
    doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'bold');
    doc.setFont('Sarabun');
  } catch (error) {
    console.warn('Failed to load Thai font, falling back to default', error);
  }

  // --- Title ---
  doc.setFontSize(18);
  doc.text('ใบยืมพัสดุ - ครุภัณฑ์', 105, 15, { align: 'center' });
  doc.setFontSize(16);
  doc.text('วิทยาลัยชุมชนสมุทรสาคร', 105, 22, { align: 'center' });

  // --- Use 12pt font for everything else to fit on 1 page and prevent horizontal overlap ---
  doc.setFontSize(12);

  // Top right
  doc.text(`เลขที่: ${docData.document_no || '......................../........................'}`, 130, 30);
  doc.text(`วันที่: ${new Date(docData.borrow_date).toLocaleDateString('th-TH')}`, 130, 36);

  // Left
  doc.text('เรื่อง ขออนุมัติยืมพัสดุ-ครุภัณฑ์', 15, 44);
  doc.text('เรียน หัวหน้าเจ้าหน้าที่พัสดุ', 15, 50);

  // Content Row 1
  doc.text('ข้าพเจ้า', 15, 58);
  doc.text('..........................................................................................', 30, 58);
  doc.text(`${docData.title}${docData.first_name} ${docData.last_name}`, 35, 57);

  doc.text('ตำแหน่ง', 120, 58);
  doc.text('......................................................', 135, 58);
  doc.text(`${docData.position}`, 140, 57);

  // Content Row 2
  doc.text('ขอยืมพัสดุ - ครุภัณฑ์ เพื่อใช้ในการปฏิบัติราชการงาน', 15, 64);
  doc.text('...................................................................................................', 100, 64);
  doc.text(`${docData.purpose}`, 110, 63);
  
  doc.text('ดังรายการต่อไปนี้', 15, 70);

  // Table
  const tableData = docData.items.map((item: any, index: number) => [
    index + 1,
    `${item.category} ${item.brand} ${item.model}`,
    '1',
    item.asset_code,
    ''
  ]);

  while (tableData.length < 5) {
    tableData.push(['', '', '', '', '']);
  }

  autoTable(doc, {
    startY: 73,
    margin: { left: 15, right: 15 },
    head: [['ที่', 'รายการ', 'จำนวน', 'หมายเลข/รหัสครุภัณฑ์', 'หมายเหตุ']],
    body: tableData,
    styles: { font: 'Sarabun', fontSize: 12, lineColor: [0, 0, 0], lineWidth: 0.2 },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], halign: 'center', fontStyle: 'normal' },
    bodyStyles: { textColor: [0, 0, 0] },
    columnStyles: { 
      0: { halign: 'center', cellWidth: 10 },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'center', cellWidth: 45 },
      4: { cellWidth: 25 }
    },
    theme: 'grid'
  });

  let finalY = (doc as any).lastAutoTable.finalY + 6;

  // Dates below table
  doc.text(`กำหนดรับยืม วันที่`, 15, finalY);
  doc.text(`${new Date(docData.borrow_date).toLocaleDateString('th-TH')}`, 50, finalY - 1);
  doc.text('...............................................', 47, finalY);

  doc.text(`กำหนดส่งคืน วันที่`, 105, finalY);
  doc.text(`${new Date(docData.expected_return_date).toLocaleDateString('th-TH')}`, 140, finalY - 1);
  doc.text('...............................................', 137, finalY);

  finalY += 7;

  // Long paragraph
  const text1 = 'หาก วัสดุ-ครุภัณฑ์ ที่ขอยืมเกิดชำรุดเสียหาย หรือใช้การไม่ได้ หรือสูญหายไป ข้าพเจ้าจะรับผิดชอบ';
  const text2 = 'จัดการแก้ไขซ่อมแซมให้คงสภาพเดิม โดยเสียค่าใช้จ่ายของตัวเอง หรือชดใช้เป็นวัสดุ-ครุภัณฑ์';
  const text3 = 'ประเภท ชนิด ขนาด ลักษณะ คุณภาพ อย่างเดียวกัน หรือชดใช้เป็นเงินตามราคาที่เป็นอยู่ในขณะที่ยืม';
  const text4 = 'โดยไม่มีเงื่อนไขใดๆ ทั้งสิ้น';
  
  doc.text(text1, 25, finalY);
  doc.text(text2, 15, finalY + 4.5);
  doc.text(text3, 15, finalY + 9);
  doc.text(text4, 15, finalY + 13.5);

  finalY += 19;
  doc.text('จึงเรียนมาเพื่อพิจารณาอนุมัติ', 25, finalY);

  // Borrower Signature helper
  const drawSig = (role: string, nameLine1: string, nameLine2: string, x: number, y: number, align: 'left'|'center' = 'center') => {
    const sig = docData.signatures?.find((s: any) => s.role === role);
    const dashLine = '(ลงชื่อ).........................................'; 
    
    if (align === 'center') {
      doc.text(`${dashLine}${nameLine1}`, x + 25, y, { align: 'center' });
      if (sig && sig.signature_data) {
        doc.addImage(sig.signature_data, 'PNG', x + 10, y - 10, 30, 10); // Sits on the line, horizontally centered
      }
      doc.text(nameLine2, x + 25, y + 6, { align: 'center' }); 
    } else {
      doc.text(`${dashLine}${nameLine1}`, x, y);
      if (sig && sig.signature_data) {
        doc.addImage(sig.signature_data, 'PNG', x + 22, y - 10, 30, 10); // Shifted right to precisely center on the dots
      }
      doc.text(nameLine2, x + 15, y + 6); 
    }
  };

  drawSig('borrower', 'ผู้ขอยืม', `(${docData.title}${docData.first_name} ${docData.last_name})`, 125, finalY + 10);

  finalY += 24;

  const col1X = 15;
  const col2X = 105;

  // Left: ผู้ช่วยเจ้าหน้าที่พัสดุ
  doc.text('ความเห็นผู้ช่วยเจ้าหน้าที่พัสดุ', col1X, finalY);
  doc.rect(col1X + 5, finalY + 3, 3, 3);
  doc.text('ตรวจสอบแล้ว ยืมได้ (วัสดุ-ครุภัณฑ์พร้อมใช้)', col1X + 10, finalY + 6);
  doc.rect(col1X + 5, finalY + 9, 3, 3);
  doc.text('ตรวจสอบแล้วไม่เห็นควรให้ยืม', col1X + 10, finalY + 12);
  doc.text('เนื่องจาก...............................................', col1X, finalY + 17);
  
  drawSig('assistant_parcel', '', '(..................................................)', col1X, finalY + 30, 'left');

  // Right: เจ้าหน้าที่พัสดุ
  doc.text('ความเห็นเจ้าหน้าที่พัสดุ', col2X, finalY);
  doc.rect(col2X + 5, finalY + 3, 3, 3);
  doc.text('เห็นชอบ', col2X + 10, finalY + 6);
  doc.rect(col2X + 25, finalY + 3, 3, 3);
  doc.text('ไม่เห็นชอบ', col2X + 30, finalY + 6);

  drawSig('parcel_officer', '', '(..................................................)', col2X, finalY + 30, 'left');

  finalY += 44;

  // Left: หัวหน้าเจ้าหน้าที่พัสดุ
  doc.text('ความเห็นหัวหน้าเจ้าหน้าที่พัสดุ', col1X, finalY);
  doc.rect(col1X + 5, finalY + 3, 3, 3);
  doc.text('เห็นชอบ', col1X + 10, finalY + 6);
  doc.rect(col1X + 25, finalY + 3, 3, 3);
  doc.text('ไม่เห็นชอบ', col1X + 30, finalY + 6);

  drawSig('head_parcel', '', '(นางสาวกชนิภา การประเสริฐ)', col1X, finalY + 20, 'left');

  // Right: ผู้อำนวยการ
  doc.text('ความเห็นผู้อำนวยการ', col2X, finalY);
  doc.rect(col2X + 5, finalY + 3, 3, 3);
  doc.text('อนุมัติ', col2X + 10, finalY + 6);
  doc.rect(col2X + 25, finalY + 3, 3, 3);
  doc.text('ไม่อนุมัติ', col2X + 30, finalY + 6);

  drawSig('director', '', '(นายเผด็จ เปล่งปลั่ง)', col2X, finalY + 20, 'left');
  doc.text('ผู้อำนวยการวิทยาลัยชุมชนสมุทรสาคร', col2X + 20, finalY + 30, { align: 'center' });

  finalY += 38;

  // Bottom Box - Complete Redesign
  doc.rect(15, finalY, 180, 28);
  doc.line(105, finalY, 105, finalY + 28);

  // Headers
  doc.setFont('Sarabun', 'bold');
  doc.text('การรับมอบพัสดุ (สำหรับวันรับพัสดุ)', 60, finalY + 5, { align: 'center' });
  doc.text('การส่งคืนพัสดุ (สำหรับวันส่งคืน)', 150, finalY + 5, { align: 'center' });
  doc.setFont('Sarabun', 'normal');

  // Left
  doc.text('ได้รับพัสดุตามรายการข้างต้นเรียบร้อยแล้ว', 60, finalY + 10, { align: 'center' });
  doc.text('ผู้รับของ .....................................................', 20, finalY + 16);
  doc.text('ผู้จ่ายของ ...................................................', 20, finalY + 21);
  doc.text('วันที่ ............./............./.............', 35, finalY + 26);

  // Right
  doc.text('ได้รับคืนพัสดุตามรายการข้างต้นเรียบร้อยแล้ว', 150, finalY + 10, { align: 'center' });
  doc.text('ผู้คืนของ .....................................................', 110, finalY + 16);
  doc.text('ผู้รับคืน ......................................................', 110, finalY + 21);
  doc.text('วันที่ ............./............./.............', 125, finalY + 26);

  doc.save(`Borrow-${docData.document_no}.pdf`);
}
