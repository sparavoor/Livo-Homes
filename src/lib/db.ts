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
  category?: string | null;
  subcategory?: string | null;
  price: number;
  originalPrice?: number;
  description: string;
  image: string; // Featured image
  images: string[]; // Gallery images
  stock: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isSignatureMasterpiece: boolean;
  isSpecial?: boolean;
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

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  image: string;
  description: string;
  count: number;
}

function mapDbProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    description: p.description,
    image: p.image,
    images: p.images || [p.image],
    stock: p.stock,
    isNew: p.is_new,
    isBestseller: p.is_bestseller,
    isSignatureMasterpiece: p.is_signature_masterpiece,
    isSpecial: !!p.is_special,
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
      isSpecial: !!p.isSpecial,
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
      .neq('is_special', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(mapDbProduct);
  }
  const products = await getProducts();
  return products.filter(p => p.isSignatureMasterpiece && !p.isSpecial).slice(0, limit);
}

export async function getRecentProducts(limit: number = 8): Promise<Product[]> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .neq('is_special', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(mapDbProduct);
  }
  const products = await getProducts();
  return products.filter(p => !p.isSpecial).slice(0, limit);
}

export async function getSpecialProducts(limit: number = 8): Promise<Product[]> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_special', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(mapDbProduct);
  }
  const products = await getProducts();
  return products.filter(p => p.isSpecial).slice(0, limit);
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
          category: product.category || null,
          price: product.price,
          original_price: product.originalPrice,
          description: product.description,
          image: product.image,
          images: product.images,
          stock: product.stock,
          is_new: product.isNew ?? true,
          is_bestseller: product.isBestseller ?? false,
          is_signature_masterpiece: product.isSignatureMasterpiece ?? false,
          is_special: product.isSpecial ?? false,
          material: product.material,
          color: product.color,
          size: product.size,
          subcategory: product.subcategory || null,
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
    id: Math.random().toString(36).substring(2, 11),
    createdAt: new Date().toISOString(),
    isSignatureMasterpiece: product.isSignatureMasterpiece ?? false,
    isSpecial: product.isSpecial ?? false,
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
    if (updates.isSpecial !== undefined) dbUpdates.is_special = updates.isSpecial;
    if (updates.category !== undefined) dbUpdates.category = updates.category || null;
    if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory || null;

    delete dbUpdates.originalPrice;
    delete dbUpdates.isNew;
    delete dbUpdates.isBestseller;
    delete dbUpdates.isSignatureMasterpiece;
    delete dbUpdates.isSpecial;
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
    const slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const id = `${slug}-${timestamp}`;
    
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
  const slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const newCategory = {
    ...category,
    id: slug + '-' + Math.random().toString(36).substr(2, 5),
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

// Subcategories
const SUBCATEGORIES_PATH = path.join(process.cwd(), 'src/data/subcategories.json');

export async function getSubcategories(): Promise<Subcategory[]> {
  try {
    let subcategories: Subcategory[] = [];

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('subcategories')
        .select(`
          *,
          products (count)
        `)
        .order('name', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        subcategories = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          categoryId: s.category_id,
          image: s.image,
          description: s.description || '',
          count: s.products?.[0]?.count || 0
        }));
      }
    }

    if (subcategories.length === 0) {
      if (!fs.existsSync(SUBCATEGORIES_PATH)) return [];
      const data = fs.readFileSync(SUBCATEGORIES_PATH, 'utf8');
      subcategories = JSON.parse(data);
    }
    
    return subcategories;
  } catch (error) {
    console.error('Error reading subcategories:', error);
    return [];
  }
}

export async function getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('subcategories')
      .select(`
        *,
        products (count)
      `)
      .eq('category_id', categoryId)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      categoryId: s.category_id,
      image: s.image,
      description: s.description || '',
      count: s.products?.[0]?.count || 0
    }));
  }
  const subcategories = await getSubcategories();
  return subcategories.filter(s => s.categoryId === categoryId);
}

export async function saveSubcategories(subcategories: Subcategory[]): Promise<void> {
  try {
    fs.writeFileSync(SUBCATEGORIES_PATH, JSON.stringify(subcategories, null, 2));
  } catch (error) {
    console.error('Error saving subcategories:', error);
  }
}

export async function addSubcategory(subcategory: Omit<Subcategory, 'id' | 'count'>): Promise<Subcategory> {
  if (supabaseAdmin) {
    const timestamp = Date.now().toString(36).substr(-4);
    const slug = subcategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const id = `${slug}-${timestamp}`;
    
    try {
      const { data, error } = await supabaseAdmin
        .from('subcategories')
        .insert({
          id,
          name: subcategory.name,
          category_id: subcategory.categoryId,
          image: subcategory.image,
          description: subcategory.description,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        return {
          id: data.id,
          name: data.name,
          categoryId: data.category_id,
          image: data.image,
          description: data.description || '',
          count: 0
        };
      }
    } catch (dbError) {
      console.error('Database insertion failed:', dbError);
    }
  }

  const subcategories = await getSubcategories();
  const slug = subcategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const newSubcategory = {
    ...subcategory,
    id: slug + '-' + Math.random().toString(36).substr(2, 5),
    count: 0
  };
  subcategories.push(newSubcategory);
  await saveSubcategories(subcategories);
  return newSubcategory;
}

export async function updateSubcategory(id: string, updates: Partial<Subcategory>): Promise<Subcategory | null> {
  if (supabaseAdmin) {
    const dbUpdates: any = { ...updates };
    if (updates.categoryId) {
      dbUpdates.category_id = updates.categoryId;
      delete dbUpdates.categoryId;
    }

    const { data, error } = await supabaseAdmin
      .from('subcategories')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      return {
        id: data.id,
        name: data.name,
        categoryId: data.category_id,
        image: data.image,
        description: data.description || '',
        count: 0
      };
    }
  }

  const subcategories = await getSubcategories();
  const index = subcategories.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  subcategories[index] = { ...subcategories[index], ...updates };
  await saveSubcategories(subcategories);
  return subcategories[index];
}

export async function deleteSubcategory(id: string): Promise<boolean> {
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('subcategories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  const subcategories = await getSubcategories();
  const filtered = subcategories.filter(s => s.id !== id);
  if (filtered.length === subcategories.length) return false;
  
  await saveSubcategories(filtered);
  return true;
}

export async function getSubcategoryById(id: string): Promise<Subcategory | null> {
  const subcategories = await getSubcategories();
  return subcategories.find(s => s.id === id) || null;
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
export async function getBanners(includeInactive: boolean = false): Promise<Banner[]> {
  try {
    if (supabaseAdmin) {
      let query = supabaseAdmin
        .from('banners')
        .select('*');
        
      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query
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
      const defaultBanners = [{
        id: '1',
        title: 'Architecture for Living Well.',
        subtitle: 'Elevate your sensory experience with our curated masterworks of bathroom and kitchen architecture.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD62zB6vNPTVfbLVwBgC4ZNYu0gqYB0YUD9AN8u3uea-BdjePglRy0I7NbeKTYQ_8bn_Z0o7xHN-OtsGI-TzYDJHcgvUhfTmKYYBZH0JlxxJlOa6ggeOmhEw7Ta5OXYyXiz1Zeopz0vXLLiuaqVUcl9nyvNIEFd34pPp6Seb80DBeSg1qfs3r_CYhP0x2hOkPSuAgnkjzFWx9br4VL5xmvAtVOXLlw-0UARgTFq-bPSBZEV2psO-oJRWwSJFP8OCcDXCe9bgAeeEW4',
        link: '/products',
        isActive: true,
        order: 0
      }];
      if (includeInactive) return defaultBanners;
      return defaultBanners.filter(b => b.isActive);
    }
    const dataJson = fs.readFileSync(BANNERS_PATH, 'utf8');
    const banners: Banner[] = JSON.parse(dataJson);
    if (includeInactive) return banners;
    return banners.filter(b => b.isActive);
  } catch (error) {
    console.error('Error reading banners:', error);
    return [];
  }
}

export async function saveBanners(banners: Banner[]): Promise<void> {
  const path = BANNERS_PATH;
  console.log(`db: [SAVE] Attempting to save ${banners.length} banners to: ${path}`);
  try {
    const data = JSON.stringify(banners, null, 2);
    console.log(`db: [SAVE] Data string length: ${data.length} characters`);
    fs.writeFileSync(path, data);
    console.log('db: [SAVE] File write successful');
    
    // Verify by reading back
    const verify = fs.readFileSync(path, 'utf8');
    console.log(`db: [SAVE] Verification read back length: ${verify.length}`);
  } catch (error) {
    console.error('db: [SAVE] CRITICAL ERROR:', error);
    throw error; // Rethrow to let the action know it failed
  }
}

export async function addBanner(banner: Omit<Banner, 'id'>): Promise<Banner> {
  console.log('db: [ADD] Received banner data:', { ...banner, image: banner.image?.substring(0, 50) + '...' });
  
  if (supabaseAdmin) {
    console.log('db: [ADD] Trying Supabase...');
    try {
      const { data, error } = await supabaseAdmin
        .from('banners')
        .insert({
          title: banner.title,
          subtitle: banner.subtitle,
          image_url: banner.image,
          link_url: banner.link,
          is_active: banner.isActive,
          display_order: banner.order
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        console.log('db: [ADD] Supabase success, ID:', data.id);
        return {
          id: data.id,
          title: data.title,
          subtitle: data.subtitle,
          image: data.image_url,
          link: data.link_url,
          isActive: data.is_active,
          order: data.display_order
        };
      }
    } catch (error) {
      console.error('db: [ADD] Supabase failed, falling back to JSON:', error);
    }
  }

  console.log('db: [ADD] Proceeding with JSON storage');
  const banners = await getBanners(true);
  console.log('db: [ADD] Current banner count:', banners.length);
  
  const newBanner: Banner = {
    ...banner,
    id: Math.random().toString(36).substr(2, 9),
  };
  console.log('db: [ADD] Generated new ID:', newBanner.id);
  
  banners.push(newBanner);
  await saveBanners(banners);
  
  console.log('db: [ADD] Success');
  return newBanner;
}


export async function updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
  console.log(`db: [UPDATE] Attempting to update banner ID: ${id}`);
  if (supabaseAdmin) {
    console.log('db: [UPDATE] Trying Supabase...');
    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
      if (updates.image !== undefined) dbUpdates.image_url = updates.image;
      if (updates.link !== undefined) dbUpdates.link_url = updates.link;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.order !== undefined) dbUpdates.display_order = updates.order;

      const { data, error } = await supabaseAdmin
        .from('banners')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        console.log('db: [UPDATE] Supabase success');
        return {
          id: data.id,
          title: data.title,
          subtitle: data.subtitle,
          image: data.image_url,
          link: data.link_url,
          isActive: data.is_active,
          order: data.display_order
        };
      }
    } catch (error) {
      console.error('db: [UPDATE] Supabase failed, falling back to JSON:', error);
    }
  }

  console.log('db: [UPDATE] Proceeding with JSON storage');
  const banners = await getBanners(true);
  const index = banners.findIndex(b => String(b.id) === String(id));
  if (index === -1) {
    console.warn(`db: [UPDATE] Banner ID ${id} not found`);
    return null;
  }
  
  banners[index] = { ...banners[index], ...updates };
  console.log(`db: [UPDATE] Applying updates to index ${index}`);
  await saveBanners(banners);
  
  console.log('db: [UPDATE] Success');
  return banners[index];
}


export async function deleteBanner(id: string): Promise<boolean> {
  console.log('db: [DELETE] Attempting to delete banner with ID:', id);
  if (supabaseAdmin) {
    console.log('db: [DELETE] Using Supabase Admin');
    try {
      const { error } = await supabaseAdmin
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('db: [DELETE] Supabase error:', error.message);
        throw error;
      }
      console.log('db: [DELETE] Supabase success');
      return true;
    } catch (error) {
      console.error('db: [DELETE] Supabase catch block:', error);
    }
  }


  const banners = await getBanners(true);
  console.log('db: Current banners in JSON:', banners.map(b => b.id));
  const filtered = banners.filter(b => String(b.id) !== String(id));
  
  if (filtered.length === banners.length) {
    console.warn('db: Banner ID not found in JSON collection');
    return false;
  }
  
  await saveBanners(filtered);
  console.log('db: Banner deleted from JSON successfully');
  return true;
}


