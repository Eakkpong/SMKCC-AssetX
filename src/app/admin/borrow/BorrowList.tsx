'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, FileText, PenTool } from 'lucide-react';
import Link from 'next/link';

export default function BorrowList({ availableEquipments, personnel }: { availableEquipments: any[], personnel: any[] }) {
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [personnelId, setPersonnelId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [purpose, setPurpose] = useState('เพื่อใช้ในการปฏิบัติราชการ');
  const [selectedEqs, setSelectedEqs] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = async () => {
    try {
      const res = await fetch('/api/borrowings');
      const data = await res.json();
      setBorrowings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEqs.length === 0) {
      alert('กรุณาเลือกพัสดุอย่างน้อย 1 รายการ');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/borrowings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personnel_id: parseInt(personnelId),
          expected_return_date: expectedReturnDate,
          purpose,
          equipment_ids: selectedEqs
        })
      });
      if (res.ok) {
        setShowNewDialog(false);
        setPersonnelId('');
        setExpectedReturnDate('');
        setSelectedEqs([]);
        fetchBorrowings();
        // Since we created a new borrowing, we might want to refresh the available equipments, but we'd need to refresh the page.
        window.location.reload();
      } else {
        alert('เกิดข้อผิดพลาดในการสร้างใบยืม');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEq = (id: number) => {
    if (selectedEqs.includes(id)) {
      setSelectedEqs(selectedEqs.filter(e => e !== id));
    } else {
      setSelectedEqs([...selectedEqs, id]);
    }
  };

  const filteredDocs = borrowings.filter(b => 
    b.document_no?.toLowerCase().includes(search.toLowerCase()) ||
    b.first_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="ค้นหาเลขที่เอกสาร หรือชื่อผู้ยืม..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowNewDialog(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          <span>สร้างใบยืมใหม่</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่เอกสาร</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ขอยืม</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนพัสดุ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ยืม</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">กำลังโหลด...</td></tr>
            ) : filteredDocs.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">ไม่พบเอกสารใบยืม</td></tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">{doc.document_no}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.first_name} {doc.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.item_count} รายการ</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(doc.borrow_date).toLocaleDateString('th-TH')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      doc.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status === 'approved' ? 'อนุมัติแล้ว' : 'รอดำเนินการ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/kiosk/borrow/${doc.id}`} target="_blank" className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md">
                      <PenTool size={16} />
                      <span>โหมดขอลายเซ็น (iPad)</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Borrowing Dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowNewDialog(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleCreate}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">สร้างใบยืมพัสดุใหม่</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ผู้ขอยืม</label>
                      <select required value={personnelId} onChange={e => setPersonnelId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border">
                        <option value="">-- เลือกผู้ขอยืม --</option>
                        {personnel.map(p => (
                          <option key={p.id} value={p.id}>{p.title}{p.first_name} {p.last_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">เหตุผลการยืม</label>
                      <input type="text" required value={purpose} onChange={e => setPurpose(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">กำหนดส่งคืน (วันที่)</label>
                      <input type="date" required value={expectedReturnDate} onChange={e => setExpectedReturnDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">เลือกพัสดุที่ต้องการยืม (เฉพาะสถานะ 'ว่าง')</label>
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2">
                        {availableEquipments.length === 0 ? (
                          <p className="text-sm text-gray-500 p-2">ไม่มีพัสดุที่ว่างพร้อมให้ยืม</p>
                        ) : (
                          availableEquipments.map(eq => (
                            <label key={eq.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                                checked={selectedEqs.includes(eq.id)}
                                onChange={() => toggleEq(eq.id)}
                              />
                              <span className="text-sm text-gray-900 font-medium">{eq.asset_code}</span>
                              <span className="text-sm text-gray-500">{eq.category} {eq.brand} {eq.model}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" disabled={submitting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                    {submitting ? 'กำลังสร้าง...' : 'สร้างใบยืม'}
                  </button>
                  <button type="button" onClick={() => setShowNewDialog(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
