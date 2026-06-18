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
  doc.text('เรื่อง ขออนุมัติยืมพัสดุ-ครุภัณฑ์', 20, 44);
  doc.text('เรียน หัวหน้าเจ้าหน้าที่พัสดุ', 20, 50);

  // Content Row 1
  doc.text('ข้าพเจ้า', 20, 58);
  doc.text('..........................................................................................', 35, 58);
  doc.text(`${docData.title}${docData.first_name} ${docData.last_name}`, 40, 57);

  doc.text('ตำแหน่ง', 125, 58);
  doc.text('......................................................', 140, 58);
  doc.text(`${docData.position}`, 145, 57);

  // Content Row 2
  doc.text('ขอยืมพัสดุ - ครุภัณฑ์ เพื่อใช้ในการปฏิบัติราชการงาน', 20, 64);
  doc.text('................................................................................................', 105, 64);
  doc.text(`${docData.purpose}`, 110, 63);
  
  doc.text('ดังรายการต่อไปนี้', 20, 70);

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
  doc.text(`กำหนดรับยืม วันที่`, 20, finalY);
  doc.text(`${new Date(docData.borrow_date).toLocaleDateString('th-TH')}`, 55, finalY - 1);
  doc.text('...............................................', 52, finalY);

  doc.text(`กำหนดส่งคืน วันที่`, 110, finalY);
  doc.text(`${new Date(docData.expected_return_date).toLocaleDateString('th-TH')}`, 145, finalY - 1);
  doc.text('...............................................', 142, finalY);

  finalY += 8;

  // Long paragraph - manually split to strictly avoid right-edge overflow
  const text1 = 'หาก วัสดุ-ครุภัณฑ์ ที่ขอยืมเกิดชำรุดเสียหาย หรือใช้การไม่ได้ หรือสูญหายไป ข้าพเจ้าจะรับผิดชอบจัดการแก้ไขซ่อมแซม';
  const text2 = 'ให้คงสภาพเดิม โดยเสียค่าใช้จ่ายของตัวเอง หรือชดใช้เป็นวัสดุ-ครุภัณฑ์ประเภท ชนิด ขนาด ลักษณะ คุณภาพ อย่างเดียวกัน หรือ';
  const text3 = 'ชดใช้เป็นเงินตามราคาที่เป็นอยู่ในขณะที่ยืม โดยไม่มีเงื่อนไขใดๆ ทั้งสิ้น';
  
  doc.text(text1, 30, finalY);
  doc.text(text2, 20, finalY + 6);
  doc.text(text3, 20, finalY + 12);

  finalY += 18;
  doc.text('จึงเรียนมาเพื่อพิจารณาอนุมัติ', 30, finalY);

  // Borrower Signature helper
  const drawSig = (role: string, nameLine1: string, nameLine2: string, x: number, y: number, align: 'left'|'center' = 'center') => {
    const sig = docData.signatures?.find((s: any) => s.role === role);
    const dashLine = '(ลงชื่อ)..............................................'; // Shorter to avoid horizontal overlap
    
    if (align === 'center') {
      doc.text(`${dashLine}${nameLine1}`, x + 25, y, { align: 'center' });
      if (sig && sig.signature_data) {
        doc.addImage(sig.signature_data, 'PNG', x + 10, y - 9, 30, 9); // Smaller signature
      }
      doc.text(nameLine2, x + 25, y + 6, { align: 'center' }); 
    } else {
      doc.text(`${dashLine}${nameLine1}`, x, y);
      if (sig && sig.signature_data) {
        doc.addImage(sig.signature_data, 'PNG', x + 5, y - 9, 30, 9); // Smaller signature
      }
      doc.text(nameLine2, x + 15, y + 6); 
    }
  };

  drawSig('borrower', 'ผู้ขอยืม', `(${docData.title}${docData.first_name} ${docData.last_name})`, 125, finalY + 8);

  finalY += 24;

  const col1X = 20;
  const col2X = 110;

  // Left: ผู้ช่วยเจ้าหน้าที่พัสดุ
  doc.text('ความเห็นผู้ช่วยเจ้าหน้าที่พัสดุ', col1X, finalY);
  doc.rect(col1X + 5, finalY + 3, 3, 3);
  doc.text('ตรวจสอบแล้ว ยืมได้ (วัสดุ-ครุภัณฑ์พร้อมใช้)', col1X + 10, finalY + 6); // Shortened string
  doc.rect(col1X + 5, finalY + 9, 3, 3);
  doc.text('ตรวจสอบแล้วไม่เห็นควรให้ยืม', col1X + 10, finalY + 12);
  doc.text('เนื่องจาก......................................................', col1X, finalY + 18);
  
  drawSig('assistant_parcel', '', '(..................................................)', col1X, finalY + 28, 'left');

  // Right: เจ้าหน้าที่พัสดุ
  doc.text('ความเห็นเจ้าหน้าที่พัสดุ', col2X, finalY); // Perfectly aligned horizontally
  doc.rect(col2X + 5, finalY + 3, 3, 3);
  doc.text('เห็นชอบ', col2X + 10, finalY + 6);
  doc.rect(col2X + 25, finalY + 3, 3, 3);
  doc.text('ไม่เห็นชอบ', col2X + 30, finalY + 6);

  drawSig('parcel_officer', '', '(..................................................)', col2X, finalY + 28, 'left');

  finalY += 38;

  // Left: หัวหน้าเจ้าหน้าที่พัสดุ
  doc.text('ความเห็นหัวหน้าเจ้าหน้าที่พัสดุ', col1X, finalY);
  doc.rect(col1X + 5, finalY + 3, 3, 3);
  doc.text('เห็นชอบ', col1X + 10, finalY + 6);
  doc.rect(col1X + 25, finalY + 3, 3, 3);
  doc.text('ไม่เห็นชอบ', col1X + 30, finalY + 6);

  drawSig('head_parcel', '', '(นางสาวกชนิภา การประเสริฐ)', col1X, finalY + 18, 'left');

  // Right: ผู้อำนวยการ
  doc.text('ความเห็นผู้อำนวยการ', col2X, finalY);
  doc.rect(col2X + 5, finalY + 3, 3, 3);
  doc.text('อนุมัติ', col2X + 10, finalY + 6);
  doc.rect(col2X + 25, finalY + 3, 3, 3);
  doc.text('ไม่อนุมัติ', col2X + 30, finalY + 6);

  drawSig('director', '', '(นายเผด็จ เปล่งปลั่ง)', col2X, finalY + 18, 'left');
  doc.text('ผู้อำนวยการวิทยาลัยชุมชนสมุทรสาคร', col2X + 25, finalY + 24, { align: 'center' });

  finalY += 30;

  // Bottom Box - heavily compacted height
  doc.rect(20, finalY, 170, 36);
  
  doc.text(`วันที่..........................................................`, 25, finalY + 8);
  doc.text(`ผู้จ่ายของ....................................................`, 25, finalY + 18);
  doc.text(`ผู้รับของ......................................................`, 25, finalY + 28);

  // Right column inside box
  doc.text('ได้รับ', 100, finalY + 8);
  doc.rect(112, finalY + 5, 3, 3);
  doc.text('วัสดุ', 118, finalY + 8);
  doc.rect(128, finalY + 5, 3, 3);
  doc.text('ครุภัณฑ์ ตามรายการข้างต้นเรียบร้อยครบถ้วน', 134, finalY + 8);

  doc.text(`ลงชื่อ........................................ผู้รับคืน`, 100, finalY + 18);
  doc.text(`(........................................)......./......./.......`, 105, finalY + 23);

  doc.text(`ลงชื่อ........................................ผู้คืน`, 100, finalY + 28);
  doc.text(`(........................................)......./......./.......`, 105, finalY + 33);

  doc.save(`Borrow-${docData.document_no}.pdf`);
}
