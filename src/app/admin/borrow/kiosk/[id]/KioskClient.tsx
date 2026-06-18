'use client';

import { useState } from 'react';
import SignaturePad from '@/components/SignaturePad';
import { ArrowLeft, CheckCircle2, FileDown, Printer } from 'lucide-react';
import Link from 'next/link';
import { generateBorrowingPdf } from '@/lib/pdf/generateBorrowingPdf';

export default function KioskClient({ docData, docId }: { docData: any, docId: string }) {
  const [signatures, setSignatures] = useState<any[]>(docData.signatures || []);
  const [signingRole, setSigningRole] = useState<string | null>(null);
  const [signingTitle, setSigningTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getSignature = (role: string) => signatures.find(s => s.role === role);

  const roles = [
    { key: 'borrower', title: 'ผู้ขอยืม', name: `${docData.title}${docData.first_name} ${docData.last_name}` },
    { key: 'assistant_parcel', title: 'ผู้ช่วยเจ้าหน้าที่พัสดุ', name: '(..........................................)' },
    { key: 'parcel_officer', title: 'เจ้าหน้าที่พัสดุ', name: '(..........................................)' },
    { key: 'head_parcel', title: 'หัวหน้าเจ้าหน้าที่พัสดุ', name: '(นางสาวพรพรรณ นิลศิริ)' },
    { key: 'director', title: 'ผู้อำนวยการ', name: '(นายเผด็จ เปล่งปลั่ง)' }
  ];

  const handleOpenPad = (roleKey: string, roleTitle: string) => {
    setSigningRole(roleKey);
    setSigningTitle(`ลายเซ็น: ${roleTitle}`);
  };

  const handleSaveSignature = async (base64: string) => {
    if (!signingRole) return;
    setSubmitting(true);
    
    try {
      const res = await fetch(`/api/borrowings/${docId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: signingRole,
          signature_data: base64
        })
      });

      if (res.ok) {
        // Optimistic update
        setSignatures([...signatures.filter(s => s.role !== signingRole), { role: signingRole, signature_data: base64 }]);
        setSigningRole(null);
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกลายเซ็น');
      }
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate PDF
  const handleDownloadPDF = async () => {
    try {
      await generateBorrowingPdf(docData);
    } catch (e) {
      console.error(e);
      alert('ไม่สามารถสร้าง PDF ได้');
    }
  };

  if (signingRole) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <SignaturePad 
          title={signingTitle} 
          onSave={handleSaveSignature} 
          onCancel={() => setSigningRole(null)} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
      <div className="bg-[#1e3a8a] text-white p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/borrow" className="text-white/80 hover:text-white transition">
            <ArrowLeft size={28} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">โหมดขอลายเซ็น (iPad Kiosk Mode)</h1>
            <p className="text-blue-200">เลขที่เอกสาร: {docData.document_no}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleDownloadPDF} className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition font-medium">
            <Printer size={20} />
            <span>พิมพ์ PDF</span>
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-8 border-b pb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">รายละเอียดการยืม</h2>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <p><strong>ผู้ยืม:</strong> {docData.title}{docData.first_name} {docData.last_name}</p>
            <p><strong>ตำแหน่ง:</strong> {docData.position}</p>
            <p><strong>วันที่ยืม:</strong> {new Date(docData.borrow_date).toLocaleDateString('th-TH')}</p>
            <p><strong>กำหนดส่งคืน:</strong> {new Date(docData.expected_return_date).toLocaleDateString('th-TH')}</p>
            <p className="col-span-2"><strong>เหตุผลการยืม:</strong> {docData.purpose}</p>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">รายการพัสดุ</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            {docData.items.map((item: any) => (
              <li key={item.id}>{item.asset_code} - {item.category} {item.brand} {item.model}</li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roles.map(role => {
            const sig = getSignature(role.key);
            return (
              <div key={role.key} className="border rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50 relative overflow-hidden group hover:border-blue-300 transition">
                <h3 className="font-bold text-gray-800 mb-4">{role.title}</h3>
                
                {sig ? (
                  <div className="flex flex-col items-center">
                    <img src={sig.signature_data} alt="Signature" className="h-24 object-contain mb-2" />
                    <p className="text-sm font-medium text-gray-900">{role.name}</p>
                    <div className="absolute top-4 right-4 text-green-500">
                      <CheckCircle2 size={24} />
                    </div>
                    {/* Allow re-signing if clicked */}
                    <button 
                      onClick={() => handleOpenPad(role.key, role.title)}
                      className="text-xs text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition underline"
                    >
                      เซ็นใหม่
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenPad(role.key, role.title)}
                    className="w-full py-8 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 font-semibold hover:bg-blue-50 transition flex flex-col items-center justify-center"
                  >
                    <span className="text-4xl mb-2">🖋️</span>
                    <span>กดเพื่อเซ็นชื่อ</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
