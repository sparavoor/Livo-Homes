-- 1. Cart Items Table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- Matches products.id (TEXT)
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies for Cart Items
CREATE POLICY "Users can manage their own cart items." ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- 4. Verify Addresses Table (already partially defined but ensuring completeness)
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- e.g., 'Home', 'Work'
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own addresses." ON public.addresses
  FOR ALL USING (auth.uid() = profile_id);

-- 5. Ensure Orders and Order Items have correct policies for checkout
-- (Assuming they were created by supabase_schema.sql)

-- Grant access to authenticated users
GRANT ALL ON TABLE public.cart_items TO authenticated;
GRANT ALL ON TABLE public.addresses TO authenticated;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.order_items TO authenticated;

-- Grant read access to service_role for admin tasks
GRANT ALL ON TABLE public.cart_items TO service_role;
GRANT ALL ON TABLE public.addresses TO service_role;
GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.order_items TO service_role;
GRANT ALL ON TABLE public.profiles TO service_role;
