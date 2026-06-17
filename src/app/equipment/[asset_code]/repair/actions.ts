'use server';

import pool from '@/lib/db';
import { redirect } from 'next/navigation';

export async function submitRepairRequest(formData: FormData) {
  const equipment_id = formData.get('equipment_id')?.toString();
  const asset_code = formData.get('asset_code')?.toString();
  const issue_description = formData.get('issue_description')?.toString();
  const reporter_name = formData.get('reporter_name')?.toString() || '';

  if (!equipment_id || !issue_description || !asset_code) {
    throw new Error('Missing required fields');
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Insert into repair_requests
    await client.query(
      `INSERT INTO repair_requests (equipment_id, issue_description, reporter_name, status) 
       VALUES ($1, $2, $3, 'รอดำเนินการ')`,
      [equipment_id, issue_description, reporter_name]
    );

    // 2. Update equipments status to 'ส่งซ่อม'
    await client.query(
      `UPDATE equipments SET status = 'ส่งซ่อม', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [equipment_id]
    );

    await client.query('COMMIT');

    // 3. Send Telegram Notification (if configured)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (botToken && chatId) {
      const message = \`🚨 <b>มีการแจ้งซ่อมใหม่</b> 🚨\\n\\n<b>รหัสครุภัณฑ์:</b> \${asset_code}\\n<b>ผู้แจ้ง:</b> \${reporter_name}\\n<b>อาการเสีย:</b> \${issue_description}\\n\\n<a href="\${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin">ดูรายละเอียดในระบบ</a>\`;
      
      try {
        await fetch(\`https://api.telegram.org/bot\${botToken}/sendMessage\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
          })
        });
      } catch (err) {
        console.error('Failed to send Telegram notification:', err);
      }
    }
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
