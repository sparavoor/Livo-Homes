import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrate() {
  console.log('Starting migration...');

  // 1. Migrate Categories
  const categoriesPath = path.join(process.cwd(), 'src/data/categories.json');
  if (fs.existsSync(categoriesPath)) {
    const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    console.log(`Found ${categories.length} categories to migrate.`);

    for (const cat of categories) {
      const { error } = await supabase
        .from('categories')
        .upsert({
          id: cat.id,
          name: cat.name,
          image: cat.image,
          description: cat.description || ''
        });

      if (error) {
        console.error(`Error migrating category ${cat.name}:`, error.message);
      } else {
        console.log(`Migrated category: ${cat.name}`);
      }
    }
  }

  // 2. Migrate Products
  const productsPath = path.join(process.cwd(), 'src/data/products.json');
  if (fs.existsSync(productsPath)) {
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    console.log(`Found ${products.length} products to migrate.`);

    for (const p of products) {
      const { error } = await supabase
        .from('products')
        .upsert({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          original_price: p.originalPrice,
          description: p.description,
          image: p.image,
          images: p.images || [p.image],
          stock: p.stock || 0,
          is_new: p.isNew ?? true,
          is_bestseller: p.isBestseller ?? false,
          is_signature_masterpiece: p.isSignatureMasterpiece ?? false,
          material: p.material,
          color: p.color,
          size: p.size,
          availability: p.availability || (p.stock > 0 ? 'In Stock' : 'Sold Out'),
          created_at: p.createdAt || new Date().toISOString()
        });

      if (error) {
        console.error(`Error migrating product ${p.name}:`, error.message);
      } else {
        console.log(`Migrated product: ${p.name}`);
      }
    }
  }

  // 3. Migrate Banners
  const bannersPath = path.join(process.cwd(), 'src/data/banners.json');
  if (fs.existsSync(bannersPath)) {
    const banners = JSON.parse(fs.readFileSync(bannersPath, 'utf8'));
    console.log(`Found ${banners.length} banners to migrate.`);

    for (const b of banners) {
      const { error } = await supabase
        .from('banners')
        .upsert({
          title: b.title,
          subtitle: b.subtitle,
          image_url: b.image,
          link_url: b.link,
          is_active: b.isActive ?? true,
          display_order: b.order || 0
        });

      if (error) {
        console.error(`Error migrating banner ${b.title}:`, error.message);
      } else {
        console.log(`Migrated banner: ${b.title}`);
      }
    }
  }

  console.log('Migration completed!');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
