'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/db';
import { CATEGORY_DETAILS, MATERIALS, CategoryDetail } from '@/data/products';
import { useCart } from '@/context/CartContext';

interface CategoryClientProps {
  initialProducts: Product[];
  categoryDetail: CategoryDetail;
}

export default function CategoryClient({ initialProducts, categoryDetail }: CategoryClientProps) {
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("Newest Arrivals");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { addItem } = useCart();

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Price Filter
    result = result.filter(p => p.price <= maxPrice);

    // Material Filter (Case-insensitive check since materials in db might vary)
    if (selectedMaterial) {
      result = result.filter(p => 
        p.description?.toLowerCase().includes(selectedMaterial.toLowerCase()) ||
        // Assuming we might have a material field in the future in DB
        (p as any).material?.toLowerCase() === selectedMaterial.toLowerCase()
      );
    }

    // Sorting
    switch (sortBy) {
      case "Price: Low to High":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Popularity":
        result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
        break;
      default:
        // By ID or Newest
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
    }

    return result;
  }, [initialProducts, maxPrice, selectedMaterial, sortBy]);

  const handleAddToCart = (product: Product) => {
    setAddingToCart(product.id);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description || '',
    });
    setTimeout(() => setAddingToCart(null), 2000);
  };

  return (
    <div className="pt-32 pb-24 px-8 max-w-[1440px] mx-auto min-h-screen">
      {/* Header */}
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-[0.7rem] text-secondary mb-4 uppercase tracking-widest font-medium">
          <Link className="hover:text-brand-accent transition-colors" href="/">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link className="hover:text-brand-accent transition-colors" href="/products">Collections</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-semibold">{categoryDetail.name}</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-primary mb-2">{categoryDetail.name}</h1>
            <p className="font-body text-secondary text-lg max-w-xl">{categoryDetail.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-label-md text-secondary font-medium uppercase tracking-widest text-[0.7rem]">Sort By</span>
            <div className="relative inline-block text-left">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-surface-container-lowest border border-outline-variant/30 px-6 py-3 pr-10 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all cursor-pointer"
              >
                <option>Newest Arrivals</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Popularity</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">expand_more</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="sticky top-32 space-y-10">
            {/* Price Filter */}
            <section>
              <h3 className="font-headline text-lg text-primary font-bold mb-6">Price Range</h3>
              <div className="px-2">
                <input 
                  type="range"
                  min="0"
                  max="500000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-brand-accent" 
                />
                <div className="flex justify-between mt-4">
                  <div className="bg-surface-container-low px-4 py-2 rounded-md text-xs font-mono font-medium text-secondary">₹0</div>
                  <div className="bg-surface-container-low px-4 py-2 rounded-md text-xs font-mono font-medium text-secondary">₹{maxPrice.toLocaleString()}{maxPrice >= 500000 ? '+' : ''}</div>
                </div>
              </div>
            </section>

            {/* Material Filter */}
            <section>
              <h3 className="font-headline text-lg text-primary font-bold mb-6">Material</h3>
              <div className="flex flex-wrap gap-2">
                {MATERIALS.map(mat => (
                  <button 
                    key={mat}
                    onClick={() => setSelectedMaterial(selectedMaterial === mat ? null : mat)}
                    className={`px-4 py-2 rounded-full border transition-all text-xs font-medium ${
                      selectedMaterial === mat 
                        ? 'border-brand-accent bg-brand-accent/5 text-brand-accent' 
                        : 'border-outline-variant/30 text-secondary hover:border-brand-accent hover:text-brand-accent'
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </section>

            {/* Sidebar Banners */}
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
              <h4 className="font-headline font-bold text-primary mb-2">Need Expert Help?</h4>
              <p className="text-xs text-secondary mb-4">Our design consultants are available for personalized advice on architectural selections.</p>
              <Link href="/contact" className="text-xs font-bold text-brand-accent uppercase tracking-widest hover:underline">Contact Consultant</Link>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <article key={product.id} className="group relative bg-surface-container-lowest rounded-xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_-20px_rgba(30,188,190,0.15)]">
                  <div className="aspect-[4/5] bg-surface-container-low overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} src={product.image}/>
                    {product.isNew && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-brand-accent text-white px-3 py-1 text-[0.65rem] font-bold tracking-widest uppercase rounded">New</span>
                      </div>
                    )}
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-primary opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <span className="material-symbols-outlined text-lg">favorite</span>
                    </button>
                  </div>
                  <div className="p-6 text-white">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-headline text-lg font-bold text-primary group-hover:text-brand-accent transition-colors">
                        <Link href={`/products/${product.id}`}>{product.name}</Link>
                      </h3>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</div>
                      </div>
                    </div>
                    <p className="text-sm text-secondary mb-6 line-clamp-2">{product.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Link 
                        href={`/products/${product.id}`}
                        className="flex items-center justify-center gap-2 py-3 border border-outline-variant/30 rounded-lg text-xs font-bold uppercase tracking-wider text-primary hover:bg-surface-container transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Details
                      </Link>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        disabled={addingToCart === product.id}
                        className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                          addingToCart === product.id 
                            ? 'bg-green-600 text-white' 
                            : 'bg-primary text-white hover:bg-brand-accent'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {addingToCart === product.id ? "check" : "add_shopping_cart"}
                        </span>
                        {addingToCart === product.id ? "Added" : "Add"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/50">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">inventory_2</span>
              <h3 className="text-xl font-headline font-bold text-primary">No products found</h3>
              <p className="text-secondary mt-2">No items match your filters in this collection.</p>
              <button 
                onClick={() => {
                  setMaxPrice(500000);
                  setSelectedMaterial(null);
                }}
                className="mt-6 text-brand-accent font-bold hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
