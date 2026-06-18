import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await verifyAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const equipments = await request.json();
    if (!Array.isArray(equipments) || equipments.length === 0) {
      return NextResponse.json({ error: 'Invalid data format or empty array' }, { status: 400 });
    }

    const insertedEquipments = [];

    // Use a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const eq of equipments) {
        const result = await client.query(`
          INSERT INTO equipments (
            asset_code, category, brand, model, specifications, location, status,
            serial_number, mac_address, ip_address, os_version, cpu_detail, ram_gb, storage_gb
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING *
        `, [
          eq.asset_code, eq.category, eq.brand, eq.model, eq.specifications, eq.location, eq.status || 'ใช้งานได้',
          eq.serial_number, eq.mac_address, eq.ip_address, eq.os_version, eq.cpu_detail, 
          eq.ram_gb ? parseInt(eq.ram_gb) : null, 
          eq.storage_gb ? parseInt(eq.storage_gb) : null
        ]);
        
        insertedEquipments.push(result.rows[0]);
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return NextResponse.json(insertedEquipments);
  } catch (error) {
    console.error('Bulk insert error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
