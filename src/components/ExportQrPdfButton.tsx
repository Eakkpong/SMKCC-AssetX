"use client";

import { QrCode } from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { THSarabunFont } from '@/lib/fonts/THSarabun';

export default function ExportQrPdfButton({ data }: { data: any[] }) {
  async function handleExport() {
    // A4 Portrait
    const doc = new jsPDF('portrait', 'mm', 'a4');

    // Add Thai Font
    doc.addFileToVFS('THSarabun.ttf', THSarabunFont);
    doc.addFont('THSarabun.ttf', 'THSarabun', 'normal');
    doc.setFont('THSarabun');

    // Layout configuration
    const cols = 3;
    const rows = 5;
    const itemsPerPage = cols * rows;
    const marginX = 15;
    const marginY = 15;
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const cellWidth = (pageWidth - (marginX * 2)) / cols;
    const cellHeight = (pageHeight - (marginY * 2)) / rows;

    for (let i = 0; i < data.length; i++) {
      if (i > 0 && i % itemsPerPage === 0) {
        doc.addPage();
      }

      const eq = data[i];
      const pageIndex = i % itemsPerPage;
      const col = pageIndex % cols;
      const row = Math.floor(pageIndex / cols);

      const x = marginX + (col * cellWidth);
      const y = marginY + (row * cellHeight);

      // Generate QR Code data URL
      const baseUrl = window.location.origin;
      const qrUrl = `${baseUrl}/equipment/${encodeURIComponent(eq.asset_code)}`;
      
      try {
        const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 200 });
        
        // Draw QR Code
        const qrSize = 35; // mm
        const qrX = x + (cellWidth / 2) - (qrSize / 2);
        const qrY = y + 5;
        
        doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

        // Draw Text
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        
        // Asset Code
        const textAssetX = x + (cellWidth / 2);
        doc.text(eq.asset_code || '-', textAssetX, qrY + qrSize + 5, { align: 'center' });

        // Location
        doc.setFontSize(12);
        const locationText = `สถานที่: ${eq.location || '-'}`;
        doc.text(locationText, textAssetX, qrY + qrSize + 11, { align: 'center' });

        // Owner
        const ownerName = eq.first_name ? `${eq.title || ''}${eq.first_name} ${eq.last_name}` : '-';
        const ownerText = `ผู้ครอบครอง: ${ownerName}`;
        doc.text(ownerText, textAssetX, qrY + qrSize + 16, { align: 'center' });

        // Draw a light border around each cell for easy cutting
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.rect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);

      } catch (err) {
        console.error('Error generating QR code for', eq.asset_code, err);
      }
    }

    doc.save('equipment-qrcodes.pdf');
  }

  return (
    <button 
      onClick={handleExport}
      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition"
    >
      <QrCode size={20} />
      <span>พิมพ์ QR Code ทั้งหมด</span>
    </button>
  );
}
