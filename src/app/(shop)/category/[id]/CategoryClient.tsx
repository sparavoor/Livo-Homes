'use client';

import Link from 'next/link';
import { Subcategory } from '@/lib/db';
import { CategoryDetail } from '@/data/products';

interface CategoryClientProps {
  categoryDetail: CategoryDetail;
  subcategories: Subcategory[];
}

export default function CategoryClient({ categoryDetail, subcategories }: CategoryClientProps) {
  return (
    <div className="pt-32 pb-24 px-8 max-w-[1440px] mx-auto min-h-screen">
      {/* Header */}
      <header className="mb-16">
        <nav className="flex items-center gap-2 text-[0.7rem] text-secondary mb-4 uppercase tracking-widest font-medium">
          <Link className="hover:text-brand-accent transition-colors" href="/">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link className="hover:text-brand-accent transition-colors" href="/products">Collections</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-semibold">{categoryDetail.name}</span>
        </nav>
        <div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">{categoryDetail.name}</h1>
          <p className="font-body text-secondary text-lg max-w-2xl">{categoryDetail.description}</p>
        </div>
      </header>

      {/* Subcategories Grid */}
      <section>
        <div className="flex items-center gap-4 mb-12">
          <h2 className="font-headline text-2xl font-bold text-primary uppercase tracking-wider">Sub-Collections</h2>
          <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
        </div>
        
        {subcategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {subcategories.map(sub => (
              <Link
                key={sub.id}
                href={`/category/${categoryDetail.id}/${sub.id}`}
                className="group flex flex-col gap-6 p-8 rounded-3xl border border-outline-variant/20 bg-surface-container-low hover:border-brand-accent/50 hover:shadow-2xl hover:shadow-brand-accent/10 transition-all duration-500"
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={sub.image} 
                    alt={sub.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold text-primary group-hover:text-brand-accent transition-colors mb-2">
                    {sub.name}
                  </h3>
                  <p className="text-sm text-secondary line-clamp-2 mb-6 opacity-80">
                    {sub.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-outline-variant/10">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">
                      Explore Collection
                    </span>
                    <span className="material-symbols-outlined text-brand-accent group-hover:translate-x-2 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/50">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-6">layers</span>
            <h3 className="text-2xl font-headline font-bold text-primary">No sub-collections available</h3>
            <p className="text-secondary mt-2 opacity-70">Check back soon for new architectural masterpieces.</p>
          </div>
        )}
      </section>
    </div>
  );
}
