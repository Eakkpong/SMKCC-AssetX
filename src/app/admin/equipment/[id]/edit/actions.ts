'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateEquipment(id: string, formData: FormData) {
  const category = formData.get('category') as string;
  const brand = formData.get('brand') as string;
  const model = formData.get('model') as string;
  const location = formData.get('location') as string;
  const status = formData.get('status') as string;

  try {
    await pool.query(
      `UPDATE equipments 
       SET category = $1, brand = $2, model = $3, location = $4, status = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [category, brand, model, location, status, id]
    );

    revalidatePath('/admin/equipment');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating equipment:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}