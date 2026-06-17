import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await pool.connect();
    const { rows } = await client.query(`
      SELECT a.*, 
             (SELECT count(*) FROM audit_items ai WHERE ai.audit_id = a.id) as scanned_count
      FROM audits a
      ORDER BY a.created_at DESC
    `);
    client.release();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching audits:', error);
    return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { audit_year, pin_code, committee_members } = body;

    const client = await pool.connect();
    const { rows } = await client.query(`
      INSERT INTO audits (audit_year, pin_code, committee_members)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [audit_year, pin_code, committee_members]);
    client.release();

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating audit:', error);
    return NextResponse.json({ error: 'Failed to create audit' }, { status: 500 });
  }
}
