"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Printer } from 'lucide-react';
import { createEquipment } from './actions';
import { QRCodeSVG } from 'qrcode.react';

export default function NewEquipmentPage() {
  const [loading, setLoading] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await createEquipment(formData);
      if (result.success) {
        setSuccessCode(result.asset_code || null);
      } else {
        alert("เกิดข้อผิดพลาด: " + result.error);
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    const printContent = document.getElementById('print-area');
    const originalContents = document.body.innerHTML;
    if (printContent) {
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore React state cleanly
    }
  }

  if (successCode) {
    const qrUrl = `https://smkcc-asset-x.vercel.app/equipment/${successCode}`;
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center mt-10">
        <h2 className="text-2xl font-bold text-green-600 mb-6">บันทึกข้อมูลสำเร็จ!</h2>
        
        <div id="print-area" className="mb-6">
          <div className="mx-auto p-4 border border-dashed border-gray-400 inline-flex flex-col items-center justify-center bg-white" style={{ width: '200px' }}>
            <p className="text-[12px] font-bold text-[#1e3a8a] mb-2 font-sans">วิทยาลัยชุมชนสมุทรสาคร</p>
            <QRCodeSVG value={qrUrl} size={120} />
            <p className="text-[14px] font-bold text-gray-800 mt-2 font-sans">{successCode}</p>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium flex items-center space-x-2">
            <Printer size={20} />
            <span>พิมพ์ QR Code</span>
          </button>
          <button onClick={() => setSuccessCode(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-medium">
            เพิ่มชิ้นใหม่
          </button>
          <Link href="/admin/equipment" className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-md font-medium">
            กลับหน้ารายการ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/admin/equipment" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">เพิ่มครุภัณฑ์ใหม่</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสครุภัณฑ์ *</label>
              <input type="text" name="asset_code" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="เช่น 7110-007-0005-1-67"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทอุปกรณ์ *</label>
              <input type="text" name="category" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="เช่น Desktop PC, Monitor"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อ (Brand)</label>
              <input type="text" name="brand" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="เช่น Dell, HP"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รุ่น (Model)</label>
              <input type="text" name="model" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="เช่น OptiPlex 7090"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่ตั้ง *</label>
              <input type="text" name="location" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="เช่น ห้องสมุด, ห้องเซิร์ฟเวอร์"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <select name="status" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="ใช้งานได้">ใช้งานได้</option>
                <option value="ชำรุด">ชำรุด</option>
                <option value="ส่งซ่อม">ส่งซ่อม</option>
                <option value="แทงจำหน่าย">แทงจำหน่าย</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Link href="/admin/equipment" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium">
              ยกเลิก
            </Link>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center space-x-2 disabled:opacity-50">
              <Save size={18} />
              <span>{loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}