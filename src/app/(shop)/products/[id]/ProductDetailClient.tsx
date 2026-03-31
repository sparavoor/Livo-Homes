'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/db';
import { getWhatsAppLink, getProductInquiryMessage } from '@/lib/whatsapp';
import MotionSection from '@/components/MotionSection';
import MotionItem from '@/components/MotionItem';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description
    });
  };

  const images = product.images?.length ? product.images : [product.image];

  return (
    <div className="font-body selection:bg-brand-accent/20">
      {/* Breadcrumbs */}
      <MotionSection>
        <nav className="flex items-center space-x-3 text-sm text-secondary mb-10 md:mb-16 tracking-wide">
          <Link className="hover:text-primary transition-colors" href="/">Home</Link>
          <span className="text-outline-variant">/</span>
          <Link className="hover:text-primary transition-colors" href="/products">Collections</Link>
          <span className="text-outline-variant">/</span>
          <span className="text-primary truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>
      </MotionSection>

      {/* Main Product Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        
        {/* Left Column: Image Stack */}
        <div className="lg:col-span-7 flex flex-col gap-4 md:gap-8">
          {images.map((img, i) => (
            <MotionItem key={i} delay={0.1 + (i * 0.1)}>
              <div className="bg-surface-container-low rounded-xl overflow-hidden aspect-[4/5] sm:aspect-square flex items-center justify-center relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  alt={`${product.name} - view ${i + 1}`} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 mix-blend-multiply" 
                  src={img}
                />
              </div>
            </MotionItem>
          ))}
        </div>

        {/* Right Column: Sticky Product Info */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 flex flex-col pt-4 lg:pt-0">
          <MotionSection delay={0.2} className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {product.isNew && (
                <span className="px-3 py-1 border border-primary/20 text-primary text-xs tracking-widest uppercase rounded-sm">
                  New Arrival
                </span>
              )}
              {product.isSignatureMasterpiece && (
                <span className="px-3 py-1 bg-brand-accent text-white text-xs tracking-widest uppercase rounded-sm">
                  Signature
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-headline font-light text-primary leading-tight tracking-tight">
              {product.name}
            </h1>
            
            <div className="flex items-baseline space-x-4">
              <span className="text-2xl font-body font-light text-primary">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-secondary line-through font-light">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-secondary leading-relaxed font-light text-lg">
              {product.description}
            </p>
          </MotionSection>

          <MotionSection delay={0.3} className="mt-12 space-y-6">
            <div className="border-y border-outline divide-y divide-outline">
              <div className="py-4 flex justify-between items-center group">
                <span className="text-sm text-secondary uppercase tracking-widest group-hover:text-primary transition-colors">Material</span>
                <span className="text-base text-primary font-medium">{product.material || 'Architectural Alloy'}</span>
              </div>
              <div className="py-4 flex justify-between items-center group">
                <span className="text-sm text-secondary uppercase tracking-widest group-hover:text-primary transition-colors">Finish</span>
                <span className="text-base text-primary font-medium">{product.color || 'Signature Palette'}</span>
              </div>
              <div className="py-4 flex justify-between items-center group">
                <span className="text-sm text-secondary uppercase tracking-widest group-hover:text-primary transition-colors">Dimensions</span>
                <span className="text-base text-primary font-medium">{product.size || 'Bespoke Fit'}</span>
              </div>
              <div className="py-4 flex justify-between items-center group">
                <span className="text-sm text-secondary uppercase tracking-widest group-hover:text-primary transition-colors">Availability</span>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${product.availability === 'In Stock' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-base text-primary font-medium">
                    {product.availability === 'In Stock' ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          </MotionSection>

          <MotionSection delay={0.4} className="mt-12 space-y-4">
            <button 
              onClick={handleAddToCart}
              disabled={product.availability !== 'In Stock'}
              className="w-full bg-primary text-white py-5 rounded-sm lg:rounded-md font-body text-sm uppercase tracking-[0.2em] hover:bg-primary/90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              Add to Cart
            </button>
            
            <Link 
              href={getWhatsAppLink(getProductInquiryMessage(product.name, product.price, product.id))}
              target="_blank"
              className="w-full flex items-center justify-center gap-3 border border-outline text-primary py-5 rounded-sm lg:rounded-md font-body text-sm uppercase tracking-[0.2em] hover:bg-surface-container-low transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"/><path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"/><path d="M9 15a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-1 0v1Z"/><path d="M14 15a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-1 0v1Z"/></svg>
              Enquire
            </Link>
          </MotionSection>

          <MotionSection delay={0.5} className="mt-12">
            <div className="bg-surface-container-low p-6 sm:p-8 rounded-xl font-light text-sm text-secondary leading-relaxed">
              <h3 className="text-primary font-medium mb-2">Complimentary Concierge</h3>
              <p>Experience tailored assistance from our design experts. Contact us regarding custom finishes or bulk architectural specifications.</p>
            </div>
          </MotionSection>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-32 md:mt-48 pt-16 border-t border-outline">
          <MotionSection className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-secondary text-sm tracking-[0.3em] uppercase mb-3 block">Curated Selection</span>
              <h2 className="text-3xl md:text-4xl font-headline font-light text-primary tracking-tight">You May Also Like</h2>
            </div>
            <Link className="group flex items-center gap-3 text-primary text-sm uppercase tracking-[0.2em] hover:text-brand-accent transition-colors" href="/products">
              Explore Collection
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </MotionSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {relatedProducts.map((rel, index) => (
              <MotionItem key={rel.id} delay={index * 0.1}>
                <ProductCard {...rel} />
              </MotionItem>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

