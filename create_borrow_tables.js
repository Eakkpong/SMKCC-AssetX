const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const lines = env.split('\n');
  const urlLine = lines.find(l => l.startsWith('DATABASE_URL='));
  const url = urlLine.substring('DATABASE_URL='.length).replace(/'|"/g, '').trim();

  const client = new Client({ connectionString: url });
  
  try {
    await client.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS borrowings (
        id SERIAL PRIMARY KEY,
        document_no VARCHAR(50) NOT NULL,
        personnel_id INTEGER REFERENCES personnel(id),
        borrow_date DATE NOT NULL,
        expected_return_date DATE NOT NULL,
        purpose TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS borrowing_items (
        id SERIAL PRIMARY KEY,
        borrowing_id INTEGER REFERENCES borrowings(id) ON DELETE CASCADE,
        equipment_id INTEGER REFERENCES equipments(id),
        remark TEXT
      );

      CREATE TABLE IF NOT EXISTS borrowing_signatures (
        id SERIAL PRIMARY KEY,
        borrowing_id INTEGER REFERENCES borrowings(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL,
        signature_data TEXT NOT NULL,
        signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        signed_by_name VARCHAR(100)
      );
    `);
    
    console.log("Borrowing tables created successfully.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
