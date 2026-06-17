const { Pool } = require('pg');
const fs = require('fs');
const dbUrl = fs.readFileSync('.env.local', 'utf8').match(/DATABASE_URL=(.*)/)[1];
const pool = new Pool({ connectionString: dbUrl });

async function alterTable() {
  try {
    await pool.query('ALTER TABLE repair_requests ADD COLUMN reporter_name VARCHAR(255)');
    console.log('Added reporter_name column');
  } catch (err) {
    if (err.code === '42701') {
      console.log('Column reporter_name already exists');
    } else {
      console.error(err);
    }
  } finally {
    pool.end();
  }
}

alterTable();
