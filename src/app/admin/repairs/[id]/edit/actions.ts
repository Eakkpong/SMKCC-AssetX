'use server';

import pool from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function updateRepairStatus(formData: FormData) {
  const repair_id = formData.get('repair_id')?.toString();
  const equipment_id = formData.get('equipment_id')?.toString();
  const status = formData.get('status')?.toString();
  const admin_notes = formData.get('admin_notes')?.toString();

  if (!repair_id || !equipment_id || !status) {
    throw new Error('Missing required fields');
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Update repair_requests
    let updateQuery = `
      UPDATE repair_requests 
      SET status = $1, admin_notes = $2 
    `;
    let queryParams: any[] = [status, admin_notes];

    // If status is 'เสร็จสิ้น', set resolved_at
    if (status === 'เสร็จสิ้น') {
      updateQuery += `, resolved_at = CURRENT_TIMESTAMP `;
    }

    updateQuery += ` WHERE id = $3`;
    queryParams.push(repair_id);

    await client.query(updateQuery, queryParams);

    // 2. Update equipment status if 'เสร็จสิ้น'
    if (status === 'เสร็จสิ้น') {
      await client.query(
        `UPDATE equipments SET status = 'ใช้งานได้', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [equipment_id]
      );
    } else if (status === 'กำลังซ่อม' || status === 'รอดำเนินการ') {
      await client.query(
        `UPDATE equipments SET status = 'ส่งซ่อม', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [equipment_id]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating repair request:', error);
    throw new Error('Failed to update repair request');
  } finally {
    client.release();
  }

  revalidatePath('/admin/repairs');
  revalidatePath('/admin');
  redirect('/admin/repairs');
}
