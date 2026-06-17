"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Save, Plus } from 'lucide-react';
import { createPersonnel } from './actions';
import { createDepartment } from '../actions';
import { useRouter } from 'next/navigation';

export default function PersonnelForm({ initialDepartments }: { initialDepartments: any[] }) {
  const router = useRouter();
  const [departments, setDepartments] = useState(initialDepartments);
  const [loading, setLoading] = useState(false);
  const [showAddDept, setShowAddDept] = useState(false);

  // New department state
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [deptLoading, setDeptLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await createPersonnel(formData);
      if (result.success) {
        alert('บันทึกสำเร็จ! รหัสพนักงานใหม่คือ: ' + result.employee_code);
        router.push('/admin/personnel');
      } else {
        alert("เกิดข้อผิดพลาด: " + result.error);
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDepartment() {
    if (!newDeptCode || !newDeptName) {
      alert('กรุณากรอกรหัสและชื่อสังกัดให้ครบถ้วน');
      return;
    }
    
    setDeptLoading(true);
    const fd = new FormData();
    fd.append('dept_code', newDeptCode);
    fd.append('dept_name', newDeptName);

    const result = await createDepartment(fd);
    if (result.success) {
      // Add to local state dropdown
      setDepartments([...departments, { id: result.department_id, dept_code: newDeptCode.toUpperCase(), dept_name: newDeptName }]);
      setShowAddDept(false);
      setNewDeptCode('');
      setNewDeptName('');
    } else {
      alert(result.error);
    }
    setDeptLoading(false);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสพนักงาน</label>
            <input type="text" disabled className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500" placeholder="สร้างอัตโนมัติตามสังกัด (เช่น EMP-DIR-001)"/>
            <p className="text-xs text-gray-500 mt-1">รหัสพนักงานจะถูกสร้างโดยอัตโนมัติเมื่อกดบันทึก</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สังกัด (Department) *</label>
            <div className="flex space-x-2">
              <select name="department_id" required className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">-- เลือกสังกัด --</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.dept_name} ({d.dept_code})</option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={() => setShowAddDept(!showAddDept)}
                className="bg-gray-100 border border-gray-300 hover:bg-gray-200 px-3 rounded-md flex items-center text-gray-700 transition"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        {showAddDept && (
          <div className="p-4 bg-blue-50 rounded-md border border-blue-100 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-blue-800 mb-1">รหัสสังกัด (อักษรย่อ เช่น IT, DIR)</label>
              <input type="text" value={newDeptCode} onChange={(e) => setNewDeptCode(e.target.value)} className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm" placeholder="รหัสสังกัด"/>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-blue-800 mb-1">ชื่อสังกัด</label>
              <input type="text" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm" placeholder="ชื่อสังกัดเต็ม"/>
            </div>
            <button 
              type="button" 
              onClick={handleAddDepartment}
              disabled={deptLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {deptLoading ? 'กำลังเพิ่ม...' : 'เพิ่มสังกัด'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้าชื่อ</label>
            <select name="title" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
              <option value="อ.">อ.</option>
              <option value="ผศ.">ผศ.</option>
              <option value="ดร.">ดร.</option>
            </select>
          </div>
          <div></div> {/* Empty column for alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อจริง *</label>
            <input type="text" name="first_name" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="ชื่อ"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล *</label>
            <input type="text" name="last_name" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="นามสกุล"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง *</label>
            <input type="text" name="position" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="เช่น อาจารย์ประจำ, เจ้าหน้าที่ไอที"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
            <select name="status" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option value="Active">ปฏิบัติงาน (Active)</option>
              <option value="Inactive">ลาออก/เกษียณ (Inactive)</option>
            </select>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
          <Link href="/admin/personnel" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium">
            ยกเลิก
          </Link>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center space-x-2 disabled:opacity-50">
            <Save size={18} />
            <span>{loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
