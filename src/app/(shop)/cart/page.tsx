'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();

  return (
    <div className="bg-background min-h-screen pt-40 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-16">
        
        {/* Cart Items */}
        <div className="lg:col-span-8 flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-8 h-[1px] bg-brand-accent"></div>
            <span className="text-brand-accent font-black text-[9px] uppercase tracking-[0.4em]">Selection Manifest</span>
          </div>
          <h1 className="font-headline text-4xl font-black text-primary tracking-tighter mb-12">Your Architectural Procurement</h1>

          {items.length === 0 ? (
            <div className="bg-white p-20 border border-outline/5 text-center space-y-8">
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-secondary/30 text-3xl">shopping_bag</span>
              </div>
              <div className="space-y-4">
                <h3 className="font-headline text-xl font-black text-primary uppercase tracking-widest">Cart is Empty</h3>
                <p className="text-sm font-medium text-secondary/50 max-w-xs mx-auto leading-relaxed">No masterpieces have been selected for procurement. Explore our curate collections to begin.</p>
              </div>
              <Link href="/products" className="inline-block bg-primary text-white text-[10px] font-black uppercase tracking-[0.4em] px-10 py-5 hover:bg-brand-accent transition-all duration-700 active:scale-95">Browse Collection</Link>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="group bg-white p-6 border border-outline/5 flex flex-col sm:flex-row items-center gap-8 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700"
                  >
                    <div className="w-32 h-32 bg-surface-container-low border border-outline/5 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <h3 className="font-headline text-lg font-black text-primary tracking-tight">{item.name}</h3>
                      <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em]">{item.description.slice(0, 60)}...</p>
                      <div className="pt-4 flex items-center justify-center sm:justify-start gap-4">
                        <div className="flex items-center border border-outline/10 h-10 px-2 gap-4">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-secondary hover:text-primary transition-colors"
                          >
                             <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="text-xs font-black w-4 text-center tabular-nums">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-secondary hover:text-primary transition-colors"
                          >
                             <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-[9px] font-black uppercase tracking-[0.3em] text-error/60 hover:text-error transition-colors ml-4"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-right sm:pl-8 border-t sm:border-t-0 sm:border-l border-outline/5 pt-4 sm:pt-0">
                      <p className="text-[9px] font-black text-secondary/30 uppercase tracking-[0.4em] mb-1">Valuation</p>
                      <p className="font-headline text-xl font-black text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-secondary/30 mt-1">₹{item.price.toLocaleString()} / unit</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        {items.length > 0 && (
          <div className="lg:w-96">
            <div className="sticky top-40 bg-white border border-outline/10 p-8 space-y-8 shadow-2xl shadow-primary/5">
              <div className="space-y-4">
                <h2 className="font-headline text-2xl font-black text-primary tracking-tighter">Order Valuation</h2>
                <div className="h-[1px] w-full bg-outline/5"></div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="text-secondary/50">Total Pieces</span>
                  <span className="text-primary">{totalItems} Items</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="text-secondary/50">Shipping Logistics</span>
                  <span className="text-success">Complimentary</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] pt-4 border-t border-outline/5">
                  <span className="text-secondary/50">Subtotal</span>
                  <span className="text-primary text-base font-black">₹{subtotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Link 
                  href="/checkout"
                  className="w-full bg-primary text-white py-6 flex items-center justify-center font-headline font-black text-[10px] uppercase tracking-[0.5em] hover:bg-brand-accent transition-all duration-700 shadow-xl active:scale-95"
                >
                  Proceed to Procurement
                </Link>
                <Link 
                   href="/products"
                   className="w-full border border-outline/10 text-primary py-5 flex items-center justify-center font-headline font-black text-[9px] uppercase tracking-[0.3em] hover:bg-surface-container-low transition-all duration-500"
                >
                   Add Further Masterpieces
                </Link>
              </div>

              <div className="pt-8 border-t border-outline/5 text-center">
                <p className="text-[8px] font-black text-secondary/30 uppercase tracking-[0.4em] leading-relaxed italic">
                  Authentic LIVO design guarantee. Secure communications and encrypted transactions only.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
