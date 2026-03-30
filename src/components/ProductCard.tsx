'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ 
  name, 
  price, 
  originalPrice, 
  category, 
  image, 
  isNew, 
  id = 1 
}: { 
  name: string, 
  price: number, 
  originalPrice?: number, 
  category?: string, 
  image: string, 
  isNew?: boolean, 
  id?: number | string 
}) {
  return (
    <div className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-outline/5 hover:border-brand-accent/20">
      <Link href={`/products/${id}`} className="relative aspect-[4/5] overflow-hidden bg-surface-container-low block">
        {/* next/image for automatic compression & lazy loading */}
        <Image 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-1000 ease-[0.19,1,0.22,1] group-hover:scale-105" 
          src={image}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          priority={false}
        />
        
        {isNew && (
          <div className="absolute top-4 left-4 bg-primary text-white text-[8px] font-black px-2.5 py-1 uppercase tracking-[0.2em] rounded-sm shadow-xl">
            New
          </div>
        )}

        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <div className="bg-white text-primary w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
             <span className="material-symbols-outlined font-light text-xl">add_shopping_cart</span>
          </div>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <p className="text-secondary text-[9px] uppercase font-bold tracking-[0.3em] font-label">{category}</p>
          <button className="text-secondary/40 hover:text-brand-accent transition-colors">
            <span className="material-symbols-outlined text-lg font-light">heart_plus</span>
          </button>
        </div>
        
        <h4 className="text-sm font-headline font-bold mb-4 flex-1 leading-tight tracking-tight">
          <Link href={`/products/${id}`} className="text-primary hover:text-brand-accent transition-colors duration-300">
            {name}
          </Link>
        </h4>
        
        <div className="flex items-baseline gap-3">
          <span className="text-primary font-black text-lg font-headline tracking-tighter">₹{price.toLocaleString()}</span>
          {originalPrice && (
            <span className="text-secondary/40 text-[10px] line-through font-bold">₹{originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
