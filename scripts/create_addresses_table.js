import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log('Connected to DB');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_addresses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
        title TEXT,
        state TEXT NOT NULL,
        district TEXT NOT NULL,
        address_line TEXT NOT NULL,
        pincode TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Users can view own addresses" ON public.user_addresses;
      CREATE POLICY "Users can view own addresses" ON public.user_addresses
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can insert own addresses" ON public.user_addresses;
      CREATE POLICY "Users can insert own addresses" ON public.user_addresses
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can update own addresses" ON public.user_addresses;
      CREATE POLICY "Users can update own addresses" ON public.user_addresses
        FOR UPDATE USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can delete own addresses" ON public.user_addresses;
      CREATE POLICY "Users can delete own addresses" ON public.user_addresses
        FOR DELETE USING (auth.uid() = user_id);
    `);

    console.log('Addresses table and policies created successfully.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

run();
