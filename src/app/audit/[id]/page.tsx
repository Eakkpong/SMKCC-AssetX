'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, AlertCircle, ScanLine } from 'lucide-react';

export default function AuditScannerPage() {
  const { id } = useParams();
  const [audit, setAudit] = useState<any>(null);
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [committeeName, setCommitteeName] = useState('');
  const [scanStatus, setScanStatus] = useState<{success: boolean, message: string} | null>(null);

  useEffect(() => {
    fetch(`/api/audit/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setAudit(data);
      });
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && committeeName) {
      const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 }, false);
      
      let isProcessing = false;
      scanner.render(async (decodedText) => {
        if (isProcessing) return;
        isProcessing = true;
        
        try {
          // Assuming the QR code might be a full URL, we extract just the asset_code
          let assetCode = decodedText;
          if (decodedText.includes('/equipment/')) {
            assetCode = decodedText.split('/equipment/')[1].replace('/', '');
          }

          const res = await fetch(`/api/audit/${id}/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ asset_code: assetCode, pin_code: pin, scanned_by: committeeName })
          });
          
          const result = await res.json();
          if (result.success) {
            setScanStatus({ success: true, message: `สแกนผ่าน: ${assetCode}` });
          } else {
            setScanStatus({ success: false, message: result.message || 'รหัสไม่ถูกต้อง' });
          }
        } catch (e) {
          setScanStatus({ success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
        }
        
        setTimeout(() => { isProcessing = false; }, 2000); // 2 second delay before next scan
      }, (error) => {
        // ignore continuous scanning errors
      });

      return () => {
        scanner.clear();
      };
    }
  }, [isAuthenticated, committeeName, id, pin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/audit/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin_code: pin })
    });
    if (res.ok) {
      setIsAuthenticated(true);
    } else {
      alert('รหัส PIN ไม่ถูกต้อง');
    }
  };

  if (!audit) return <div className="p-10 text-center">กำลังโหลด...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-2">เข้าสู่ระบบตรวจนับ</h1>
          <p className="text-gray-500 text-center mb-6">ปีงบประมาณ {audit.audit_year}</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัส PIN กรรมการ</label>
              <input 
                type="password" 
                required 
                className="w-full border border-gray-300 rounded p-3 text-center text-xl tracking-widest focus:ring-blue-500 focus:border-blue-500" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700">เข้าสู่ระบบ</button>
          </form>
        </div>
      </div>
    );
  }

  if (!committeeName) {
    const members = audit.committee_members.split(',').map((m: string) => m.trim());
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">ยินดีต้อนรับ</h2>
          <p className="mb-4">กรุณาเลือกชื่อของคุณเพื่อเริ่มบันทึกการสแกน</p>
          <div className="space-y-3">
            {members.map((member: string) => (
              <button 
                key={member}
                onClick={() => setCommitteeName(member)}
                className="w-full p-3 border-2 border-blue-100 rounded-lg text-blue-700 font-semibold hover:bg-blue-50 hover:border-blue-300 transition"
              >
                {member}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 bg-gray-800 flex justify-between items-center shadow-md">
        <div>
          <h1 className="font-bold">สแกนตรวจนับปี {audit.audit_year}</h1>
          <p className="text-xs text-gray-400">กรรมการ: {committeeName}</p>
        </div>
        <ScanLine className="text-blue-400" />
      </div>

      <div className="flex-1 flex flex-col p-4 items-center justify-center">
        {scanStatus && (
          <div className={`w-full max-w-sm mb-4 p-4 rounded-lg flex items-center space-x-3 shadow-lg transform transition-all ${scanStatus.success ? 'bg-green-600' : 'bg-red-600'}`}>
            {scanStatus.success ? <CheckCircle /> : <AlertCircle />}
            <span className="font-bold">{scanStatus.message}</span>
          </div>
        )}
        
        <div className="w-full max-w-md bg-black rounded-lg overflow-hidden border-2 border-gray-700">
          <div id="reader" className="w-full"></div>
        </div>
        
        <p className="mt-6 text-center text-gray-400 text-sm">
          เล็งกล้องไปที่ QR Code ของครุภัณฑ์ ระบบจะบันทึกให้อัตโนมัติเมื่ออ่านค่าสำเร็จ
        </p>
      </div>
    </div>
  );
}
