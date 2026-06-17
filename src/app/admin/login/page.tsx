import { login } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    'use server';
    const password = formData.get('password') as string;
    const success = await login(password);
    if (success) {
      redirect('/admin');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo.png" alt="Logo" width={80} height={80} className="mb-4" />
          <h1 className="text-2xl font-bold text-[#1e3a8a]">เข้าสู่ระบบจัดการ</h1>
          <p className="text-sm text-gray-500 mt-1">งานเทคโนโลยีสารสนเทศ วิทยาลัยชุมชนสมุทรสาคร</p>
        </div>
        
        <form action={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input 
              type="password" 
              name="password" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-[#1e3a8a] text-white font-bold py-2 px-4 rounded-md hover:bg-blue-800 transition duration-150"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}

