const { Client } = require('pg');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const urlLine = lines.find(l => l.startsWith('DATABASE_URL='));
const url = urlLine.substring('DATABASE_URL='.length).replace(/'|"/g, '').trim();

const client = new Client({ connectionString: url });
client.connect()
  .then(() => client.query('SELECT COUNT(*) FROM equipments WHERE owner_id IS NULL'))
  .then(r => {
    console.log(r.rows[0].count);
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
