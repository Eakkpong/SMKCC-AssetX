const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const lines = env.split('\n');
  const urlLine = lines.find(l => l.startsWith('DATABASE_URL='));
  const url = urlLine.substring('DATABASE_URL='.length).replace(/'|"/g, '').trim();

  const client = new Client({ connectionString: url });
  
  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position;
    `);
    
    let currentTable = '';
    res.rows.forEach(row => {
      if (row.table_name !== currentTable) {
        console.log(`\nTable: ${row.table_name}`);
        currentTable = row.table_name;
      }
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
