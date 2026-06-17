'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createPersonnel(formData: FormData) {
  const employee_code = formData.get('employee_code') as string;
  const title = formData.get('title') as string;
  const first_name = formData.get('first_name') as string;
  const last_name = formData.get('last_name') as string;
  const position = formData.get('position') as string;
  const status = formData.get('status') as string;

  try {
    const existing = await pool.query('SELECT id FROM personnel WHERE employee_code = $1', [employee_code]);
    if (existing.rows.length > 0) {
      return { success: false, error: 'รหัสพนักงานนี้มีในระบบแล้ว' };
    }

    await pool.query(
      `INSERT INTO personnel (employee_code, title, first_name, last_name, "position", status) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [employee_code, title, first_name, last_name, position, status]
    );

    revalidatePath('/admin/personnel');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating personnel:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
