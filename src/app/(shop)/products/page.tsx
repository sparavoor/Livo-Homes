import Link from 'next/link';
import { getProducts, getCategories, Category, Product } from '@/lib/db';
import MotionSection from '@/components/MotionSection';
import MotionItem from '@/components/MotionItem';
import ProductCard from '@/components/ProductCard';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: searchQuery } = await searchParams;
  const isSearching = !!searchQuery;

  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ]);
  
  const filteredProducts = isSearching 
    ? allProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery!.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery!.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery!.toLowerCase())
      )
    : [];

  return (
    <div className="font-body selection:bg-brand-accent/20 pt-28 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen">
      
      {/* Header */}
      <MotionSection className="mb-16 md:mb-24">
        <nav className="flex items-center space-x-3 text-sm text-secondary mb-10 md:mb-16 tracking-wide">
          <Link className="hover:text-primary transition-colors" href="/">Home</Link>
          <span className="text-outline-variant">/</span>
          <span className="text-primary truncate max-w-[200px] sm:max-w-none">
            {isSearching ? 'Search Results' : 'Collections'}
          </span>
        </nav>
        
        <div className="max-w-4xl">
          <h1 className="font-headline text-4xl md:text-6xl font-light tracking-tight text-primary mb-6 leading-tight">
            {isSearching ? `Search results for "${searchQuery}"` : "Architectural Collections"}
          </h1>
          <p className="text-secondary text-lg leading-relaxed font-light max-w-2xl">
            {isSearching 
              ? `Found ${filteredProducts.length} items matching your curated search.` 
              : "Explore our curated selection of premium architectural fittings, engineered for those who appreciate the intersection of form and definitive function."}
          </p>
        </div>
      </MotionSection>

      {isSearching ? (
        /* Search Results Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {filteredProducts.map((product: Product, index: number) => (
            <MotionItem key={product.id} delay={index * 0.1}>
              <ProductCard {...product} />
            </MotionItem>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center text-center bg-surface-container-low rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-secondary mb-6"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <h3 className="text-2xl font-headline font-light text-primary tracking-tight mb-3">No Masterpieces Found</h3>
              <p className="text-secondary font-light max-w-md">Try a different search term or explore our core categories to discover our curated selections.</p>
              <Link href="/products" className="inline-block mt-8 border border-outline text-primary px-8 py-4 rounded-sm font-body text-sm uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all">
                Reset Search
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Category Grid (Modern Editorial Flow) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-16">
          {categories.map((category: Category, index: number) => (
            <MotionItem key={category.id} delay={index * 0.1}>
              <Link 
                href={`/category/${category.id}`}
                className="group flex flex-col h-full"
              >
                <div className="overflow-hidden aspect-[4/5] bg-surface-container-low mb-6 rounded-sm lg:rounded-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 mix-blend-multiply"
                  />
                </div>
                <div className="flex flex-col flex-grow justify-between items-start gap-4">
                  <div className="w-full">
                    <h2 className="text-xl md:text-2xl font-headline font-light text-primary mb-2 group-hover:text-brand-accent transition-colors">
                      {category.name}
                    </h2>
                    <p className="text-secondary text-sm leading-relaxed font-light line-clamp-2 max-w-sm">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex w-full justify-between items-center mt-auto">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-secondary font-medium border border-outline px-2 py-1 rounded-sm">
                      {category.count} Items
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-primary flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      Explore
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </span>
                  </div>
                </div>
              </Link>
            </MotionItem>
          ))}
        </div>
      )}
    </div>
  );
}
