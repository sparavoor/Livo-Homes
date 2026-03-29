import fs from 'fs';
import path from 'path';

const PRODUCTS_PATH = path.join(process.cwd(), 'src/data/products.json');
const CATEGORIES_PATH = path.join(process.cwd(), 'src/data/categories.json');
const SETTINGS_PATH = path.join(process.cwd(), 'src/data/settings.json');
const BANNERS_PATH = path.join(process.cwd(), 'src/data/banners.json');

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  isActive: boolean;
  order: number;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
  socials: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  officeHours: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string; // Featured image
  images: string[]; // Gallery images
  stock: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isSignatureMasterpiece: boolean;
  createdAt: string;
  material?: string;
  color?: string;
  size?: string;
  availability: 'In Stock' | 'Sold Out';
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  count: number;
}

// Products
export async function getProducts(): Promise<Product[]> {
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: Number(p.price),
          originalPrice: p.original_price ? Number(p.original_price) : undefined,
          description: p.description,
          image: p.image,
          images: p.images || [p.image],
          stock: p.stock,
          isNew: p.is_new,
          isBestseller: p.is_bestseller,
          isSignatureMasterpiece: p.is_signature_masterpiece,
          createdAt: p.created_at,
          material: p.material,
          color: p.color,
          size: p.size,
          availability: p.availability,
        }));
      }
    }

    // Fallback to JSON
    if (!fs.existsSync(PRODUCTS_PATH)) return [];
    const data = fs.readFileSync(PRODUCTS_PATH, 'utf8');
    const products: Product[] = JSON.parse(data);
    return products.map(p => ({
      ...p,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
      images: p.images || [p.image],
      availability: p.availability || (p.stock > 0 ? 'In Stock' : 'Sold Out'),
    }));
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
}

export async function saveProducts(products: Product[]): Promise<void> {
  // Not used anymore as we save directly to DB, but kept for JSON fallback
  try {
    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Error saving products:', error);
  }
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: product.name,
        category: product.category,
        price: product.price,
        original_price: product.originalPrice,
        description: product.description,
        image: product.image,
        images: product.images,
        stock: product.stock,
        is_new: product.isNew ?? true,
        is_bestseller: product.isBestseller ?? false,
        is_signature_masterpiece: product.isSignatureMasterpiece ?? false,
        material: product.material,
        color: product.color,
        size: product.size,
        availability: product.availability || (product.stock > 0 ? 'In Stock' : 'Sold Out'),
      })
      .select()
      .single();

    if (error) throw error;
    if (data) {
      return {
        ...product,
        id: data.id,
        createdAt: data.created_at,
        isSignatureMasterpiece: data.is_signature_masterpiece,
        availability: data.availability,
      } as Product;
    }
  }

  // Fallback to JSON
  const products = await getProducts();
  const newProduct: Product = {
    ...product,
    id: Math.random().toString(36).substr(2, 9),
    isSignatureMasterpiece: product.isSignatureMasterpiece ?? false,
    createdAt: new Date().toISOString(),
    images: product.images || [product.image],
    availability: product.availability || (product.stock > 0 ? 'In Stock' : 'Sold Out'),
  };
  products.push(newProduct);
  await saveProducts(products);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  if (supabaseAdmin) {
    const dbUpdates: any = { ...updates };
    // Map camelCase to snake_case
    if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
    if (updates.isNew !== undefined) dbUpdates.is_new = updates.isNew;
    if (updates.isBestseller !== undefined) dbUpdates.is_bestseller = updates.isBestseller;
    if (updates.isSignatureMasterpiece !== undefined) dbUpdates.is_signature_masterpiece = updates.isSignatureMasterpiece;

    // Delete camelCase versions
    delete dbUpdates.originalPrice;
    delete dbUpdates.isNew;
    delete dbUpdates.isBestseller;
    delete dbUpdates.isSignatureMasterpiece;
    delete dbUpdates.createdAt;
    delete dbUpdates.id;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      return {
        id: data.id,
        name: data.name,
        category: data.category,
        price: Number(data.price),
        originalPrice: data.original_price ? Number(data.original_price) : undefined,
        description: data.description,
        image: data.image,
        images: data.images || [data.image],
        stock: data.stock,
        isNew: data.is_new,
        isBestseller: data.is_bestseller,
        isSignatureMasterpiece: data.is_signature_masterpiece,
        createdAt: data.created_at,
        material: data.material,
        color: data.color,
        size: data.size,
        availability: data.availability,
      };
    }
  }

  // Fallback to JSON
  const products = await getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  products[index] = { ...products[index], ...updates };
  await saveProducts(products);
  return products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Fallback to JSON
  const products = await getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  
  await saveProducts(filtered);
  return true;
}

// Categories
export async function getCategories(): Promise<Category[]> {
  try {
    let categories: Category[] = [];

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        categories = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          image: c.image,
          description: c.description || '',
          count: 0 // Will be calculated below
        }));
      }
    }

    if (categories.length === 0) {
      // Fallback to JSON
      if (!fs.existsSync(CATEGORIES_PATH)) return [];
      const data = fs.readFileSync(CATEGORIES_PATH, 'utf8');
      categories = JSON.parse(data);
    }
    
    // Dynamically calculate counts independently of where we got categories from
    const products = await getProducts();
    return categories.map(cat => ({
      ...cat,
      count: products.filter(p => p.category === cat.name).length
    }));
  } catch (error) {
    console.error('Error reading categories:', error);
    return [];
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  // Kept for JSON fallback
  try {
    fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(categories, null, 2));
  } catch (error) {
    console.error('Error saving categories:', error);
  }
}

export async function addCategory(category: Omit<Category, 'id' | 'count'>): Promise<Category> {
  if (supabaseAdmin) {
    const id = category.name.toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        id,
        name: category.name,
        image: category.image,
        description: category.description,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase addCategory error:', error);
      if ((error as any).code === 'PGRST205') {
        throw new Error('Supabase "categories" table not found. Please run the SQL migration in db_schema_update.sql.');
      }
      throw error;
    }
    if (data) {
      return {
        id: data.id,
        name: data.name,
        image: data.image,
        description: data.description || '',
        count: 0
      };
    }
  }

  // Fallback to JSON
  const categories = await getCategories();
  const newCategory = {
    ...category,
    id: category.name.toLowerCase().replace(/\s+/g, '-'),
    count: 0
  };
  categories.push(newCategory);
  await saveCategories(categories);
  return newCategory;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      return {
        id: data.id,
        name: data.name,
        image: data.image,
        description: data.description || '',
        count: 0 // Count will be filled by getCategories if needed
      };
    }
  }

  // Fallback to JSON
  const categories = await getCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  categories[index] = { ...categories[index], ...updates };
  await saveCategories(categories);
  return categories[index];
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Fallback to JSON
  const categories = await getCategories();
  const filtered = categories.filter(c => c.id !== id);
  if (filtered.length === categories.length) return false;
  
  await saveCategories(filtered);
  return true;
}

// Settings
export async function getSettings(): Promise<SiteSettings> {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) {
      const defaultSettings: SiteSettings = {
        siteName: 'Livo Homes',
        tagline: 'Architecture for Living Well',
        contactEmail: 'contact@livohomes.com',
        contactPhone: '+91 98765 43210',
        whatsappNumber: '+919876543210',
        address: '123 Architectural Way, Design District, Kerala',
        socials: {
          instagram: 'https://instagram.com/livohomes',
          facebook: 'https://facebook.com/livohomes',
        },
        officeHours: 'Mon-Sat, 9AM-8PM'
      };
      await saveSettings(defaultSettings);
      return defaultSettings;
    }
    const data = fs.readFileSync(SETTINGS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading settings:', error);
    return {
      siteName: 'Livo Homes',
      tagline: 'Architecture for Living Well',
      contactEmail: '',
      contactPhone: '',
      whatsappNumber: '',
      address: '',
      socials: {},
      officeHours: ''
    };
  }
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

import { supabaseAdmin } from './supabase-admin';

// Banners
export async function getBanners(): Promise<Banner[]> {
  try {
    if (!supabaseAdmin) throw new Error('Supabase admin not configured');
    
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      if ((error as any).code === 'PGRST205') {
        console.warn('Supabase banners table not found. Falling back to local JSON data.');
      } else {
        throw error;
      }
    } else if (data && data.length > 0) {
      return data.map((b: any) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        image: b.image_url,
        link: b.link_url,
        isActive: b.is_active,
        order: b.display_order
      }));
    }

    // Fallback to JSON if DB is empty
    if (!fs.existsSync(BANNERS_PATH)) {
      return [{
        id: '1',
        title: 'Architecture for Living Well.',
        subtitle: 'Elevate your sensory experience with our curated masterworks of bathroom and kitchen architecture.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD62zB6vNPTVfbLVwBgC4ZNYu0gqYB0YUD9AN8u3uea-BdjePglRy0I7NbeKTYQ_8bn_Z0o7xHN-OtsGI-TzYDJHcgvUhfTmKYYBZH0JlxxJlOa6ggeOmhEw7Ta5OXYyXiz1Zeopz0vXLLiuaqVUcl9nyvNIEFd34pPp6Seb80DBeSg1qfs3r_CYhP0x2hOkPSuAgnkjzFWx9br4VL5xmvAtVOXLlw-0UARgTFq-bPSBZEV2psO-oJRWwSJFP8OCcDXCe9bgAeeEW4',
        link: '/products',
        isActive: true,
        order: 0
      }];
    }
    const dataJson = fs.readFileSync(BANNERS_PATH, 'utf8');
    return JSON.parse(dataJson);
  } catch (error) {
    console.error('Error reading banners:', error);
    return [];
  }
}

export async function saveBanners(banners: Banner[]): Promise<void> {
  try {
    fs.writeFileSync(BANNERS_PATH, JSON.stringify(banners, null, 2));
  } catch (error) {
    console.error('Error saving banners:', error);
  }
}
