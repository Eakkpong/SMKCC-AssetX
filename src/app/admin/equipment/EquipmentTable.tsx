'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Search, Edit, Printer, Upload, Download, Trash2, FileText } from 'lucide-react';
import ExportSingleQrPdfButton from '@/components/ExportSingleQrPdfButton';
import { generateBulkQrPdf } from '@/lib/pdf/generateBulkQrPdf';
import Papa from 'papaparse';

export default function EquipmentTable({ initialEquipments }: { initialEquipments: any[] }) {
  const [equipments, setEquipments] = useState(initialEquipments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredEquipments = equipments.filter(eq => {
    const term = searchTerm.toLowerCase();
    return (
      (eq.asset_code && eq.asset_code.toLowerCase().includes(term)) ||
      (eq.category && eq.category.toLowerCase().includes(term)) ||
      (eq.brand && eq.brand.toLowerCase().includes(term)) ||
      (eq.location && eq.location.toLowerCase().includes(term))
    );
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredEquipments.map(eq => eq.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "asset_code,category,brand,model,location,status,specifications\nCOMP-001,คอมพิวเตอร์,Dell,Optiplex 7090,ห้อง 301,ใช้งานได้,Core i5 Gen 11 8GB SSD256";
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "equipment_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch('/api/equipment/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(results.data)
          });
          
          if (!res.ok) throw new Error('Failed to import');
          
          const insertedItems = await res.json();
          setEquipments(prev => [...insertedItems, ...prev]);
          alert(`นำเข้าสำเร็จ ${insertedItems.length} รายการ ระบบจะสร้าง PDF สำหรับปรินต์ให้ทันที!`);
          
          // Generate Bulk PDF automatically for newly imported items
          await generateBulkQrPdf(insertedItems, `Imported_QR_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err) {
          console.error(err);
          alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (err) => {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ CSV');
        setIsImporting(false);
      }
    });
  };

  const handleBulkDelete = async () => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลจำนวน ${selectedIds.length} รายการ?`)) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch('/api/equipment/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      
      setEquipments(prev => prev.filter(eq => !selectedIds.includes(eq.id)));
      setSelectedIds([]);
      alert('ลบข้อมูลเรียบร้อยแล้ว');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkPrintQr = async () => {
    const selectedEquipments = equipments.filter(eq => selectedIds.includes(eq.id));
    await generateBulkQrPdf(selectedEquipments, `Selected_QR_${new Date().toISOString().slice(0, 10)}.pdf`);
    setSelectedIds([]); // Optional: deselect after print
  };

  return (
    <div className="space-y-4">
      {/* Action Bar when items are selected */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex justify-between items-center shadow-sm animate-fade-in">
          <div className="text-blue-800 font-medium">
            เลือกไว้ {selectedIds.length} รายการ
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleBulkPrintQr}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm text-sm"
            >
              <Printer size={16} />
              <span>พิมพ์ QR ที่เลือก</span>
            </button>
            <button 
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition shadow-sm text-sm disabled:opacity-50"
            >
              <Trash2 size={16} />
              <span>{isDeleting ? 'กำลังลบ...' : 'ลบข้อมูลที่เลือก'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Top Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex w-full max-w-md space-x-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="ค้นหารหัสครุภัณฑ์, ยี่ห้อ, สถานที่..." 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium"
            >
              <FileText size={16} />
              <span className="hidden sm:inline">โหลดเทมเพลต CSV</span>
            </button>
            
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImportCSV} 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center space-x-2 px-3 py-2 bg-[#1e3a8a] text-white rounded-md hover:bg-blue-800 transition text-sm font-medium disabled:opacity-50"
            >
              <Upload size={16} />
              <span>{isImporting ? 'กำลังนำเข้า...' : 'นำเข้า CSV'}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    checked={filteredEquipments.length > 0 && selectedIds.length === filteredEquipments.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสครุภัณฑ์</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท/ยี่ห้อ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานที่</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEquipments.length > 0 ? filteredEquipments.map((eq) => (
                <tr key={eq.id} className={`hover:bg-blue-50 transition-colors ${selectedIds.includes(eq.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap w-12">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      checked={selectedIds.includes(eq.id)}
                      onChange={(e) => handleSelectOne(e, eq.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1e3a8a]">{eq.asset_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">{eq.category}</div>
                    <div className="text-gray-500 text-xs">{eq.brand || '-'} {eq.model || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${eq.status === 'ใช้งานได้' ? 'bg-green-100 text-green-800' : eq.status === 'รอซ่อม' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                      {eq.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <ExportSingleQrPdfButton equipment={eq} />
                    <Link href={`/admin/equipment/${eq.id}/edit`} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                      <Edit size={16} className="mr-1"/> แก้ไข
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-10 w-10 text-gray-300 mb-2" />
                      <p>ไม่พบข้อมูลครุภัณฑ์ที่ค้นหา</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
