'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createOrder } from '@/lib/orders';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, subtotal, clearCart, totalItems } = useCart();
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Shipping Info
  const [shippingInfo, setShippingInfo] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    city: '',
    pincode: '',
    payment_method: 'cod'
  });

  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      router.push('/products');
    }
  }, [items, router, isProcessing]);

  useEffect(() => {
    if (user && profile) {
      setShippingInfo(prev => ({
        ...prev,
        customer_name: profile.full_name || '',
        customer_email: profile.email || '',
        customer_phone: profile.phone || ''
      }));
    }
  }, [user, profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      const orderData = {
        user_id: user?.id,
        ...shippingInfo,
        total_amount: subtotal,
        items: items
      };

      const order = await createOrder(orderData);
      
      if (order) {
        clearCart();
        setStep(3); // Success step
        setTimeout(() => {
          router.push('/profile');
        }, 5000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please check your registry details.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">Securing Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-40 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Checkout Flow */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-8 mb-12">
            <div className={`h-1 flex-1 transition-all duration-700 ${step >= 1 ? 'bg-brand-accent' : 'bg-outline/5'}`}></div>
            <div className={`h-1 flex-1 transition-all duration-700 ${step >= 2 ? 'bg-brand-accent' : 'bg-outline/5'}`}></div>
            <div className={`h-1 flex-1 transition-all duration-700 ${step >= 3 ? 'bg-brand-accent' : 'bg-outline/5'}`}></div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div>
                   <span className="text-brand-accent font-black text-[9px] uppercase tracking-[0.4em] block mb-2">Registry Step 01</span>
                   <h2 className="font-headline text-3xl font-black text-primary tracking-tighter">Shipping Logistics</h2>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 space-y-4">
                    <label className="text-[8px] font-black text-secondary/40 uppercase tracking-[0.4em]">Full Identity</label>
                    <input 
                      name="customer_name"
                      value={shippingInfo.customer_name}
                      onChange={handleInputChange}
                      placeholder="Name recorded in manifest"
                      className="w-full bg-white border border-outline/10 p-5 text-sm font-bold focus:border-brand-accent outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[8px] font-black text-secondary/40 uppercase tracking-[0.4em]">Communications Channel</label>
                    <input 
                      name="customer_phone"
                      value={shippingInfo.customer_phone}
                      onChange={handleInputChange}
                      placeholder="+91 00000 00000"
                      className="w-full bg-white border border-outline/10 p-5 text-sm font-bold focus:border-brand-accent outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[8px] font-black text-secondary/40 uppercase tracking-[0.4em]">Email Portal</label>
                    <input 
                      name="customer_email"
                      value={shippingInfo.customer_email}
                      onChange={handleInputChange}
                      placeholder="alexander@architect.livo"
                      className="w-full bg-white border border-outline/10 p-5 text-sm font-bold focus:border-brand-accent outline-none"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <label className="text-[8px] font-black text-secondary/40 uppercase tracking-[0.4em]">Architectural Site Address</label>
                    <textarea 
                      name="shipping_address"
                      value={shippingInfo.shipping_address}
                      onChange={handleInputChange}
                      placeholder="Street, Building, Floor"
                      className="w-full bg-white border border-outline/10 p-5 text-sm font-bold focus:border-brand-accent outline-none min-h-[120px]"
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[8px] font-black text-secondary/40 uppercase tracking-[0.4em]">City / District</label>
                    <input 
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      placeholder="Urban Sector"
                      className="w-full bg-white border border-outline/10 p-5 text-sm font-bold focus:border-brand-accent outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[8px] font-black text-secondary/40 uppercase tracking-[0.4em]">Pincode</label>
                    <input 
                      name="pincode"
                      value={shippingInfo.pincode}
                      onChange={handleInputChange}
                      placeholder="000 000"
                      className="w-full bg-white border border-outline/10 p-5 text-sm font-bold focus:border-brand-accent outline-none"
                      required
                    />
                  </div>
                </form>

                <button 
                  onClick={() => setStep(2)}
                  disabled={!shippingInfo.customer_name || !shippingInfo.shipping_address || !shippingInfo.customer_phone}
                  className="bg-primary text-white text-[10px] font-black uppercase tracking-[0.4em] px-12 py-6 hover:bg-brand-accent transition-all duration-700 disabled:opacity-30 disabled:translate-y-0 shadow-xl active:scale-95"
                >
                  Confirm Shipment Plan
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div>
                   <span className="text-brand-accent font-black text-[9px] uppercase tracking-[0.4em] block mb-2">Registry Step 02</span>
                   <h2 className="font-headline text-3xl font-black text-primary tracking-tighter">Settlement Protocol</h2>
                </div>

                <div className="space-y-6">
                   <div 
                    onClick={() => setShippingInfo(prev => ({ ...prev, payment_method: 'cod' }))}
                    className={`p-8 border cursor-pointer transition-all duration-500 flex items-center justify-between ${shippingInfo.payment_method === 'cod' ? 'border-brand-accent bg-brand-accent/5' : 'border-outline/5 hover:border-outline/20 bg-white'}`}
                   >
                      <div className="space-y-1">
                        <p className="font-headline font-black text-primary text-lg uppercase tracking-tight">Settlement on Entry (COD)</p>
                        <p className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.1em]">Finalise transaction upon receipt of architectural masterworks.</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 transition-all ${shippingInfo.payment_method === 'cod' ? 'border-brand-accent bg-brand-accent' : 'border-outline/20'}`}></div>
                   </div>

                   <div 
                    onClick={() => setShippingInfo(prev => ({ ...prev, payment_method: 'online' }))}
                    className={`p-8 border cursor-pointer transition-all duration-500 opacity-50 pointer-events-none flex items-center justify-between border-dashed ${shippingInfo.payment_method === 'online' ? 'border-brand-accent bg-brand-accent/5' : 'border-outline/5 bg-white'}`}
                   >
                      <div className="space-y-1">
                        <p className="font-headline font-black text-primary text-lg uppercase tracking-tight">Secured Digital Manifest (Online)</p>
                        <p className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.1em]">Coming Soon: Encrypted architectural payment portal.</p>
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-outline/10"></div>
                   </div>
                </div>

                {error && (
                  <div className="p-4 bg-error/5 text-error text-[10px] font-black uppercase tracking-widest rounded-sm border-l-2 border-error">
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-6">
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-1 bg-primary text-white text-[10px] font-black uppercase tracking-[0.4em] py-6 hover:bg-brand-accent transition-all duration-700 shadow-2xl active:scale-95 disabled:opacity-50"
                  >
                    {isProcessing ? 'Synchronising Manifest...' : 'Formalise Procurement'}
                  </button>
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 border border-outline/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] py-6 hover:bg-surface-container-low transition-all duration-500"
                  >
                    Return to Logistics
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 space-y-12"
              >
                <div className="w-32 h-32 bg-brand-accent text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-brand-accent/20">
                   <span className="material-symbols-outlined text-5xl">task_alt</span>
                </div>
                <div className="space-y-4">
                  <h2 className="font-headline text-4xl font-black text-primary tracking-tighter">Manifest Secured</h2>
                  <p className="text-sm font-medium text-secondary/50 max-w-sm mx-auto leading-relaxed">Your procurement request has been recorded in the architectural archives. We will formalise the logistics shortly.</p>
                </div>
                <div className="pt-8 flex flex-col items-center gap-4">
                   <Link href="/profile" className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent hover:underline">View Procurement Status</Link>
                   <p className="text-[8px] text-secondary/30 uppercase tracking-[0.4em]">Redirecting to private manifest in 5 seconds...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Procurement Summary Summary */}
        <div className="lg:col-span-5">
           <div className="sticky top-40 bg-white border border-outline/10 p-10 space-y-10 shadow-2xl shadow-primary/5">
              <div>
                 <h3 className="font-headline text-2xl font-black text-primary tracking-tighter mb-8">Selected Masterpieces</h3>
                 <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-6 group">
                        <div className="w-16 h-16 bg-surface-container-low flex-shrink-0 border border-outline/5 overflow-hidden">
                           <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black text-primary uppercase tracking-tight">{item.name}</p>
                          <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-black text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-6 border-t border-outline/5 pt-8">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="text-secondary/50">Total Pieces</span>
                  <span className="text-primary">{totalItems} Items</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="text-secondary/50">Shipping Logistics</span>
                  <span className="text-success">Complimentary</span>
                </div>
                <div className="flex justify-between items-center text-xl font-black pt-6 border-t border-dashed border-outline/10">
                  <span className="font-headline text-primary tracking-tighter">TOTAL VALUATION</span>
                  <span className="text-brand-accent">₹{subtotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-surface-container-low p-6 flex items-start gap-4 border-l-2 border-brand-accent">
                 <span className="material-symbols-outlined text-secondary/40 text-sm mt-1">info</span>
                 <p className="text-[9px] font-bold text-secondary/50 leading-relaxed uppercase tracking-wider">Estimated completion within 12-14 architectural days. Authenticity documentation included.</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
