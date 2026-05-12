import fs from 'fs';
import path from 'path';
import pkg from 'pg';
import dotenv from 'dotenv';
const { Client } = pkg;

dotenv.config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
});

async function run() {
  await client.connect();
  console.log('Connected to DB. Dropping existing tables...');

  // Drop existing tables
  const dropQuery = `
    DROP TABLE IF EXISTS 
      cart_items, 
      order_items, 
      orders, 
      addresses, 
      banners, 
      products, 
      categories, 
      profiles 
    CASCADE;
  `;
  await client.query(dropQuery);
  console.log('Tables dropped.');

  const sqlFiles = [
    'SUPABASE_SETUP.sql',
    'db_schema_update.sql',
    'supabase_schema.sql',
    'SUPABASE_RESTORE_ECOMMERCE.sql',
    'sql/performance_optimizations.sql'
  ];

  for (const file of sqlFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`Running ${file}...`);
      const sql = fs.readFileSync(filePath, 'utf8');
      try {
        await client.query(sql);
        console.log(`Successfully executed ${file}`);
      } catch (err) {
        console.error(`Error executing ${file}:`, err);
      }
    } else {
      console.log(`File not found: ${file}`);
    }
  }

  await client.end();
  console.log('Database rebuild complete.');
}

run().catch(console.error);
