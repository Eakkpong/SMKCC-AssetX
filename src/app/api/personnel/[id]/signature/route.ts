import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { signature_data } = body;

    if (!signature_data) {
      return NextResponse.json({ error: 'Missing signature_data' }, { status: 400 });
    }

    await pool.query(`
      UPDATE personnel 
      SET signature_data = $1 
      WHERE id = $2
    `, [signature_data, id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving signature:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
