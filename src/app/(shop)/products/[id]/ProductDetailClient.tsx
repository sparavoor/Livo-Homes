'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { getWhatsAppLink, getProductInquiryMessage } from '@/lib/whatsapp';
import MotionSection from '@/components/MotionSection';
import MotionItem from '@/components/MotionItem';
import ProductCard from '@/components/ProductCard';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState<string>(product.images?.[0] || product.image);
  const [showToast, setShowToast] = useState(false);

  const addToCart = () => {
    addItem(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const buyNow = () => {
    addItem(product);
    router.push('/cart');
  };

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-primary text-white px-10 py-5 rounded-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex items-center gap-4 animate-in fade-in slide-in-from-top-10 duration-500 backdrop-blur-xl border border-white/10">
          <div className="bg-green-500/20 p-1.5 rounded-full">
            <span className="material-symbols-outlined text-green-400 text-sm">check</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Curated Item Added to Collection</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <MotionSection>
        <nav className="flex items-center space-x-2 text-[0.65rem] font-bold tracking-[0.2em] text-slate-400 mb-12 uppercase">
          <Link className="hover:text-primary transition-colors" href="/">Home</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <Link className="hover:text-primary transition-colors" href="/products">Collections</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="hover:text-primary transition-colors">{product.category}</span>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-primary">{product.name}</span>
        </nav>
      </MotionSection>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* Image Gallery */}
        <div className="lg:col-span-7 space-y-8">
          <MotionItem delay={0.1}>
            <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden aspect-square flex items-center justify-center p-16 transition-all group cursor-zoom-in border border-slate-100 luxury-card shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={product.name} className="w-full h-full object-contain transition-transform duration-1000 ease-[0.19,1,0.22,1] group-hover:scale-105" src={activeImage}/>
            </div>
          </MotionItem>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-6">
            {(product.images || [product.image]).map((img, i) => (
              <MotionItem key={i} delay={0.2 + (i * 0.05)}>
                <div 
                  onClick={() => setActiveImage(img)}
                  className={`bg-white rounded-2xl p-4 border-2 transition-all cursor-pointer luxury-card group ${activeImage === img ? 'border-primary shadow-2xl shadow-primary/10' : 'border-transparent opacity-40 hover:opacity-100'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt={`Thumbnail ${i + 1}`} src={img}/>
                </div>
              </MotionItem>
            ))}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="lg:col-span-5 flex flex-col justify-start space-y-12">
          <MotionSection delay={0.2}>
            <div className="flex flex-wrap gap-4 mb-8">
              {product.isNew && <span className="inline-block px-5 py-2 bg-brand-accent text-white text-[9px] font-black rounded-full uppercase tracking-[0.3em] shadow-xl shadow-brand-accent/20">New Arrival</span>}
              {product.isSignatureMasterpiece && <span className="inline-block px-5 py-2 bg-primary text-tertiary-fixed-dim text-[9px] font-black rounded-full uppercase tracking-[0.3em] border border-tertiary-fixed-dim/20 shadow-xl shadow-primary/20">Signature Masterpiece</span>}
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-black text-primary leading-[0.9] tracking-tighter text-balance">{product.name}</h1>
            <p className="mt-10 text-slate-500 leading-relaxed text-xl font-light">
              {product.description}
            </p>
          </MotionSection>
          
          <MotionSection delay={0.3} className="flex items-baseline space-x-8">
            <span className="text-5xl font-headline font-black text-primary tracking-tighter">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && <span className="text-2xl text-slate-300 line-through font-medium">₹{product.originalPrice.toLocaleString()}</span>}
          </MotionSection>

          <MotionSection delay={0.4} className="bg-slate-50 rounded-[2rem] p-10 space-y-8 border border-slate-100">
            <div className="grid grid-cols-2 gap-y-8 gap-x-12">
              <div className="space-y-2">
                <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Material Composition</span>
                <p className="text-primary font-bold text-base">{product.material || 'Architectural Alloy'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Surface Finish</span>
                <p className="text-primary font-bold text-base">{product.color || 'Signature Palette'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Precision Size</span>
                <p className="text-primary font-bold text-base">{product.size || 'Bespoke Fit'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Product Series</span>
                <p className="text-primary font-bold text-base">{product.category}</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-8">
              <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Availability Status</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${product.availability === 'In Stock' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className={`font-black uppercase tracking-[0.2em] text-[10px] ${product.availability === 'In Stock' ? 'text-green-600' : 'text-error'}`}>
                  {product.availability === 'In Stock' ? `${product.stock} Units Available` : 'Sold Out'}
                </span>
              </div>
            </div>
          </MotionSection>

          {/* Call to Action */}
          <MotionSection delay={0.5} className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={addToCart}
                disabled={product.availability === 'Sold Out'}
                className={`w-full py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 ${product.availability === 'Sold Out' ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-white text-primary border-2 border-slate-100 shadow-2xl shadow-slate-200/50 hover:bg-primary hover:text-white hover:border-primary active:scale-95'}`}
              >
                <span className="material-symbols-outlined text-xl">shopping_bag</span>
                Add to Cart
              </button>
              <button 
                onClick={buyNow}
                disabled={product.availability === 'Sold Out'}
                className={`w-full py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 ${product.availability === 'Sold Out' ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-primary text-white shadow-[0_25px_50px_-12px_rgba(26,50,86,0.3)] hover:scale-[1.03] hover:-translate-y-1 active:scale-95'}`}
              >
                <span className="material-symbols-outlined text-xl">bolt</span>
                Buy Now
              </button>
            </div>
            <Link 
              href={getWhatsAppLink(getProductInquiryMessage(product.name, product.price, product.id))}
              target="_blank"
              className="w-full flex items-center justify-center space-x-4 border-2 border-primary/20 text-primary py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary/5 hover:border-primary transition-all group"
            >
              <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">chat_bubble</span>
              <span>Enquire Architectural Pricing</span>
            </Link>
          </MotionSection>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-48">
          <MotionSection className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div>
              <span className="font-label text-brand-accent text-xs tracking-[0.4em] font-black uppercase mb-4 block">Complete the Vision</span>
              <h2 className="text-5xl font-headline font-black text-primary tracking-tighter">Architectural Pairings</h2>
            </div>
            <Link className="group flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.3em] pb-2 border-b-2 border-slate-100 hover:border-primary transition-all" href="/products">
              View All Masterpieces
              <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">east</span>
            </Link>
          </MotionSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {relatedProducts.map((rel, index) => (
              <MotionItem key={rel.id} delay={index * 0.1}>
                <ProductCard {...rel} />
              </MotionItem>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
