import { getCategories, getSubcategoriesByCategory } from '@/lib/db';
import { notFound } from 'next/navigation';
import CategoryClient from './CategoryClient';

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categories = await getCategories();
  const categoryDetail = categories.find(cat => cat.id === id);

  if (!categoryDetail) {
    notFound();
  }

  const subcategories = await getSubcategoriesByCategory(id);

  return <CategoryClient categoryDetail={categoryDetail} subcategories={subcategories} />;
}
