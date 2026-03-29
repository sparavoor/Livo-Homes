'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import MotionSection from '@/components/MotionSection';
import MotionItem from '@/components/MotionItem';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();

  const shipping = items.length > 0 ? 25 : 0;
  const tax = Math.round(subtotal * 0.08); // 8% tax as in example
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <main className="pt-48 pb-24 px-8 max-w-screen-2xl mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center">
        <MotionSection className="flex flex-col items-center">
          <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-10 luxury-card">
            <span className="material-symbols-outlined text-6xl text-slate-200">shopping_bag</span>
          </div>
          <h1 className="font-headline text-5xl font-black text-primary mb-6 tracking-tighter">Your Collection is Empty</h1>
          <p className="text-slate-400 max-w-md mb-12 text-lg font-light leading-relaxed">
            Begin curating your architectural vision by exploring our signature collections.
          </p>
          <Link href="/products" className="px-12 py-5 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-[0_25px_50px_-12px_rgba(26,50,86,0.3)] hover:scale-[1.03] hover:-translate-y-1 active:scale-95 transition-all">
            Explore Masterpieces
          </Link>
        </MotionSection>
      </main>
    );
  }

  return (
    <main className="pt-48 pb-24 px-8 max-w-screen-2xl mx-auto min-h-screen">
      <MotionSection className="mb-20">
        <span className="font-label text-brand-accent text-xs tracking-[0.4em] font-black uppercase mb-4 block">Project Selection</span>
        <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter text-primary mb-4">Your Cart</h1>
        <p className="text-slate-400 font-light text-xl max-w-2xl leading-relaxed">
          Review your curated selection of <span className="text-primary font-bold">{totalItems} architectural {totalItems === 1 ? 'element' : 'elements'}</span> before finalizing your order.
        </p>
      </MotionSection>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
        {/* Product List Section */}
        <section className="lg:col-span-7 space-y-16">
          {items.map((item, index) => (
            <MotionItem key={item.id} delay={index * 0.1}>
              <div className="group flex flex-col md:flex-row gap-10 items-start pb-16 border-b border-slate-100 transition-all">
                <div className="w-full md:w-56 aspect-square bg-slate-50 rounded-[2rem] overflow-hidden luxury-card flex items-center justify-center p-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    alt={item.name} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-1000 ease-[0.19,1,0.22,1]" 
                    src={item.image}
                  />
                </div>
                <div className="flex-1 flex flex-col h-full justify-between py-2 w-full">
                  <div className="flex justify-between items-start gap-8">
                    <div className="space-y-3">
                      <h3 className="font-headline text-3xl font-black text-primary tracking-tight leading-none group-hover:text-brand-accent transition-colors">{item.name}</h3>
                      <p className="text-slate-400 text-base font-light leading-relaxed max-w-sm line-clamp-2">{item.description}</p>
                    </div>
                    <p className="font-headline text-2xl font-black text-primary tracking-tighter">₹{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between mt-12">
                    <div className="flex items-center bg-slate-50 rounded-2xl px-6 py-3 space-x-10 border border-slate-100 luxury-card-sm overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-slate-300 hover:text-primary transition-colors active:scale-75"
                        disabled={item.quantity <= 1}
                      >
                        <span className="material-symbols-outlined text-lg font-black">remove</span>
                      </button>
                      <span className="font-black text-primary min-w-[1.5rem] text-center text-lg">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-slate-300 hover:text-primary transition-colors active:scale-75"
                      >
                        <span className="material-symbols-outlined text-lg font-black">add</span>
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-2 text-slate-300 hover:text-error transition-all font-black text-[10px] uppercase tracking-[0.2em] group/del"
                    >
                      <span className="material-symbols-outlined text-xl group-hover/del:rotate-12 transition-transform">delete</span>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </MotionItem>
          ))}

          <MotionItem delay={0.3}>
            <Link className="inline-flex items-center gap-4 text-primary font-black text-[10px] uppercase tracking-[0.3em] group pb-2 border-b-2 border-slate-100 hover:border-primary transition-all" href="/products">
              <span className="material-symbols-outlined group-hover:-translate-x-2 transition-transform">west</span>
              Continue Curating
            </Link>
          </MotionItem>
        </section>

        {/* Order Summary Sidebar */}
        <aside className="lg:col-span-5">
          <MotionSection delay={0.2} className="bg-slate-50 p-12 rounded-[2.5rem] border border-slate-100 sticky top-40 luxury-card">
            <h2 className="font-headline text-3xl font-black text-primary tracking-tight mb-10">Order Summary</h2>
            <div className="space-y-6 mb-12">
              <div className="flex justify-between text-slate-400 text-base font-light">
                <span>Items Subtotal</span>
                <span className="font-bold text-primary">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-base font-light">
                <span>White Glove Delivery</span>
                <span className="font-bold text-primary">₹{shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-base font-light">
                <span>Architectural Service Tax</span>
                <span className="font-bold text-primary">₹{tax.toLocaleString()}</span>
              </div>
              <div className="pt-8 mt-8 border-t border-slate-100 flex justify-between items-baseline">
                <span className="font-headline text-xl font-black text-primary tracking-tight">Total Investment</span>
                <span className="font-headline text-5xl font-black text-brand-accent tracking-tighter">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mb-12">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4" htmlFor="promo">Privilege Code</label>
              <div className="flex gap-4">
                <input 
                  className="flex-1 bg-white border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all outline-none placeholder:text-slate-200" 
                  id="promo" 
                  placeholder="ARCHITECT20" 
                  type="text"
                />
                <button className="px-8 py-4 bg-white text-primary border border-slate-100 font-black text-[10px] rounded-2xl hover:bg-primary hover:text-white transition-all uppercase tracking-[0.2em] luxury-card-sm">Apply</button>
              </div>
            </div>

            {/* Checkout Button */}
            <Link href="/checkout" className="w-full py-6 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-[0_30px_60px_-15px_rgba(26,50,86,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
              Finalize Order
              <span className="material-symbols-outlined text-xl">east</span>
            </Link>

            <div className="mt-12 flex items-center justify-center gap-8 opacity-20 grayscale hover:opacity-40 transition-all cursor-default">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
              <span className="material-symbols-outlined text-3xl">shield</span>
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
          </MotionSection>
        </aside>
      </div>
    </main>
  );
}
