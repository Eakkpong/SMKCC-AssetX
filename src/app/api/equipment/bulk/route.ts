import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
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

      // Process in chunks of 1000 to prevent hitting parameter limits (65535 max)
      const chunkSize = 1000;
      for (let i = 0; i < equipments.length; i += chunkSize) {
        const chunk = equipments.slice(i, i + chunkSize);
        
        const valueStrings = [];
        const params: any[] = [];
        let paramIndex = 1;

        for (const eq of chunk) {
          valueStrings.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
          
          // Data Type Validation: strip non-digits to handle inputs like "8 GB" or "8GB"
          const ram = eq.ram_gb ? parseInt(String(eq.ram_gb).replace(/\\D/g, '')) : null;
          const storage = eq.storage_gb ? parseInt(String(eq.storage_gb).replace(/\\D/g, '')) : null;

          params.push(
            eq.asset_code, eq.category, eq.brand, eq.model, eq.specifications, eq.location, eq.status || 'ใช้งานได้',
            eq.serial_number, eq.mac_address, eq.ip_address, eq.os_version, eq.cpu_detail, 
            isNaN(ram!) ? null : ram,
            isNaN(storage!) ? null : storage
          );
        }

        const query = `
          INSERT INTO equipments (
            asset_code, category, brand, model, specifications, location, status,
            serial_number, mac_address, ip_address, os_version, cpu_detail, ram_gb, storage_gb
          ) VALUES ${valueStrings.join(', ')}
          RETURNING *
        `;

        const result = await client.query(query, params);
        insertedEquipments.push(...result.rows);
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
