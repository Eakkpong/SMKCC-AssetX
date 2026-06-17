import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;
    
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    await client.query(`
      UPDATE audits 
      SET status = $1
      WHERE id = $2
    `, [status, id]);
    
    client.release();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating audit:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
