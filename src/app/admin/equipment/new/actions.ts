'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createEquipment(formData: FormData) {
  const asset_code = formData.get('asset_code') as string;
  const category = formData.get('category') as string;
  const brand = formData.get('brand') as string;
  const model = formData.get('model') as string;
  const location = formData.get('location') as string;
  const status = formData.get('status') as string;

  try {
    // Check if asset code already exists
    const existing = await pool.query('SELECT id FROM equipments WHERE asset_code = $1', [asset_code]);
    if (existing.rows.length > 0) {
      return { success: false, error: 'รหัสครุภัณฑ์นี้มีในระบบแล้ว' };
    }

    await pool.query(
      `INSERT INTO equipments (asset_code, category, brand, model, location, status) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [asset_code, category, brand, model, location, status]
    );

    revalidatePath('/admin/equipment');
    return { success: true, asset_code };
  } catch (error: any) {
    console.error('Error creating equipment:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
