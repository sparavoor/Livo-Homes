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
    <div className="pt-32 pb-24 px-8 max-w-[1440px] mx-auto min-h-screen">
      {/* Header */}
      <MotionSection className="mb-20">
        <nav className="flex items-center gap-2 text-[0.7rem] text-secondary mb-6 uppercase tracking-widest font-bold">
          <Link className="hover:text-primary transition-colors" href="/">Home</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-primary">Collections</span>
        </nav>
        <div className="max-w-4xl">
          <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-primary mb-8 leading-[0.9]">
            {isSearching ? `Search results for "${searchQuery}"` : "Architectural Collections"}
          </h1>
          <p className="font-body text-slate-500 text-xl leading-relaxed font-light max-w-2xl">
            {isSearching 
              ? `Found ${filteredProducts.length} items matching your curated search.` 
              : "Explore our curated selection of premium architectural fittings, engineered for those who appreciate the intersection of form and definitive function."}
          </p>
        </div>
      </MotionSection>

      {isSearching ? (
        /* Search Results Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {filteredProducts.map((product: Product, index: number) => (
            <MotionItem key={product.id} delay={index * 0.1}>
              <ProductCard {...product} />
            </MotionItem>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-32 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <span className="material-symbols-outlined text-7xl text-slate-300 mb-6 block">search_off</span>
              <h3 className="text-2xl font-headline font-black text-primary tracking-tight">No Masterpieces Found</h3>
              <p className="text-slate-500 mt-3 font-light">Try a different search term or explore our core categories.</p>
              <Link href="/products" className="inline-block mt-10 bg-primary text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform">Reset Search</Link>
            </div>
          )}
        </div>
      ) : (
        /* Category Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category: Category, index: number) => (
            <MotionItem key={category.id} delay={index * 0.1}>
              <Link 
                href={`/category/${category.id}`}
                className={`group relative overflow-hidden rounded-[2.5rem] aspect-[16/11] luxury-card border border-slate-50 ${index === 0 ? 'md:col-span-2' : ''}`}
              >
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[0.19,1,0.22,1] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent flex flex-col justify-end p-10 md:p-14">
                  <div className="translate-y-6 group-hover:translate-y-0 transition-transform duration-700 ease-[0.19,1,0.22,1]">
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-4 inline-block">Collection</span>
                    <h2 className="text-white font-headline text-4xl md:text-5xl font-black mb-6 tracking-tighter">{category.name}</h2>
                    <p className="text-slate-300 text-sm md:text-lg max-w-sm mb-8 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 font-light leading-relaxed">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-4 text-white font-bold text-xs uppercase tracking-[0.2em] transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700 delay-200">
                      <span>Explore Series</span>
                      <span className="material-symbols-outlined text-lg">east</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-10 right-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full px-6 py-2 text-white text-[10px] font-black tracking-widest uppercase">
                  {category.count} Masterpieces
                </div>
              </Link>
            </MotionItem>
          ))}
        </div>
      )}
    </div>
  );
}
