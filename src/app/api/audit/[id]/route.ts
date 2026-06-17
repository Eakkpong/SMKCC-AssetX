import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await pool.connect();
    const { rows } = await client.query(`
      SELECT id, audit_year, committee_members, status
      FROM audits WHERE id = $1
    `, [id]);
    client.release();

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching audit:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { pin_code } = await request.json();
    const client = await pool.connect();
    const { rows } = await client.query(`
      SELECT id FROM audits WHERE id = $1 AND pin_code = $2
    `, [id, pin_code]);
    client.release();

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid PIN' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying pin:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
