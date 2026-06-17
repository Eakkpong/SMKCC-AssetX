"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function DashboardFilters({ departments }: { departments: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [departmentId, setDepartmentId] = useState(searchParams.get('dept') || '');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (status) params.set('status', status);
    if (departmentId) params.set('dept', departmentId);
    
    router.push(`/admin?${params.toString()}`);
  }

  function handleClear() {
    setQuery('');
    setStatus('');
    setDepartmentId('');
    router.push('/admin');
  }

  return (
    <form onSubmit={handleSearch} className="mb-6 flex flex-col md:flex-row gap-4">
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหารหัสครุภัณฑ์, ยี่ห้อ, สถานที่..." 
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      
      <select 
        value={departmentId} 
        onChange={(e) => setDepartmentId(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 sm:text-sm"
      >
        <option value="">ทุกสังกัด</option>
        {departments.map((d: any) => (
          <option key={d.id} value={d.id}>{d.dept_code} - {d.dept_name}</option>
        ))}
      </select>

      <select 
        value={status} 
        onChange={(e) => setStatus(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 sm:text-sm"
      >
        <option value="">ทุกสถานะ</option>
        <option value="ใช้งานได้">ใช้งานได้</option>
        <option value="ชำรุด">ชำรุด</option>
        <option value="ส่งซ่อม">ส่งซ่อม</option>
        <option value="แทงจำหน่าย">แทงจำหน่าย</option>
      </select>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
        ค้นหา
      </button>
      {(query || status || departmentId) && (
        <button type="button" onClick={handleClear} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 font-medium">
          ล้างตัวกรอง
        </button>
      )}
    </form>
  );
}
