const { Client } = require('pg');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf-8');
const dbUrlMatch = envFile.match(/DATABASE_URL=(.*)/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1].replace(/['"]/g, '') : null;

async function count() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  const res = await client.query('SELECT count(*) FROM equipments');
  console.log('Count:', res.rows[0].count);
  await client.end();
}
count();
