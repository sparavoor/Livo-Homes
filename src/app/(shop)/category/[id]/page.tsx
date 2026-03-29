import { getProducts, getCategories } from '@/lib/db';
import { notFound } from 'next/navigation';
import CategoryClient from './CategoryClient';

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categories = await getCategories();
  const categoryDetail = categories.find(cat => cat.id === id);

  if (!categoryDetail) {
    notFound();
  }

  const allProducts = await getProducts();
  const categoryProducts = allProducts.filter(p => p.category === categoryDetail.name);

  return <CategoryClient initialProducts={categoryProducts} categoryDetail={categoryDetail} />;
}
