import pool from '@/lib/db';
import { notFound } from 'next/navigation';
import KioskClient from './KioskClient';

export default async function KioskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch borrowing doc
  const borrowRes = await pool.query(`
    SELECT b.*, p.first_name, p.last_name, p.position, p.title
    FROM borrowings b
    LEFT JOIN personnel p ON b.personnel_id = p.id
    WHERE b.id = $1
  `, [id]);

  if (borrowRes.rows.length === 0) {
    notFound();
  }

  const borrowing = borrowRes.rows[0];

  // Fetch items
  const itemsRes = await pool.query(`
    SELECT bi.*, e.asset_code, e.category, e.brand, e.model
    FROM borrowing_items bi
    JOIN equipments e ON bi.equipment_id = e.id
    WHERE bi.borrowing_id = $1
  `, [id]);

  // Fetch signatures
  const sigRes = await pool.query(`
    SELECT role, signature_data, signed_by_name, signed_at
    FROM borrowing_signatures
    WHERE borrowing_id = $1
  `, [id]);

  const docData = {
    ...borrowing,
    items: itemsRes.rows,
    signatures: sigRes.rows
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <KioskClient docData={docData} docId={id} />
    </div>
  );
}
