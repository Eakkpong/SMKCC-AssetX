import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    await pool.query('ALTER TABLE personnel ADD COLUMN IF NOT EXISTS signature_data TEXT;');
    await pool.query('ALTER TABLE borrowings ADD COLUMN IF NOT EXISTS actual_return_date TIMESTAMP;');
    return NextResponse.json({ success: true, message: 'Schema migrated successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
