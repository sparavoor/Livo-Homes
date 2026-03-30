'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

export default function ProductCard({ 
  name, 
  price, 
  originalPrice, 
  category, 
  image, 
  description = '',
  isNew, 
  id = '1' 
}: { 
  name: string, 
  price: number, 
  originalPrice?: number, 
  category?: string, 
  image: string, 
  description?: string,
  isNew?: boolean, 
  id?: number | string 
}) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: id.toString(),
      name,
      price,
      image,
      description
    });
  };

  return (
    <div className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-outline/5 hover:border-brand-accent/20 relative">
      <Link href={`/products/${id}`} className="relative aspect-[4/5] overflow-hidden bg-surface-container-low block">
        <Image 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-1000 ease-[0.19,1,0.22,1] group-hover:scale-110" 
          src={image}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          priority={false}
        />
        
        {isNew && (
          <div className="absolute top-4 left-4 bg-primary text-white text-[8px] font-black px-2.5 py-1 uppercase tracking-[0.2em] rounded-sm shadow-xl z-10 font-headline">
            New
          </div>
        )}

        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center pointer-events-none">
           <button 
            onClick={handleAddToCart}
            className="pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 bg-white text-primary p-4 rounded-full shadow-2xl hover:bg-brand-accent hover:text-white"
            title="Add to Manifesto"
           >
             <span className="material-symbols-outlined text-2xl font-light">add_shopping_cart</span>
           </button>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <p className="text-secondary/40 text-[8px] uppercase font-black tracking-[0.4em] font-headline">{category}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-primary font-black text-base font-headline tracking-tighter">₹{price.toLocaleString()}</span>
            {originalPrice && (
              <span className="text-secondary/20 text-[9px] line-through font-bold">₹{originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>
        
        <h4 className="text-sm font-headline font-black mb-4 flex-1 leading-tight tracking-tight">
          <Link href={`/products/${id}`} className="text-primary hover:text-brand-accent transition-colors duration-300">
            {name}
          </Link>
        </h4>
        
        <button 
          onClick={handleAddToCart}
          className="w-full border border-outline/10 text-primary py-3 flex items-center justify-center font-headline font-black text-[8px] uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all duration-500 rounded-sm"
        >
          Add to Selection
        </button>
      </div>
    </div>
  );
}
