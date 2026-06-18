import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await params;
    const body = await request.json();
    const { role, signature_data, signed_by_name } = body;

    if (!role || !signature_data) {
      return NextResponse.json({ error: 'Missing role or signature_data' }, { status: 400 });
    }

    // Upsert signature for the role
    const sigRes = await pool.query(`
      SELECT id FROM borrowing_signatures WHERE borrowing_id = $1 AND role = $2
    `, [id, role]);

    if (sigRes.rows.length > 0) {
      // Update
      await pool.query(`
        UPDATE borrowing_signatures 
        SET signature_data = $1, signed_by_name = $2, signed_at = CURRENT_TIMESTAMP
        WHERE borrowing_id = $3 AND role = $4
      `, [signature_data, signed_by_name || null, id, role]);
    } else {
      // Insert
      await pool.query(`
        INSERT INTO borrowing_signatures (borrowing_id, role, signature_data, signed_by_name)
        VALUES ($1, $2, $3, $4)
      `, [id, role, signature_data, signed_by_name || null]);
    }

    // Check if director just signed to update status
    if (role === 'director') {
      await pool.query(`UPDATE borrowings SET status = 'approved' WHERE id = $1`, [id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error signing document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
