const { Pool } = require('pg');
const fs = require('fs');
const dbUrl = fs.readFileSync('.env.local', 'utf8').match(/DATABASE_URL=(.*)/)[1];
const pool = new Pool({ connectionString: dbUrl });

pool.query("UPDATE equipments SET status = 'ส่งซ่อม' WHERE status = 'ส่งซ่อม / ชำรุด'")
  .then(res => { console.log('Updated db'); pool.end(); })
  .catch(err => { console.error(err); pool.end(); });
