import { getProducts, getCategories, getSubcategoryById } from '@/lib/db';
import { notFound } from 'next/navigation';
import SubcategoryClient from './SubcategoryClient';

export default async function SubcategoryPage({ params }: { params: Promise<{ id: string; subId: string }> }) {
  const { id, subId } = await params;
  
  const categories = await getCategories();
  const categoryDetail = categories.find(cat => cat.id === id);
  const subcategoryDetail = await getSubcategoryById(subId);

  if (!categoryDetail || !subcategoryDetail) {
    notFound();
  }

  const allProducts = await getProducts();
  // Filter by category and subcategory name
  const subcategoryProducts = allProducts.filter(p => 
    p.category === categoryDetail.name && 
    p.subcategory === subcategoryDetail.name
  );

  return (
    <SubcategoryClient 
      initialProducts={subcategoryProducts} 
      categoryDetail={categoryDetail} 
      subcategoryDetail={subcategoryDetail} 
    />
  );
}
