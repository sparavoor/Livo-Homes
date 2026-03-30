import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from './supabase-admin';

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

function mapDbProduct(p: any): Product {
  return {
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
  };
}

// Products
export async function getProducts(page: number = 1, limit?: number): Promise<Product[]> {
  try {
    if (supabaseAdmin) {
      let query = supabaseAdmin
        .from('products')
        .select('*');
        
      if (typeof limit === 'number') {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map(mapDbProduct);
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

// Specialized queries for performance
export async function getSignatureMasterpieces(limit: number = 4): Promise<Product[]> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_signature_masterpiece', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(mapDbProduct);
  }
  const products = await getProducts();
  return products.filter(p => p.isSignatureMasterpiece).slice(0, limit);
}

export async function getRecentProducts(limit: number = 8): Promise<Product[]> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(mapDbProduct);
  }
  const products = await getProducts();
  return products.slice(0, limit);
}

export async function saveProducts(products: Product[]): Promise<void> {
  try {
    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Error saving products:', error);
  }
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  if (supabaseAdmin) {
    try {
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
      if (data) return mapDbProduct(data);
    } catch (error) {
      console.error('Failed to add product to Supabase:', error);
    }
  }

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
    if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
    if (updates.isNew !== undefined) dbUpdates.is_new = updates.isNew;
    if (updates.isBestseller !== undefined) dbUpdates.is_bestseller = updates.isBestseller;
    if (updates.isSignatureMasterpiece !== undefined) dbUpdates.is_signature_masterpiece = updates.isSignatureMasterpiece;

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
    if (data) return mapDbProduct(data);
  }

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
        .select(`
          *,
          products (count)
        `)
        .order('name', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        categories = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          image: c.image,
          description: c.description || '',
          count: c.products?.[0]?.count || 0
        }));
      }
    }

    if (categories.length === 0) {
      if (!fs.existsSync(CATEGORIES_PATH)) return [];
      const data = fs.readFileSync(CATEGORIES_PATH, 'utf8');
      categories = JSON.parse(data);
    }
    
    return categories;
  } catch (error) {
    console.error('Error reading categories:', error);
    return [];
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  try {
    fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(categories, null, 2));
  } catch (error) {
    console.error('Error saving categories:', error);
  }
}

export async function addCategory(category: Omit<Category, 'id' | 'count'>): Promise<Category> {
  if (supabaseAdmin) {
    const timestamp = Date.now().toString(36).substr(-4);
    const id = `${category.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
    
    try {
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

      if (error) throw error;
      if (data) {
        return {
          id: data.id,
          name: data.name,
          image: data.image,
          description: data.description || '',
          count: 0
        };
      }
    } catch (dbError) {
      console.error('Database insertion failed:', dbError);
    }
  }

  const categories = await getCategories();
  const newCategory = {
    ...category,
    id: category.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substr(2, 5),
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
        count: 0
      };
    }
  }

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

// Banners
export async function getBanners(): Promise<Banner[]> {
  try {
    if (supabaseAdmin) {
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
    }

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
