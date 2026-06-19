const { Client } = require('pg');
const ExcelJS = require('exceljs');
const fs = require('fs');

async function run() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const lines = env.split('\n');
  const urlLine = lines.find(l => l.startsWith('DATABASE_URL='));
  const url = urlLine.substring('DATABASE_URL='.length).replace(/'|"/g, '').trim();

  const client = new Client({ connectionString: url });
  
  try {
    await client.connect();
    
    // Query items with no owner
    const res = await client.query(`
      SELECT asset_code, category, brand, model, location, status, specifications
      FROM equipments 
      WHERE owner_id IS NULL
      ORDER BY asset_code ASC
    `);
    
    // Create Excel Workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('ไม่มีผู้ครอบครอง');
    
    sheet.columns = [
      { header: 'รหัสครุภัณฑ์ (asset_code)', key: 'asset_code', width: 25 },
      { header: 'หมวดหมู่ (category)', key: 'category', width: 20 },
      { header: 'ยี่ห้อ (brand)', key: 'brand', width: 15 },
      { header: 'รุ่น (model)', key: 'model', width: 15 },
      { header: 'สถานที่ (location)', key: 'location', width: 20 },
      { header: 'สถานะ (status)', key: 'status', width: 15 },
      { header: 'รายละเอียด (specifications)', key: 'specifications', width: 30 }
    ];
    
    // Add rows
    res.rows.forEach(row => {
      sheet.addRow(row);
    });
    
    // Style header row
    sheet.getRow(1).font = { bold: true };
    
    // Save to artifacts folder
    const outputPath = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\1e6a794b-e05c-4c0a-bf96-5c4e7baf98be\\missing_owners.xlsx';
    await workbook.xlsx.writeFile(outputPath);
    
    console.log(`Exported ${res.rows.length} rows to ${outputPath}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
