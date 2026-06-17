import pool from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PersonnelForm from './PersonnelForm';

export default async function NewPersonnelPage() {
  const result = await pool.query('SELECT * FROM departments ORDER BY dept_name ASC');
  const departments = result.rows;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/admin/personnel" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">เพิ่มบุคลากรใหม่</h1>
      </div>

      <PersonnelForm initialDepartments={departments} />
    </div>
  );
}
