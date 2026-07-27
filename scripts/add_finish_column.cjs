const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  try {
    console.log('Adding finish column to products table...');
    await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS finish TEXT;');
    console.log('✅ Column finish successfully added/verified.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.end();
  }
}

migrate();
