const { Pool } = require('pg');
const fs = require('fs');
const dbUrl = fs.readFileSync('.env.local', 'utf8').match(/DATABASE_URL=(.*)/)[1];
const pool = new Pool({ connectionString: dbUrl });

async function alterTable() {
  try {
    await pool.query('ALTER TABLE repair_requests ADD COLUMN external_shop VARCHAR(255)');
    console.log('Added external_shop column');
  } catch (err) {
    if (err.code === '42701') console.log('Column external_shop already exists');
    else console.error(err);
  }

  try {
    await pool.query('ALTER TABLE repair_requests ADD COLUMN repair_cost DECIMAL(10, 2)');
    console.log('Added repair_cost column');
  } catch (err) {
    if (err.code === '42701') console.log('Column repair_cost already exists');
    else console.error(err);
  }

  pool.end();
}

alterTable();
