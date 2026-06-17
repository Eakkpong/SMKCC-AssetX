'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createPersonnel(formData: FormData) {
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
    // 1. Get department code
    const deptRes = await pool.query('SELECT dept_code FROM departments WHERE id = $1', [department_id]);
    if (deptRes.rows.length === 0) {
      return { success: false, error: 'ไม่พบข้อมูลสังกัด' };
    }
    const deptCode = deptRes.rows[0].dept_code.toUpperCase();

    // 2. Generate employee code: EMP-{DEPT_CODE}-{XXX}
    // Find the latest employee code for this department
    const latestRes = await pool.query(
      `SELECT employee_code FROM personnel 
       WHERE employee_code LIKE $1 
       ORDER BY employee_code DESC LIMIT 1`,
      [`EMP-${deptCode}-%`]
    );

    let nextNumber = 1;
    if (latestRes.rows.length > 0) {
      const latestCode = latestRes.rows[0].employee_code;
      // EMP-DIR-001 -> parts: ['EMP', 'DIR', '001']
      const parts = latestCode.split('-');
      if (parts.length === 3) {
        const numPart = parseInt(parts[2], 10);
        if (!isNaN(numPart)) {
          nextNumber = numPart + 1;
        }
      }
    }

    const newEmployeeCode = `EMP-${deptCode}-${nextNumber.toString().padStart(3, '0')}`;

    // 3. Insert into database
    await pool.query(
      `INSERT INTO personnel (employee_code, title, first_name, last_name, "position", department_id, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [newEmployeeCode, title, first_name, last_name, position, department_id, status]
    );

    revalidatePath('/admin/personnel');
    return { success: true, employee_code: newEmployeeCode };
  } catch (error: any) {
    console.error('Error creating personnel:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
