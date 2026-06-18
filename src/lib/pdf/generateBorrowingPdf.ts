import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
    // Fetch Sarabun font from local public folder
    const fontUrl = '/fonts/Sarabun-Regular.ttf';
    const response = await fetch(fontUrl);
    if (!response.ok) throw new Error('Font fetch failed');
    const fontBuffer = await response.arrayBuffer();
    const fontBase64 = arrayBufferToBase64(fontBuffer);

    // Add Thai font
    doc.addFileToVFS('Sarabun-Regular.ttf', fontBase64);
    doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');
    doc.setFont('Sarabun');
  } catch (error) {
    console.warn('Failed to load Thai font, falling back to default', error);
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.text('ใบยืมพัสดุ (Paperless)', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text(`เลขที่เอกสาร: ${docData.document_no}`, 150, 30);
  
  // Body Text
  doc.text(`วันที่ยืม: ${new Date(docData.borrow_date).toLocaleDateString('th-TH')}`, 20, 40);
  doc.text(`กำหนดส่งคืน: ${new Date(docData.expected_return_date).toLocaleDateString('th-TH')}`, 100, 40);
  
  doc.text(`ข้าพเจ้า: ${docData.title}${docData.first_name} ${docData.last_name}`, 20, 50);
  doc.text(`ตำแหน่ง: ${docData.position}`, 100, 50);
  
  doc.text(`มีความประสงค์ขอยืมพัสดุเพื่อ: ${docData.purpose}`, 20, 60);

  // Table
  const tableData = docData.items.map((item: any, index: number) => [
    index + 1,
    item.asset_code,
    `${item.category} ${item.brand} ${item.model}`
  ]);

  (doc as any).autoTable({
    startY: 70,
    head: [['ลำดับ', 'รหัสพัสดุ', 'รายการ']],
    body: tableData,
    styles: { font: 'Sarabun', fontSize: 14 },
    headStyles: { fillColor: [30, 58, 138] },
    theme: 'grid'
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;

  // Signatures Section
  const drawSignatureBlock = (roleKey: string, title: string, name: string, x: number, y: number) => {
    doc.setFontSize(14);
    doc.text(title, x + 25, y, { align: 'center' });
    
    const sig = docData.signatures?.find((s: any) => s.role === roleKey);
    if (sig && sig.signature_data) {
      doc.addImage(sig.signature_data, 'PNG', x, y + 5, 50, 20);
    } else {
      doc.text('(................................................)', x + 25, y + 20, { align: 'center' });
    }
    
    doc.text(name, x + 25, y + 32, { align: 'center' });
  };

  // Row 1: Borrower & Asst Parcel
  drawSignatureBlock('borrower', 'ผู้ขอยืม', `(${docData.title}${docData.first_name} ${docData.last_name})`, 30, finalY);
  drawSignatureBlock('assistant_parcel', 'ผู้ช่วยเจ้าหน้าที่พัสดุ', '(..........................................)', 110, finalY);

  // Row 2: Parcel Officer & Head Parcel
  drawSignatureBlock('parcel_officer', 'ความเห็นเจ้าหน้าที่พัสดุ', '(..........................................)', 30, finalY + 50);
  drawSignatureBlock('head_parcel', 'หัวหน้าเจ้าหน้าที่พัสดุ', '(นางสาวพรพรรณ นิลศิริ)', 110, finalY + 50);

  // Row 3: Director
  drawSignatureBlock('director', 'ความเห็นผู้อำนวยการ', '(นายเผด็จ เปล่งปลั่ง)', 70, finalY + 100);

  doc.save(`Borrow-${docData.document_no}.pdf`);
}
