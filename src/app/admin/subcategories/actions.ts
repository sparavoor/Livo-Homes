'use server';

import { revalidatePath } from 'next/cache';
import { getSubcategories, addSubcategory, deleteSubcategory, updateSubcategory } from '@/lib/db';
import { handleFileUploads } from '@/lib/uploads';

export async function createSubcategoryAction(formData: FormData) {
  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const description = formData.get('description') as string;
  
  // Handling file upload
  const imageFiles = formData.getAll('images') as File[];
  const uploadedImages = await handleFileUploads(imageFiles);
  
  // Also handle single URL
  const imageUrl = formData.get('image') as string;
  const finalImage = uploadedImages.length > 0 ? uploadedImages[0] : (imageUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000');

  await addSubcategory({
    name,
    categoryId,
    description,
    image: finalImage,
  });

  revalidatePath('/admin/subcategories');
  revalidatePath('/admin/products');
  revalidatePath('/products');
  revalidatePath(`/category/${categoryId}`);
  revalidatePath('/category/[id]', 'page');
}

export async function updateSubcategoryAction(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const description = formData.get('description') as string;
  
  // Handling file upload
  const imageFiles = formData.getAll('images') as File[];
  const uploadedImages = await handleFileUploads(imageFiles);
  
  const existingImage = formData.get('existingImage') as string;
  const imageUrl = formData.get('image') as string;
  
  let finalImage = uploadedImages.length > 0 ? uploadedImages[0] : (imageUrl || existingImage);

  await updateSubcategory(id, {
    name,
    categoryId,
    description,
    image: finalImage,
  });

  revalidatePath('/admin/subcategories');
  revalidatePath('/admin/products');
  revalidatePath('/products');
  revalidatePath(`/category/${categoryId}`);
  revalidatePath('/category/[id]', 'page');
}

export async function deleteSubcategoryAction(id: string) {
  await deleteSubcategory(id);
  revalidatePath('/admin/subcategories');
  revalidatePath('/admin/products');
  revalidatePath('/products');
  revalidatePath('/category/[id]', 'page');
}

export async function fetchSubcategoriesAction() {
  return await getSubcategories();
}
