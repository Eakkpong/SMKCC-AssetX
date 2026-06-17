'use server';

import pool from '@/lib/db';
import { redirect } from 'next/navigation';

export async function submitRepairRequest(formData: FormData) {
  const equipment_id = formData.get('equipment_id')?.toString();
  const asset_code = formData.get('asset_code')?.toString();
  const issue_description = formData.get('issue_description')?.toString();

  if (!equipment_id || !issue_description || !asset_code) {
    throw new Error('Missing required fields');
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Insert into repair_requests
    await client.query(
      `INSERT INTO repair_requests (equipment_id, issue_description, status) 
       VALUES ($1, $2, 'รอดำเนินการ')`,
      [equipment_id, issue_description]
    );

    // 2. Update equipments status to 'ส่งซ่อม'
    await client.query(
      `UPDATE equipments SET status = 'ส่งซ่อม', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [equipment_id]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting repair request:', error);
    throw new Error('Failed to submit repair request');
  } finally {
    client.release();
  }

  // Redirect back to equipment page
  redirect(`/equipment/${asset_code}?reported=true`);
}
