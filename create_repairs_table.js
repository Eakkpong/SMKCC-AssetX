const { Pool } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = envFile.match(/DATABASE_URL=(.*)/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : '';

const pool = new Pool({
  connectionString: dbUrl,
});

async function main() {
  const query = `
    CREATE TABLE IF NOT EXISTS repair_requests (
      id SERIAL PRIMARY KEY,
      equipment_id INTEGER NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
      issue_description TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'รอดำเนินการ',
      reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      resolved_at TIMESTAMP,
      admin_notes TEXT
    );
  `;
  try {
    await pool.query(query);
    console.log("Table repair_requests created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await pool.end();
  }
}

main();
