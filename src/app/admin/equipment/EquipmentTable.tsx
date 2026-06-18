'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Edit, Printer } from 'lucide-react';
export default function EquipmentTable({ initialEquipments }: { initialEquipments: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEquipments = initialEquipments.filter(eq => {
    const term = searchTerm.toLowerCase();
    return (
      (eq.asset_code && eq.asset_code.toLowerCase().includes(term)) ||
      (eq.category && eq.category.toLowerCase().includes(term)) ||
      (eq.brand && eq.brand.toLowerCase().includes(term)) ||
      (eq.location && eq.location.toLowerCase().includes(term))
    );
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center">
        <div className="flex w-full max-w-lg space-x-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="TEST ค้นหา..." 
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ค้นหา
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสครุภัณฑ์</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท/ยี่ห้อ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานที่</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEquipments.length > 0 ? filteredEquipments.map((eq) => (
              <tr key={eq.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{eq.asset_code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{eq.category}</div>
                  <div className="text-gray-500 text-xs">{eq.brand}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.location}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${eq.status === 'ใช้งานได้' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {eq.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <Link href={`/admin/equipment/${eq.id}/print-qr`} target="_blank" className="text-gray-600 hover:text-gray-900 inline-flex items-center" title="พิมพ์ QR Code">
                    <Printer size={16} className="mr-1"/> พิมพ์ QR
                  </Link>
                  <Link href={`/admin/equipment/${eq.id}/edit`} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                    <Edit size={16} className="mr-1"/> แก้ไข
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  ไม่พบข้อมูลครุภัณฑ์ที่ค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
