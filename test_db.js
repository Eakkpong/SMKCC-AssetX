const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const dbUrlMatch = envFile.match(/DATABASE_URL=(.*)/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1].replace(/['"]/g, '') : null;

async function testQuery() {
  const client = new Client({
    connectionString: dbUrl
  });
  
  try {
    await client.connect();
    
    const { rows } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'audits';
    `);
    
    console.log("Audits table columns:", rows);
    
    const countRes = await client.query('SELECT COUNT(*) FROM audits');
    console.log("Count:", countRes.rows);
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

testQuery();
