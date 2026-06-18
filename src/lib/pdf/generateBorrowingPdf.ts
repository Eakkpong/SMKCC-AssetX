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
    // Also map bold to normal to prevent autoTable fallback issues if it still tries bold
    doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'bold');
    doc.setFont('Sarabun');
  } catch (error) {
    console.warn('Failed to load Thai font, falling back to default', error);
  }

  doc.setFontSize(16);

  // Title
  doc.setFontSize(18);
  doc.text('ใบยืมพัสดุ - ครุภัณฑ์', 105, 15, { align: 'center' });
  doc.setFontSize(16);
  doc.text('วิทยาลัยชุมชนสมุทรสาคร', 105, 22, { align: 'center' });

  // Top right
  doc.text(`เลขที่: ${docData.document_no || '......................../........................'}`, 130, 30);
  doc.text(`วันที่: ${new Date(docData.borrow_date).toLocaleDateString('th-TH')}`, 130, 37);

  // Left
  doc.text('เรื่อง ขออนุมัติยืมพัสดุ-ครุภัณฑ์', 20, 47);
  doc.text('เรียน หัวหน้าเจ้าหน้าที่พัสดุ', 20, 55);

  // Content Row 1
  doc.text('ข้าพเจ้า', 20, 65);
  doc.text('....................................................................................................', 35, 65);
  doc.text(`${docData.title}${docData.first_name} ${docData.last_name}`, 45, 64);

  doc.text('ตำแหน่ง', 125, 65);
  doc.text('................................................................', 140, 65);
  doc.text(`${docData.position}`, 145, 64);

  // Content Row 2
  doc.text('ขอยืมพัสดุ - ครุภัณฑ์ เพื่อใช้ในการปฏิบัติราชการงาน', 20, 73);
  doc.text('...............................................................................................', 105, 73);
  doc.text(`${docData.purpose}`, 115, 72);
  
  doc.text('ดังรายการต่อไปนี้', 20, 81);

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
    startY: 85,
    head: [['ที่', 'รายการ', 'จำนวน', 'หมายเลข/รหัสครุภัณฑ์', 'หมายเหตุ']],
    body: tableData,
    styles: { font: 'Sarabun', fontSize: 14, lineColor: [0, 0, 0], lineWidth: 0.2 },
    // Critical fix: fontStyle: 'normal' prevents fallback to Helvetica bold!
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], halign: 'center', fontStyle: 'normal' },
    bodyStyles: { textColor: [0, 0, 0] },
    columnStyles: { 
      0: { halign: 'center', cellWidth: 12 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 45 },
      4: { cellWidth: 25 }
    },
    theme: 'grid'
  });

  let finalY = (doc as any).lastAutoTable.finalY + 8;

  // Dates below table
  doc.text(`กำหนดรับยืม วันที่`, 20, finalY);
  doc.text(`${new Date(docData.borrow_date).toLocaleDateString('th-TH')}`, 55, finalY - 1);
  doc.text('...............................................', 52, finalY);

  doc.text(`กำหนดส่งคืน วันที่`, 110, finalY);
  doc.text(`${new Date(docData.expected_return_date).toLocaleDateString('th-TH')}`, 145, finalY - 1);
  doc.text('...............................................', 142, finalY);

  finalY += 8;

  // Long paragraph
  doc.setFontSize(14);
  const text1 = 'หาก วัสดุ-ครุภัณฑ์ ที่ขอยืมเกิดชำรุดเสียหาย หรือใช้การไม่ได้ หรือสูญหายไป ข้าพเจ้าจะรับผิดชอบจัดการแก้ไขซ่อมแซม';
  const text2 = 'ให้คงสภาพเดิม โดยเสียค่าใช้จ่ายของตัวเอง หรือชดใช้เป็นวัสดุ-ครุภัณฑ์ประเภท ชนิด ขนาด ลักษณะ คุณภาพ อย่างเดียวกัน หรือ';
  const text3 = 'ชดใช้เป็นเงินตามราคาที่เป็นอยู่ในขณะที่ยืม โดยไม่มีเงื่อนไขใดๆ ทั้งสิ้น';
  
  doc.text(text1, 30, finalY);
  doc.text(text2, 20, finalY + 6);
  doc.text(text3, 20, finalY + 12);

  finalY += 20;
  doc.text('จึงเรียนมาเพื่อพิจารณาอนุมัติ', 30, finalY);

  // Borrower Signature helper
  const drawSig = (role: string, nameLine1: string, nameLine2: string, x: number, y: number, align: 'left'|'center' = 'center') => {
    const sig = docData.signatures?.find((s: any) => s.role === role);
    
    if (align === 'center') {
      doc.text(`(ลงชื่อ)........................................................${nameLine1}`, x + 25, y, { align: 'center' });
      if (sig && sig.signature_data) {
        doc.addImage(sig.signature_data, 'PNG', x + 5, y - 12, 40, 12);
      }
      doc.text(nameLine2, x + 25, y + 8, { align: 'center' }); 
    } else {
      doc.text(`(ลงชื่อ)........................................................${nameLine1}`, x, y);
      if (sig && sig.signature_data) {
        doc.addImage(sig.signature_data, 'PNG', x + 5, y - 12, 40, 12);
      }
      doc.text(nameLine2, x + 15, y + 8); 
    }
  };

  drawSig('borrower', 'ผู้ขอยืม', `(${docData.title}${docData.first_name} ${docData.last_name})`, 125, finalY + 5);

  finalY += 28; // Reduced gap because signature is drawn above the line

  const col1X = 20;
  const col2X = 110;

  // Left: ผู้ช่วยเจ้าหน้าที่พัสดุ
  doc.setFontSize(14);
  doc.text('ความเห็นผู้ช่วยเจ้าหน้าที่พัสดุ', col1X, finalY);
  doc.rect(col1X + 5, finalY + 3, 3, 3);
  doc.text('ตรวจสอบแล้ว ยืมได้ (วัสดุ - ครุภัณฑ์พร้อมใช้งาน)', col1X + 10, finalY + 6);
  doc.rect(col1X + 5, finalY + 9, 3, 3);
  doc.text('ตรวจสอบแล้วไม่เห็นควรให้ยืม', col1X + 10, finalY + 12);
  doc.text('เนื่องจาก................................................................', col1X, finalY + 19);
  
  drawSig('assistant_parcel', '', '(........................................................)', col1X, finalY + 35, 'left');

  // Right: เจ้าหน้าที่พัสดุ
  doc.text('ความเห็นเจ้าหน้าที่พัสดุ', col2X, finalY + 12);
  doc.rect(col2X + 5, finalY + 15, 3, 3);
  doc.text('เห็นชอบ', col2X + 10, finalY + 18);
  doc.rect(col2X + 30, finalY + 15, 3, 3);
  doc.text('ไม่เห็นชอบ', col2X + 35, finalY + 18);

  drawSig('parcel_officer', '', '(........................................................)', col2X, finalY + 35, 'left');

  finalY += 55; // Increased gap to prevent overlap

  // Left: หัวหน้าเจ้าหน้าที่พัสดุ
  doc.text('ความเห็นหัวหน้าเจ้าหน้าที่พัสดุ', col1X, finalY);
  doc.rect(col1X + 5, finalY + 3, 3, 3);
  doc.text('เห็นชอบ', col1X + 10, finalY + 6);
  doc.rect(col1X + 30, finalY + 3, 3, 3);
  doc.text('ไม่เห็นชอบ', col1X + 35, finalY + 6);

  drawSig('head_parcel', '', '(นางสาวกชนิภา การประเสริฐ)', col1X, finalY + 25, 'left');

  // Right: ผู้อำนวยการ
  doc.text('ความเห็นผู้อำนวยการ', col2X, finalY);
  doc.rect(col2X + 5, finalY + 3, 3, 3);
  doc.text('อนุมัติ', col2X + 10, finalY + 6);
  doc.rect(col2X + 30, finalY + 3, 3, 3);
  doc.text('ไม่อนุมัติ', col2X + 35, finalY + 6);

  drawSig('director', '', '(นายเผด็จ เปล่งปลั่ง)', col2X, finalY + 25, 'left');
  doc.text('ผู้อำนวยการวิทยาลัยชุมชนสมุทรสาคร', col2X + 35, finalY + 33, { align: 'center' }); // Adjusted Y

  finalY += 38; // Final gap before bottom box

  if (finalY > 230) {
    doc.addPage();
    finalY = 20;
  }

  // Draw rectangle for bottom box
  doc.rect(20, finalY, 170, 52);
  
  doc.text(`วันที่......................................................................`, 25, finalY + 10);
  doc.text(`ผู้จ่ายของ................................................................`, 25, finalY + 25);
  doc.text(`ผู้รับของ..................................................................`, 25, finalY + 40);

  // Right column inside box
  doc.text('ได้รับ', 100, finalY + 10);
  doc.rect(112, finalY + 7, 3, 3);
  doc.text('วัสดุ', 118, finalY + 10);
  doc.rect(128, finalY + 7, 3, 3);
  doc.text('ครุภัณฑ์ ตามรายการข้างต้นเรียบร้อย', 134, finalY + 10);
  doc.text('และครบถ้วนแล้ว', 100, finalY + 16);

  doc.text(`ลงชื่อ................................................ผู้รับคืน`, 100, finalY + 25);
  doc.text(`(................................................)......../......../........`, 105, finalY + 32);

  doc.text(`ลงชื่อ................................................ผู้คืน`, 100, finalY + 41);
  doc.text(`(................................................)......../......../........`, 105, finalY + 48);

  doc.save(`Borrow-${docData.document_no}.pdf`);
}
