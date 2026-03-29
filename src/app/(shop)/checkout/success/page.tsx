'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="pt-32 pb-24 px-8 max-w-screen-2xl mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
        <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
      </div>
      
      <h1 className="font-headline text-5xl font-bold text-primary mb-4">Architecture Secured</h1>
      <p className="text-secondary max-w-lg mb-12 text-lg">
        Thank you for choosing Livo Homes. Your order has been placed successfully and our architectural consultants will contact you shortly.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <Link 
          href="/profile" 
          className="px-8 py-4 bg-primary text-white font-headline font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">person</span>
          View Orders
        </Link>
        <Link 
          href="/products" 
          className="px-8 py-4 bg-surface-container-high text-primary font-headline font-bold rounded-xl hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">shopping_bag</span>
          Shop More
        </Link>
      </div>

      <p className="mt-16 text-secondary text-sm">
        A confirmation email and WhatsApp message has been sent to your registered contact.
      </p>
    </main>
  );
}
