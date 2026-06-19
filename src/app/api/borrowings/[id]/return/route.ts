import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { receiver_id } = body;

    if (!receiver_id) {
      return NextResponse.json({ error: 'Missing receiver_id' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Update borrowing status to 'returned'
      await client.query(`
        UPDATE borrowings 
        SET status = 'returned', actual_return_date = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [id]);

      // 2. Free up equipments
      await client.query(`
        UPDATE equipments 
        SET status = 'ว่าง', owner_id = NULL 
        WHERE id IN (
          SELECT equipment_id FROM borrowing_items WHERE borrowing_id = $1
        )
      `, [id]);

      // 3. Get borrower's original signature to use as returner
      const borrowerSigRes = await client.query(`
        SELECT signature_data, signed_by_name 
        FROM borrowing_signatures 
        WHERE borrowing_id = $1 AND role = 'borrower'
      `, [id]);

      if (borrowerSigRes.rows.length > 0) {
        const bSig = borrowerSigRes.rows[0];
        await client.query(`
          INSERT INTO borrowing_signatures (borrowing_id, role, signature_data, signed_by_name)
          VALUES ($1, 'returner', $2, $3)
          ON CONFLICT (borrowing_id, role) 
          DO UPDATE SET signature_data = EXCLUDED.signature_data, signed_at = CURRENT_TIMESTAMP
        `, [id, bSig.signature_data, bSig.signed_by_name]);
      }

      // 4. Get receiver's saved signature from personnel table
      const personnelRes = await client.query(`
        SELECT title, first_name, last_name, signature_data 
        FROM personnel 
        WHERE id = $1
      `, [receiver_id]);

      if (personnelRes.rows.length > 0 && personnelRes.rows[0].signature_data) {
        const p = personnelRes.rows[0];
        const fullName = `(${p.title}${p.first_name} ${p.last_name})`;
        await client.query(`
          INSERT INTO borrowing_signatures (borrowing_id, role, signature_data, signed_by_name)
          VALUES ($1, 'receiver', $2, $3)
          ON CONFLICT (borrowing_id, role) 
          DO UPDATE SET signature_data = EXCLUDED.signature_data, signed_at = CURRENT_TIMESTAMP
        `, [id, p.signature_data, fullName]);
      }

      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error returning equipment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
