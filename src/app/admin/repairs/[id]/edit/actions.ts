'use server';

import pool from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';

export async function updateRepairStatus(formData: FormData) {
  const repair_id = formData.get('repair_id')?.toString();
  const equipment_id = formData.get('equipment_id')?.toString();
  const status = formData.get('status')?.toString();
  const admin_notes = formData.get('admin_notes')?.toString();
  const external_shop = formData.get('external_shop')?.toString() || null;
  const repair_cost = formData.get('repair_cost')?.toString() || null;

  if (!repair_id || !equipment_id || !status) {
    throw new Error('Missing required fields');
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Update repair_requests
    let updateQuery = `
      UPDATE repair_requests 
      SET status = $1, admin_notes = $2, external_shop = $3, repair_cost = $4 
    `;
    let queryParams: any[] = [status, admin_notes, external_shop, repair_cost];

    // If status is 'เสร็จสิ้น', set resolved_at
    if (status === 'เสร็จสิ้น') {
      updateQuery += `, resolved_at = CURRENT_TIMESTAMP `;
    }

    updateQuery += ` WHERE id = $5`;
    queryParams.push(repair_id);

    await client.query(updateQuery, queryParams);

    // 2. Update equipment status if 'เสร็จสิ้น'
    if (status === 'เสร็จสิ้น') {
      await client.query(
        `UPDATE equipments SET status = 'ใช้งานได้', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [equipment_id]
      );
    } else if (status === 'กำลังซ่อม' || status === 'รอดำเนินการ' || status === 'ส่งซ่อมภายนอก') {
      await client.query(
        `UPDATE equipments SET status = 'ส่งซ่อม', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [equipment_id]
      );
    }

    await client.query('COMMIT');

    // 3. Fetch user email and send notification
    try {
      const emailQuery = await pool.query(
        `SELECT p.email, p.first_name, e.asset_code, r.issue_description
         FROM repair_requests r
         JOIN equipments e ON r.equipment_id = e.id
         JOIN personnel p ON e.owner_id = p.id
         WHERE r.id = $1`,
        [repair_id]
      );

      if (emailQuery.rows.length > 0 && emailQuery.rows[0].email) {
        const data = emailQuery.rows[0];
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        if (smtpUser && smtpPass) {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: smtpUser,
              pass: smtpPass
            }
          });

          let statusText = status;
          if (status === 'เสร็จสิ้น') statusText = '✅ ซ่อมเสร็จสิ้น';
          else if (status === 'กำลังซ่อม') statusText = '🔧 กำลังซ่อม';
          else if (status === 'ส่งซ่อมภายนอก') statusText = '🚚 ส่งซ่อมภายนอก';

          let adminNotesHtml = '';
          if (admin_notes) {
            adminNotesHtml = `<li><b>หมายเหตุจากช่าง:</b> ${admin_notes}</li>`;
          }

          const mailOptions = {
            from: `"SMKCC IT Support" <${smtpUser}>`,
            to: data.email,
            subject: `อัปเดตสถานะแจ้งซ่อม: ${data.asset_code} (${status})`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; background-color: #f4f6f8; border-radius: 8px;">
                <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h3 style="color: #1e3a8a;">สวัสดีคุณ ${data.first_name},</h3>
                  <p>ระบบขอแจ้งอัปเดตสถานะการแจ้งซ่อมครุภัณฑ์ของคุณ ดังนี้:</p>
                  <ul style="line-height: 1.6;">
                    <li><b>รหัสครุภัณฑ์:</b> ${data.asset_code}</li>
                    <li><b>อาการเสีย:</b> ${data.issue_description}</li>
                    <li><b>สถานะล่าสุด:</b> <strong style="color: #2563eb;">${statusText}</strong></li>
                    ${adminNotesHtml}
                  </ul>
                  <br/>
                  <p style="color: #64748b; font-size: 14px;">ขอบคุณที่ใช้บริการระบบ SMKCC AssetX</p>
                </div>
              </div>
            `
          };

          await transporter.sendMail(mailOptions);
        }
      }
    } catch (emailErr) {
      console.error('Failed to send email notification:', emailErr);
    }
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
