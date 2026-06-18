import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export async function generateBulkQrPdf(equipments: any[], filename: string = 'bulk_qr_codes.pdf') {
  if (!equipments || equipments.length === 0) return;

  try {
    // Load Logo
    const logoImg = new Image();
    logoImg.src = '/logo.png';
    await new Promise((resolve, reject) => {
      logoImg.onload = resolve;
      logoImg.onerror = reject;
    });

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const cols = 5;
    const rows = 5;
    const itemsPerPage = cols * rows;
    
    // Margins and sizes
    const marginX = 10;
    const marginY = 10;
    const stickerWidth = 38;
    const stickerHeight = 55;
    
    for (let i = 0; i < equipments.length; i++) {
      const eq = equipments[i];
      const pageIndex = Math.floor(i / itemsPerPage);
      const indexOnPage = i % itemsPerPage;
      
      if (pageIndex > 0 && indexOnPage === 0) {
        doc.addPage();
      }

      const col = indexOnPage % cols;
      const row = Math.floor(indexOnPage / cols);

      const x = marginX + (col * stickerWidth);
      const y = marginY + (row * stickerHeight);

      // Generate QR Code image
      const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://smkcc-asset-x.vercel.app'}/equipment/${eq.asset_code}`;
      const qrDataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: 'H', margin: 1, width: 300 });

      // Draw Border
      doc.setLineWidth(0.3);
      doc.rect(x + 1, y + 1, 36, 53);

      // Draw Logo
      doc.addImage(logoImg, 'PNG', x + 13, y + 3, 12, 12);

      // Draw QR Code
      doc.addImage(qrDataUrl, 'PNG', x + 8, y + 16, 22, 22);

      // Draw Asset Code
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(eq.asset_code || '-', x + 19, y + 44, { align: 'center' });
    }

    doc.save(filename);
  } catch (error) {
    console.error('Error generating bulk QR PDF:', error);
    alert('เกิดข้อผิดพลาดในการสร้าง PDF สติ๊กเกอร์ QR Code แบบกลุ่ม');
  }
}
