import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Fetch borrowing doc
    const borrowRes = await pool.query(`
      SELECT b.*, p.first_name, p.last_name, p.position, p.title
      FROM borrowings b
      LEFT JOIN personnel p ON b.personnel_id = p.id
      WHERE b.id = $1
    `, [id]);

    if (borrowRes.rows.length === 0) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
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

    return NextResponse.json({
      ...borrowing,
      items: itemsRes.rows,
      signatures: sigRes.rows
    });
  } catch (error) {
    console.error('Error fetching borrowing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Find equipment ids
      const itemsRes = await client.query('SELECT equipment_id FROM borrowing_items WHERE borrowing_id = $1', [id]);
      const eqIds = itemsRes.rows.map(r => r.equipment_id);

      if (eqIds.length > 0) {
        // Release equipments
        await client.query(`
          UPDATE equipments 
          SET status = 'ว่าง', owner_id = NULL 
          WHERE id = ANY($1::int[])
        `, [eqIds]);
      }

      // Update borrowing status
      await client.query(`
        UPDATE borrowings 
        SET status = 'cancelled' 
        WHERE id = $1
      `, [id]);

      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error cancelling borrowing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
