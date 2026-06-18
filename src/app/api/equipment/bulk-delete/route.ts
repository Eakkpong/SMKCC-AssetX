import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await verifyAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty IDs array' }, { status: 400 });
    }

    // Using ANY($1::int[]) is the safe way to do WHERE id IN (...) in node-postgres
    const result = await pool.query(`
      DELETE FROM equipments WHERE id = ANY($1::int[]) RETURNING id
    `, [ids]);

    return NextResponse.json({ deletedCount: result.rowCount, deletedIds: result.rows.map(r => r.id) });
  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
