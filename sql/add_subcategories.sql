-- Subcategories Table
CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  image TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update Products Table to include subcategory
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT REFERENCES subcategories(name) ON UPDATE CASCADE;

-- Enable RLS
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access to subcategories" ON subcategories FOR SELECT USING (true);
