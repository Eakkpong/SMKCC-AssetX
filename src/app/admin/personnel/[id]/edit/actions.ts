'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updatePersonnel(id: string, formData: FormData) {
  const department_id = formData.get('department_id') as string;
  const title = formData.get('title') as string;
  const first_name = formData.get('first_name') as string;
  const last_name = formData.get('last_name') as string;
  const position = formData.get('position') as string;
  const status = formData.get('status') as string;

  if (!department_id) {
    return { success: false, error: 'กรุณาเลือกสังกัด' };
  }

  try {
    await pool.query(
      `UPDATE personnel 
       SET title = $1, first_name = $2, last_name = $3, "position" = $4, department_id = $5, status = $6
       WHERE id = $7`,
      [title, first_name, last_name, position, department_id, status, id]
    );

    revalidatePath('/admin/personnel');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating personnel:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
