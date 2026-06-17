'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createDepartment(formData: FormData) {
  const dept_code = formData.get('dept_code') as string;
  const dept_name = formData.get('dept_name') as string;

  if (!dept_code || !dept_name) {
    return { success: false, error: 'กรุณากรอกรหัสและชื่อสังกัด' };
  }

  try {
    const existing = await pool.query('SELECT id FROM departments WHERE dept_code = $1', [dept_code.toUpperCase()]);
    if (existing.rows.length > 0) {
      return { success: false, error: 'รหัสสังกัดนี้มีอยู่ในระบบแล้ว' };
    }

    const res = await pool.query(
      `INSERT INTO departments (dept_code, dept_name) VALUES ($1, $2) RETURNING id`,
      [dept_code.toUpperCase(), dept_name]
    );

    revalidatePath('/admin/personnel');
    return { success: true, department_id: res.rows[0].id };
  } catch (error: any) {
    console.error('Error creating department:', error);
    return { success: false, error: error.message };
  }
}
