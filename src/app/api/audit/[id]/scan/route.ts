import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { asset_code, pin_code, scanned_by } = await request.json();
    
    const client = await pool.connect();
    
    // 1. Verify PIN again for security
    const auditRes = await client.query('SELECT id FROM audits WHERE id = $1 AND pin_code = $2', [id, pin_code]);
    if (auditRes.rows.length === 0) {
      client.release();
      return NextResponse.json({ success: false, message: 'Invalid PIN' }, { status: 401 });
    }
    
    // 2. Find Equipment ID by asset_code
    const eqRes = await client.query('SELECT id FROM equipments WHERE asset_code = $1', [asset_code]);
    if (eqRes.rows.length === 0) {
      client.release();
      return NextResponse.json({ success: false, message: 'ไม่พบครุภัณฑ์หมายเลขนี้ในระบบ' }, { status: 404 });
    }
    const equipmentId = eqRes.rows[0].id;

    // 3. Insert into audit_items (using ON CONFLICT DO NOTHING to prevent duplicates)
    await client.query(`
      INSERT INTO audit_items (audit_id, equipment_id, scanned_by, status)
      VALUES ($1, $2, $3, 'Found')
      ON CONFLICT (audit_id, equipment_id) DO UPDATE SET scanned_by = EXCLUDED.scanned_by, scanned_at = CURRENT_TIMESTAMP
    `, [id, equipmentId, scanned_by]);

    client.release();

    return NextResponse.json({ success: true, message: 'บันทึกสำเร็จ' });
  } catch (error) {
    console.error('Error recording scan:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
