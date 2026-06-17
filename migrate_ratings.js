const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const dbUrlMatch = envFile.match(/DATABASE_URL=(.*)/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1].replace(/['"]/g, '') : null;

async function migrate() {
  const client = new Client({ connectionString: dbUrl });
  
  try {
    await client.connect();
    
    await client.query(`
      ALTER TABLE repair_requests
      ADD COLUMN IF NOT EXISTS rating_speed INTEGER,
      ADD COLUMN IF NOT EXISTS rating_quality INTEGER,
      ADD COLUMN IF NOT EXISTS rating_service INTEGER,
      ADD COLUMN IF NOT EXISTS rating_overall INTEGER,
      ADD COLUMN IF NOT EXISTS feedback TEXT,
      ADD COLUMN IF NOT EXISTS rated_at TIMESTAMP WITHOUT TIME ZONE;
    `);
    
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}

migrate();
