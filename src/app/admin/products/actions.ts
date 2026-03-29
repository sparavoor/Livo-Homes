'use server';

import { revalidatePath } from 'next/cache';
import { getProducts, addProduct, deleteProduct, updateProduct, Product } from '@/lib/db';
import { handleFileUploads } from '@/lib/uploads';

export async function createProductAction(formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const price = parseFloat(formData.get('price') as string);
  const originalPrice = formData.get('originalPrice') ? parseFloat(formData.get('originalPrice') as string) : undefined;
  const description = formData.get('description') as string;
  const stock = parseInt(formData.get('stock') as string) || 0;
  const isSignatureMasterpiece = formData.get('isSignatureMasterpiece') === 'on';
  const material = formData.get('material') as string;
  const color = formData.get('color') as string;
  const size = formData.get('size') as string;
  const availability = formData.get('availability') as 'In Stock' | 'Sold Out';

  // Handling file uploads
  const imageFiles = formData.getAll('images') as File[];
  const uploadedImages = await handleFileUploads(imageFiles);
  
  // Also handle single URL for backward compatibility/quick add
  const imageUrl = formData.get('image') as string;
  const finalImages = uploadedImages.length > 0 ? uploadedImages : (imageUrl ? [imageUrl] : []);

  await addProduct({
    name,
    category,
    price,
    originalPrice,
    description,
    image: finalImages[0] || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000',
    images: finalImages,
    stock,
    isNew: true,
    isSignatureMasterpiece,
    material,
    color,
    size,
    availability,
  });

  revalidatePath('/admin/products');
  revalidatePath('/products');
  revalidatePath('/');
}

export async function updateProductAction(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const price = parseFloat(formData.get('price') as string);
  const originalPrice = formData.get('originalPrice') ? parseFloat(formData.get('originalPrice') as string) : undefined;
  const description = formData.get('description') as string;
  const stock = parseInt(formData.get('stock') as string) || 0;
  const isSignatureMasterpiece = formData.get('isSignatureMasterpiece') === 'on';
  const material = formData.get('material') as string;
  const color = formData.get('color') as string;
  const size = formData.get('size') as string;
  const availability = formData.get('availability') as 'In Stock' | 'Sold Out';

  // Handling file uploads
  const imageFiles = formData.getAll('images') as File[];
  const uploadedImages = await handleFileUploads(imageFiles);
  
  const existingImages = JSON.parse(formData.get('existingImages') as string || '[]');
  const imageUrl = formData.get('image') as string;
  
  // Combine existing images (that were not deleted in UI) with new uploads
  let finalImages = [...existingImages, ...uploadedImages];
  
  // If no images at all, use single URL or fallback
  if (finalImages.length === 0) {
    finalImages = imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000'];
  }

  await updateProduct(id, {
    name,
    category,
    price,
    originalPrice,
    description,
    image: finalImages[0],
    images: finalImages,
    stock,
    isSignatureMasterpiece,
    material,
    color,
    size,
    availability,
  });

  revalidatePath('/admin/products');
  revalidatePath('/products');
  revalidatePath('/');
}

export async function deleteProductAction(id: string) {
  await deleteProduct(id);
  revalidatePath('/admin/products');
  revalidatePath('/products');
}

export async function fetchProductsAction() {
  return await getProducts();
}
