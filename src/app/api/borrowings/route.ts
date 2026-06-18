import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';

    const result = await pool.query(`
      SELECT b.*, 
             p.first_name, p.last_name, p.position,
             (SELECT COUNT(*) FROM borrowing_items bi WHERE bi.borrowing_id = b.id) as item_count
      FROM borrowings b
      LEFT JOIN personnel p ON b.personnel_id = p.id
      ORDER BY b.created_at DESC
      LIMIT $1
    `, [parseInt(limit)]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { personnel_id, expected_return_date, purpose, equipment_ids } = body;

    if (!personnel_id || !expected_return_date || !equipment_ids || equipment_ids.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate Document No: e.g. B-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const document_no = `B-${dateStr}-${randStr}`;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const borrowRes = await client.query(`
        INSERT INTO borrowings (document_no, personnel_id, borrow_date, expected_return_date, purpose, status)
        VALUES ($1, $2, CURRENT_DATE, $3, $4, 'pending')
        RETURNING id
      `, [document_no, personnel_id, expected_return_date, purpose]);

      const borrowing_id = borrowRes.rows[0].id;

      // Insert items and update equipment status to 'ถูกยืม'
      for (const eq_id of equipment_ids) {
        await client.query(`
          INSERT INTO borrowing_items (borrowing_id, equipment_id)
          VALUES ($1, $2)
        `, [borrowing_id, eq_id]);

        await client.query(`
          UPDATE equipments SET owner_id = $1, status = 'ถูกยืม' WHERE id = $2
        `, [personnel_id, eq_id]);
      }

      await client.query('COMMIT');
      return NextResponse.json({ id: borrowing_id, document_no }, { status: 201 });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating borrowing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
