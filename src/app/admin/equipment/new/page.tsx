import pool from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EquipmentForm from './EquipmentForm';

export default async function NewEquipmentPage() {
  const result = await pool.query('SELECT * FROM personnel ORDER BY first_name ASC');
  const personnel = result.rows;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/admin/equipment" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">เพิ่มครุภัณฑ์ใหม่</h1>
      </div>

      <EquipmentForm personnel={personnel} />
    </div>
  );
}