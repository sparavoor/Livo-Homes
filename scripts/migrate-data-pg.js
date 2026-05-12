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
  console.log('Connected to DB for data migration using pg...');

  // 1. Migrate Categories
  const categoriesPath = path.join(process.cwd(), 'src/data/categories.json');
  if (fs.existsSync(categoriesPath)) {
    const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    console.log(`Migrating ${categories.length} categories...`);
    for (const cat of categories) {
      const query = `
        INSERT INTO categories (id, name, image, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          image = EXCLUDED.image,
          description = EXCLUDED.description;
      `;
      try {
        await client.query(query, [cat.id, cat.name, cat.image, cat.description || '']);
        console.log(`Migrated category: ${cat.name}`);
      } catch(err) {
        console.error(`Error migrating category ${cat.name}:`, err.message);
      }
    }
  }

  // 2. Migrate Products
  const productsPath = path.join(process.cwd(), 'src/data/products.json');
  if (fs.existsSync(productsPath)) {
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    console.log(`Migrating ${products.length} products...`);
    for (const p of products) {
      const query = `
        INSERT INTO products (
          id, name, category, price, original_price, description, 
          image, images, stock, is_new, is_bestseller, 
          is_signature_masterpiece, material, color, size, availability, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          price = EXCLUDED.price,
          original_price = EXCLUDED.original_price,
          description = EXCLUDED.description,
          image = EXCLUDED.image,
          images = EXCLUDED.images,
          stock = EXCLUDED.stock,
          is_new = EXCLUDED.is_new,
          is_bestseller = EXCLUDED.is_bestseller,
          is_signature_masterpiece = EXCLUDED.is_signature_masterpiece,
          material = EXCLUDED.material,
          color = EXCLUDED.color,
          size = EXCLUDED.size,
          availability = EXCLUDED.availability;
      `;
      const values = [
        p.id, p.name, p.category, p.price, p.originalPrice, p.description,
        p.image, p.images || [p.image], p.stock || 0, p.isNew ?? true,
        p.isBestseller ?? false, p.isSignatureMasterpiece ?? false,
        p.material, p.color, p.size,
        p.availability || (p.stock > 0 ? 'In Stock' : 'Sold Out'),
        p.createdAt || new Date().toISOString()
      ];
      try {
        await client.query(query, values);
        console.log(`Migrated product: ${p.name}`);
      } catch(err) {
        console.error(`Error migrating product ${p.name}:`, err.message);
      }
    }
  }

  // 3. Migrate Banners
  const bannersPath = path.join(process.cwd(), 'src/data/banners.json');
  if (fs.existsSync(bannersPath)) {
    const banners = JSON.parse(fs.readFileSync(bannersPath, 'utf8'));
    console.log(`Migrating ${banners.length} banners...`);
    for (const b of banners) {
      const query = `
        INSERT INTO banners (title, subtitle, image_url, link_url, is_active, display_order)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      try {
        await client.query(query, [b.title, b.subtitle, b.image, b.link, b.isActive ?? true, b.order || 0]);
        console.log(`Migrated banner: ${b.title}`);
      } catch(err) {
        console.error(`Error migrating banner ${b.title}:`, err.message);
      }
    }
  }

  console.log('Data migration complete!');
  await client.end();
}

run().catch(console.error);
