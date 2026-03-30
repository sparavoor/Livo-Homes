'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="pt-32 pb-24 px-8 max-w-screen-2xl mx-auto min-h-[90vh] flex flex-col items-center justify-center text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "backOut" }}
        className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-10 border border-brand-accent/20 shadow-2xl"
      >
        <span className="material-symbols-outlined text-6xl text-brand-accent">verified</span>
      </motion.div>
      
      <div className="space-y-4 mb-16">
        <h1 className="font-headline text-5xl md:text-7xl font-black text-primary tracking-tighter uppercase">Procurement <span className="font-serif italic text-primary/40 font-light">Success.</span></h1>
        <div className="w-12 h-[1px] bg-brand-accent/30 mx-auto"></div>
        <p className="text-secondary/60 text-[10px] uppercase font-black tracking-[0.4em] mt-4">Order has been manifested in our archives.</p>
      </div>

      <p className="text-secondary max-w-lg mb-16 text-sm font-light leading-relaxed">
        Your architectural pieces have been successfully secured. Our logistics consultants will begin the verification process of your procurement immediately.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl px-4">
        <Link 
          href="/profile" 
          className="group px-8 py-5 border border-outline/10 bg-white text-primary font-headline font-black text-[10px] uppercase tracking-[0.3em] rounded-sm shadow-xl hover:bg-primary hover:text-white transition-all duration-700 flex flex-col items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">history</span>
          Order Manifests
        </Link>
        <Link 
          href="/shop" 
          className="group px-8 py-5 border border-outline/10 bg-white text-primary font-headline font-black text-[10px] uppercase tracking-[0.3em] rounded-sm shadow-xl hover:bg-brand-accent hover:text-white transition-all duration-700 flex flex-col items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">shopping_cart</span>
          Expand Inventory
        </Link>
        <Link 
          href="/" 
          className="group px-8 py-5 border border-outline/10 bg-white text-primary font-headline font-black text-[10px] uppercase tracking-[0.3em] rounded-sm shadow-xl hover:bg-background transition-all duration-700 flex flex-col items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">home</span>
          Return Home
        </Link>
      </div>

      <div className="mt-24 pt-12 border-t border-outline/5 w-full max-w-xs text-center opacity-40">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary">Awaiting Manifest Confirmation</p>
      </div>
    </main>
  );
}
