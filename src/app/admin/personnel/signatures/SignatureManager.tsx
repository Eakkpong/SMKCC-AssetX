'use client';

import { useState } from 'react';
import SignaturePad from '@/components/SignaturePad';
import { CheckCircle2 } from 'lucide-react';

export default function SignatureManager({ officers }: { officers: any[] }) {
  const [personnelList, setPersonnelList] = useState(officers);
  const [signingOfficer, setSigningOfficer] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSaveSignature = async (base64: string) => {
    if (!signingOfficer) return;
    setSubmitting(true);
    
    try {
      const res = await fetch(`/api/personnel/${signingOfficer.id}/signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature_data: base64 })
      });

      if (res.ok) {
        setPersonnelList(personnelList.map(p => 
          p.id === signingOfficer.id ? { ...p, signature_data: base64 } : p
        ));
        setSigningOfficer(null);
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

  if (signingOfficer) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <SignaturePad 
          title={`ลายเซ็น: ${signingOfficer.title}${signingOfficer.first_name} ${signingOfficer.last_name}`} 
          onSave={handleSaveSignature} 
          onCancel={() => setSigningOfficer(null)} 
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {personnelList.length === 0 && (
        <div className="col-span-2 text-center text-gray-500 py-10">
          ไม่พบรายชื่อเจ้าหน้าที่พัสดุในระบบ (ค้นหาจากตำแหน่งที่มีคำว่า 'พัสดุ')
        </div>
      )}
      {personnelList.map(officer => (
        <div key={officer.id} className="border rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50 relative overflow-hidden group hover:border-blue-300 transition">
          <h3 className="font-bold text-gray-800">{officer.title}{officer.first_name} {officer.last_name}</h3>
          <p className="text-sm text-gray-500 mb-4">{officer.position}</p>
          
          {officer.signature_data ? (
            <div className="flex flex-col items-center w-full">
              <img src={officer.signature_data} alt="Signature" className="h-24 object-contain mb-2 bg-white w-full rounded border border-gray-100 p-2" />
              <div className="absolute top-4 right-4 text-green-500">
                <CheckCircle2 size={24} />
              </div>
              <button 
                onClick={() => setSigningOfficer(officer)}
                className="text-sm text-blue-600 mt-2 hover:underline"
              >
                แก้ไขลายเซ็น
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSigningOfficer(officer)}
              className="w-full py-6 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 font-semibold hover:bg-blue-50 transition flex flex-col items-center justify-center"
            >
              <span className="text-3xl mb-2">🖋️</span>
              <span>เพิ่มลายเซ็น</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
