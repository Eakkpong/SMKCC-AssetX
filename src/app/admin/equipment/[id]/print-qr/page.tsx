import pool from '@/lib/db';
import { notFound } from 'next/navigation';
import PrintQrClient from './PrintQrClient';

export default async function PrintQrPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const result = await pool.query('SELECT * FROM equipments WHERE id = $1', [resolvedParams.id]);
  
  if (result.rows.length === 0) {
    return notFound();
  }
  
  const eq = result.rows[0];
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://smkcc-asset-x.vercel.app'}/equipment/${eq.asset_code}`;

  return <PrintQrClient equipment={eq} url={url} />;
}
