const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/assetx'
});

client.connect()
  .then(() => client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'borrowings'"))
  .then(res => {
    console.log(res.rows);
    return client.end();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
