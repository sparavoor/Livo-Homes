import { getProducts, getCategories, getSubcategories } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [products, categories, subcategories] = await Promise.all([
    getProducts(),
    getCategories(),
    getSubcategories()
  ]);
  
  const product = products.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  // Related products
  const relatedProducts = product.isSpecial
    ? products.filter(p => p.isSpecial && p.id !== product.id).slice(0, 4)
    : products.filter(p => !p.isSpecial && p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="pt-28 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen">
      <ProductDetailClient 
        product={product} 
        relatedProducts={relatedProducts} 
        categories={categories}
        subcategories={subcategories}
      />
    </div>
  );
}
