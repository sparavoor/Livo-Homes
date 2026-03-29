'use server';

import { revalidatePath } from 'next/cache';
import { getCategories, addCategory, deleteCategory, updateCategory } from '@/lib/db';
import { handleFileUploads } from '@/lib/uploads';

export async function createCategoryAction(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  
  // Handling file upload
  const imageFiles = formData.getAll('images') as File[];
  const uploadedImages = await handleFileUploads(imageFiles);
  
  // Also handle single URL for backward compatibility/quick add
  const imageUrl = formData.get('image') as string;
  const finalImage = uploadedImages.length > 0 ? uploadedImages[0] : (imageUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000');

  await addCategory({
    name,
    description,
    image: finalImage,
  });

  revalidatePath('/admin/categories');
  revalidatePath('/admin/products');
  revalidatePath('/products');
}

export async function updateCategoryAction(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  
  // Handling file upload
  const imageFiles = formData.getAll('images') as File[];
  const uploadedImages = await handleFileUploads(imageFiles);
  
  const existingImage = formData.get('existingImage') as string;
  const imageUrl = formData.get('image') as string;
  
  let finalImage = uploadedImages.length > 0 ? uploadedImages[0] : (imageUrl || existingImage);

  await updateCategory(id, {
    name,
    description,
    image: finalImage,
  });

  revalidatePath('/admin/categories');
  revalidatePath('/admin/products');
  revalidatePath('/products');
}

export async function deleteCategoryAction(id: string) {
  await deleteCategory(id);
  revalidatePath('/admin/categories');
  revalidatePath('/admin/products');
  revalidatePath('/products');
}

export async function fetchCategoriesAction() {
  return await getCategories();
}
