import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { createPersonnel } from './actions';
import { redirect } from 'next/navigation';

export default function NewPersonnelPage() {
  async function handleSubmit(formData: FormData) {
    'use server';
    const result = await createPersonnel(formData);
    if (result.success) {
      redirect('/admin/personnel');
    } else {
      // In a real app we'd show the error using useActionState
      console.error(result.error);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/admin/personnel" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">เพิ่มบุคลากรใหม่</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสพนักงาน *</label>
              <input type="text" name="employee_code" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="เช่น EMP001"/>
            </div>
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
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center space-x-2">
              <Save size={18} />
              <span>บันทึกข้อมูล</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
