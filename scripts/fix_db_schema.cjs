const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function fixDatabase() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  try {
    console.log('--- 1. Adding Missing Columns to Orders Table ---');
    await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS district TEXT;');
    await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code TEXT;');
    await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12, 2);');
    
    console.log('--- 2. Creating user_addresses Table ---');
    // Ensure gen_random_uuid is available (pg 13+) or using uuid-ossp
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_addresses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        state TEXT NOT NULL,
        district TEXT NOT NULL,
        address_line TEXT NOT NULL,
        pincode TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      );
    `);

    console.log('--- 3. Configuring RLS and Permissions ---');
    await client.query('ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;');
    
    await client.query('DROP POLICY IF EXISTS "Users can manage their own addresses." ON public.user_addresses;');
    await client.query('CREATE POLICY "Users can manage their own addresses." ON public.user_addresses FOR ALL USING (auth.uid() = user_id);');
    
    await client.query('GRANT ALL ON TABLE public.user_addresses TO authenticated;');
    await client.query('GRANT ALL ON TABLE public.user_addresses TO service_role;');

    // Relax RLS for orders/items to allow guest checkout or easier flow
    await client.query('DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;');
    await client.query('CREATE POLICY "Users can insert their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);');
    
    await client.query('DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;');
    await client.query('CREATE POLICY "Users can insert their own order items" ON order_items FOR INSERT WITH CHECK (true);');

    console.log('--- 4. Creating Promo Code RPC if missing ---');
    await client.query(`
      CREATE OR REPLACE FUNCTION increment_promo_usage(p_code TEXT)
      RETURNS void AS $$
      BEGIN
        -- Add promo tracking logic here if needed
        -- This is a placeholder since the promo table isn't fully defined yet
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    console.log('\n✅ Database fixes applied successfully.');
  } catch (err) {
    console.error('❌ Error applying database fixes:', err);
  } finally {
    await client.end();
  }
}

fixDatabase();
