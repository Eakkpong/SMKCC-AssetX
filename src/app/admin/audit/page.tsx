'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, QrCode, Download, Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminAuditPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    audit_year: '',
    pin_code: '',
    committee_members: ''
  });

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    const res = await fetch('/api/admin/audits');
    if (res.ok) {
      const data = await res.json();
      setAudits(data);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setShowModal(false);
      setFormData({ audit_year: '', pin_code: '', committee_members: '' });
      fetchAudits();
    } else {
      alert('เกิดข้อผิดพลาดในการสร้างรอบตรวจนับ');
    }
  };

  const handleEndAudit = async (id: number) => {
    if (!confirm('ยืนยันการปิดรอบตรวจนับ? หลังจากปิดแล้วจะไม่สามารถแก้ไขผลการตรวจนับได้อีก')) return;
    const res = await fetch(`/api/admin/audits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Completed' })
    });
    if (res.ok) {
      fetchAudits();
    } else {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">จัดการการตรวจนับประจำปี</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition"
        >
          <PlusCircle size={20} />
          <span>สร้างรอบตรวจนับใหม่</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {audits.map((audit) => (
          <div key={audit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">ปีงบประมาณ {audit.audit_year}</h3>
              <span className={`px-2 py-1 text-xs rounded-full font-semibold ${audit.status === 'Active' ? 'bg-green-400 text-green-900' : 'bg-gray-300 text-gray-800'}`}>
                {audit.status}
              </span>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center text-gray-600">
                <Users size={18} className="mr-2" />
                <span className="text-sm">กรรมการ: <br/><span className="font-semibold text-gray-800">{audit.committee_members}</span></span>
              </div>
              <div className="bg-gray-50 p-3 rounded border border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">รหัส PIN: <span className="font-bold text-gray-800 text-lg">{audit.pin_code}</span></span>
                <span className="text-sm text-gray-500">สแกนแล้ว: <span className="font-bold text-blue-600">{audit.scanned_count} / {audit.total_count}</span> ชิ้น</span>
              </div>
              
              <div className="pt-2 flex flex-col space-y-2">
                <Link href={`/audit/${audit.id}`} target="_blank" className="w-full flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md transition text-sm">
                  <QrCode size={16} />
                  <span>เปิดหน้าสแกน (สำหรับกรรมการ)</span>
                </Link>
                <a href={`/api/export/inventory?audit_id=${audit.id}`} className="w-full flex items-center justify-center space-x-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md transition text-sm" download>
                  <Download size={16} />
                  <span>โหลดทะเบียนคุม Excel ({audit.audit_year})</span>
                </a>
                {audit.status === 'Active' && (
                  <button onClick={() => handleEndAudit(audit.id)} className="w-full mt-2 text-red-600 hover:text-red-700 text-sm font-semibold underline underline-offset-2">
                    จบการตรวจนับ (ปิดรอบ)
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {audits.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500">
            ยังไม่มีรอบการตรวจนับ กรุณากดปุ่ม "สร้างรอบตรวจนับใหม่"
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">สร้างรอบตรวจนับพัสดุ</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ปีงบประมาณ (เช่น 2568)</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={formData.audit_year}
                  onChange={(e) => setFormData({...formData, audit_year: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รหัส PIN (สำหรับกรรมการเข้าสู่ระบบ)</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={formData.pin_code}
                  onChange={(e) => setFormData({...formData, pin_code: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รายชื่อคณะกรรมการ (คั่นด้วยลูกน้ำ ,)</label>
                <textarea 
                  required 
                  rows={3}
                  placeholder="นายสมชาย ใจดี, นางสาวสมหญิง จริงใจ"
                  className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={formData.committee_members}
                  onChange={(e) => setFormData({...formData, committee_members: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
