const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const dbUrlMatch = envFile.match(/DATABASE_URL=(.*)/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1].replace(/['"]/g, '') : null;

async function setupAuditTables() {
  const client = new Client({
    connectionString: dbUrl
  });
  
  try {
    await client.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS audits (
        id SERIAL PRIMARY KEY,
        audit_year VARCHAR(10) NOT NULL,
        pin_code VARCHAR(20) NOT NULL,
        committee_members TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_items (
        id SERIAL PRIMARY KEY,
        audit_id INTEGER REFERENCES audits(id) ON DELETE CASCADE,
        equipment_id INTEGER REFERENCES equipments(id) ON DELETE CASCADE,
        scanned_by VARCHAR(255) NOT NULL,
        scanned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(audit_id, equipment_id)
      );
    `);
    
    console.log("Audit tables created successfully!");
    
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    await client.end();
  }
}

setupAuditTables();
