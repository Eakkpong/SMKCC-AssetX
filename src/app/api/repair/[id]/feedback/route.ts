import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await pool.connect();
    
    const { rows } = await client.query(`
      SELECT r.id, r.issue_description, r.status, r.rating_overall,
             e.asset_code, e.category, e.brand, e.model
      FROM repair_requests r
      JOIN equipments e ON r.equipment_id = e.id
      WHERE r.id = $1
    `, [id]);
    
    client.release();
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 });
    }
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching repair:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rating_speed, rating_quality, rating_service, rating_overall, feedback } = body;
    
    const client = await pool.connect();
    
    // Check if already rated
    const checkRes = await client.query('SELECT rating_overall FROM repair_requests WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 });
    }
    if (checkRes.rows[0].rating_overall !== null) {
      client.release();
      return NextResponse.json({ error: 'Already rated' }, { status: 400 });
    }

    await client.query(`
      UPDATE repair_requests 
      SET rating_speed = $1,
          rating_quality = $2,
          rating_service = $3,
          rating_overall = $4,
          feedback = $5,
          rated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `, [rating_speed, rating_quality, rating_service, rating_overall, feedback, id]);
    
    client.release();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
