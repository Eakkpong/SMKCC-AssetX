import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { THSarabunNew } from './fonts/THSarabunNew'; // We need a base64 font for Thai

export async function generateBorrowingPdf(docData: any) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Add Thai font
  doc.addFileToVFS('THSarabunNew.ttf', THSarabunNew);
  doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal');
  doc.setFont('THSarabun');

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
    styles: { font: 'THSarabun', fontSize: 14 },
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
