'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/auth-context';
import { createOrder } from '@/lib/orders';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { INDIA_STATES, STATE_DISTRICTS } from '@/data/india-locations';
import { applyPromoCodeAction } from '@/app/admin/promo/actions';

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal: cartSubtotal, totalItems, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount_type: 'percentage' | 'fixed'; discount_value: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    if (appliedPromo.discount_type === 'percentage') {
      return (cartSubtotal * appliedPromo.discount_value) / 100;
    }
    return appliedPromo.discount_value;
  };

  const discountAmount = calculateDiscount();
  const shipping = items.length > 0 ? 25 : 0;
  const tax = Math.round((cartSubtotal - discountAmount) * 0.08);
  const total = cartSubtotal - discountAmount + shipping + tax;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    state: 'Kerala',
    pincode: '',
    paymentMethod: 'cod'
  });

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [isEnteringNewAddress, setIsEnteringNewAddress] = useState(true);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Pre-fill form if profile is available
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || profile.full_name || '',
        email: prev.email || profile.email || '',
        phone: prev.phone || profile.phone || ''
      }));
    }
  }, [profile]);

  // Fetch addresses
  useEffect(() => {
    if (user) {
      const fetchAddresses = async () => {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('profile_id', user.id)
          .order('is_default', { ascending: false });
        
        if (data && data.length > 0) {
          setAddresses(data);
          setIsEnteringNewAddress(false);
          const defaultAddr = data[0];
          setSelectedAddressId(defaultAddr.id);
          setFormData(prev => ({
            ...prev,
            address: defaultAddr.street,
            city: defaultAddr.city,
            district: defaultAddr.district || '',
            state: defaultAddr.state || 'Kerala',
            pincode: defaultAddr.zip
          }));
        }
      };
      fetchAddresses();
    }
  }, [user]);

  if (items.length === 0) {
    if (typeof window !== 'undefined') {
       router.push('/cart');
    }
    return null;
  }

  const saveAddressIfNeeded = async () => {
    if (user && isEnteringNewAddress && saveNewAddress) {
      try {
        await supabase.from('addresses').insert([{
          profile_id: user.id,
          label: 'Default',
          street: formData.address,
          city: formData.city,
          state: formData.state || formData.city,
          zip: formData.pincode,
          country: 'India'
        }]);
      } catch (e) {
        console.error('Failed to save address', e);
      }
    }
  };

  const handleApplyPromo = async () => {
    setPromoError('');
    if (!promoCode) return;
    try {
      const promo = await applyPromoCodeAction(promoCode, profile?.privilege_tier || 'standard');
      setAppliedPromo(promo as any);
      setPromoCode('');
    } catch (error: any) {
      setPromoError(error.message);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      // 1. Create Razorpay order on server
      const response = await fetch('/api/checkout/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          receipt: `rcpt_${Math.random().toString(36).substring(7)}`
        })
      });

      const orderData = await response.json();
      if (orderData.error) throw new Error(orderData.error);

      // 2. Open Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // Needs to be public for client
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Livo Homes',
        description: 'Architectural Excellence Procurement',
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. On success, create order in Supabase
          try {
            await saveAddressIfNeeded();
            
            await createOrder({
              user_id: user?.id,
              customer_name: formData.name,
              customer_email: formData.email,
              customer_phone: formData.phone,
              shipping_address: `${formData.address}${formData.state ? ', ' + formData.state : ''}`,
              city: formData.city,
              pincode: formData.pincode,
              total_amount: total,
              promo_code: appliedPromo?.code,
              discount_amount: discountAmount,
              payment_method: 'online',
              items: items
            });
            clearCart();
            router.push('/checkout/success');
          } catch (err: any) {
             setError('Payment successful, but failed to save order details. Please contact support.');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#1a1a1a' // Match premium brand color
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description || 'Payment failed. Please try again.');
        setIsSubmitting(false);
      });

    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment.');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // If Online Payment
    if (formData.paymentMethod === 'online') {
      await handleRazorpayPayment();
      return;
    }
    
    // If Cash on Delivery
    try {
      await saveAddressIfNeeded();
      
      await createOrder({
        user_id: user?.id,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: `${formData.address}${formData.district ? ', ' + formData.district : ''}${formData.state ? ', ' + formData.state : ''}`,
        city: formData.city,
        district: formData.district,
        pincode: formData.pincode,
        total_amount: total,
        promo_code: appliedPromo?.code,
        discount_amount: discountAmount,
        payment_method: formData.paymentMethod,
        items: items
      });

      clearCart();
      router.push('/checkout/success');
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className="pt-32 pb-24 px-8 max-w-screen-2xl mx-auto min-h-screen font-body">
      <header className="mb-12 border-b border-surface-container-high pb-8">
        <h1 className="font-headline text-5xl font-bold tracking-tight text-primary mb-2">Checkout</h1>
        <p className="text-secondary font-body tracking-wide">Complete your architectural procurement.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Form Section */}
        <div className="lg:col-span-7">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-12">
            {/* Contact Information */}
            <section>
              <h2 className="font-headline text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-accent text-white text-sm flex items-center justify-center">1</span>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="name">Full Name</label>
                  <input 
                    required
                    className="w-full bg-surface-container-low border-transparent rounded-xl px-4 py-4 focus:ring-1 focus:ring-brand-accent transition-all outline-none" 
                    id="name" name="name" placeholder="John Doe" type="text"
                    value={formData.name} onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="email">Email Address</label>
                  <input 
                    required
                    className="w-full bg-surface-container-low border-transparent rounded-xl px-4 py-4 focus:ring-1 focus:ring-brand-accent transition-all outline-none" 
                    id="email" name="email" placeholder="john@example.com" type="email"
                    value={formData.email} onChange={handleChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="phone">Phone Number</label>
                  <input 
                    required
                    className="w-full bg-surface-container-low border-transparent rounded-xl px-4 py-4 focus:ring-1 focus:ring-brand-accent transition-all outline-none" 
                    id="phone" name="phone" placeholder="+91 90000 00000" type="tel"
                    value={formData.phone} onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="font-headline text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-accent text-white text-sm flex items-center justify-center">2</span>
                Shipping Address
              </h2>
              
              {user && addresses.length > 0 && (
                <div className="mb-8 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">Saved Addresses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div 
                        key={addr.id} 
                        onClick={() => {
                          setIsEnteringNewAddress(false);
                          setSelectedAddressId(addr.id);
                          setFormData(prev => ({
                            ...prev,
                            address: addr.street,
                            city: addr.city,
                            state: addr.state || '',
                            pincode: addr.zip
                          }));
                        }}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${!isEnteringNewAddress && selectedAddressId === addr.id ? 'border-brand-accent bg-brand-accent/5' : 'border-surface-container-high hover:border-outline-variant bg-surface-container-low'}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded">{addr.label || 'Saved'}</span>
                          {!isEnteringNewAddress && selectedAddressId === addr.id && (
                            <span className="material-symbols-outlined text-brand-accent text-xl">check_circle</span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-on-surface mb-1">{addr.street}</p>
                        <p className="text-xs text-secondary">{addr.city}, {addr.district}, {addr.state} {addr.zip}</p>
                      </div>
                    ))}
                    
                    <div 
                      onClick={() => {
                        setIsEnteringNewAddress(true);
                        setSelectedAddressId(null);
                        setFormData(prev => ({
                          ...prev,
                          address: '',
                          city: '',
                          state: '',
                          pincode: ''
                        }));
                      }}
                      className={`p-5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${isEnteringNewAddress ? 'border-brand-accent bg-brand-accent/5 text-brand-accent' : 'border-surface-container-high text-secondary hover:border-outline-variant hover:text-primary'}`}
                    >
                      <span className="material-symbols-outlined mb-2 text-2xl">add_location</span>
                      <p className="text-sm font-bold">Add New Address</p>
                    </div>
                  </div>
                </div>
              )}

              {(!user || addresses.length === 0 || isEnteringNewAddress) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="address">Address</label>
                    <textarea 
                      required
                      rows={3}
                      className="w-full bg-surface-container-low border-transparent rounded-xl px-4 py-4 focus:ring-1 focus:ring-brand-accent transition-all outline-none resize-none" 
                      id="address" name="address" placeholder="123 Luxury Villa, Marble Street"
                      value={formData.address} onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="state">State</label>
                    <select 
                      required
                      className="w-full bg-surface-container-low border-transparent rounded-xl px-4 py-4 focus:ring-1 focus:ring-brand-accent transition-all outline-none" 
                      id="state" name="state"
                      value={formData.state} onChange={e => setFormData({...formData, state: e.target.value, district: ''})}
                    >
                      <option value="">Select State</option>
                      {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="district">District</label>
                    <select 
                      required
                      className="w-full bg-surface-container-low border-transparent rounded-xl px-4 py-4 focus:ring-1 focus:ring-brand-accent transition-all outline-none" 
                      id="district" name="district"
                      value={formData.district} onChange={handleChange}
                      disabled={!formData.state}
                    >
                      <option value="">Select District</option>
                      {formData.state && STATE_DISTRICTS[formData.state]?.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="city">City / Town</label>
                    <input 
                      required
                      className="w-full bg-surface-container-low border-transparent rounded-xl px-4 py-4 focus:ring-1 focus:ring-brand-accent transition-all outline-none" 
                      id="city" name="city" placeholder="Kochi" type="text"
                      value={formData.city} onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="pincode">Pin Code</label>
                    <input 
                      required
                      className="w-full bg-surface-container-low border-transparent rounded-xl px-4 py-4 focus:ring-1 focus:ring-brand-accent transition-all outline-none" 
                      id="pincode" name="pincode" placeholder="682001" type="text"
                      value={formData.pincode} onChange={handleChange}
                    />
                  </div>
                  {user && (
                    <div className="md:col-span-2 flex items-center gap-3 mt-2 pl-1">
                      <input 
                        type="checkbox" 
                        id="saveNewAddress" 
                        checked={saveNewAddress} 
                        onChange={(e) => setSaveNewAddress(e.target.checked)}
                        className="w-5 h-5 accent-brand-accent cursor-pointer rounded"
                      />
                      <label htmlFor="saveNewAddress" className="text-sm font-bold text-secondary cursor-pointer hover:text-primary transition-colors">
                        Save this address to my profile
                      </label>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="font-headline text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-accent text-white text-sm flex items-center justify-center">3</span>
                Payment Method
              </h2>
              <div className="space-y-4">
                <label className={`flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-brand-accent bg-brand-accent/5' : 'border-surface-container-high hover:border-outline-variant'}`}>
                  <input 
                    type="radio" name="paymentMethod" value="cod" 
                    checked={formData.paymentMethod === 'cod'} 
                    onChange={handleChange}
                    className="w-5 h-5 accent-brand-accent"
                  />
                  <div>
                    <span className="block font-headline font-bold text-primary">Cash on Delivery (COD)</span>
                    <span className="text-secondary text-sm">Pay when your architectural pieces arrive.</span>
                  </div>
                </label>
              </div>
            </section>

            {error && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-bold mb-6">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Summary Sidebar */}
        <aside className="lg:col-span-5">
          <div className="bg-white p-10 rounded-3xl shadow-[0_32px_128px_rgba(0,0,0,0.08)] border border-outline-variant/10 sticky top-32">
            <h2 className="font-headline text-2xl font-black text-primary mb-10 tracking-tighter uppercase">Order <span className="font-serif italic text-primary/40 font-light">Inventory.</span></h2>
            
            <div className="max-h-[360px] overflow-y-auto pr-4 space-y-6 mb-10 custom-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6 items-center group">
                  <div className="w-24 h-24 bg-surface-container-low rounded-xl flex-shrink-0 p-3 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-primary truncate text-sm uppercase tracking-tight">{item.name}</h3>
                    <p className="text-secondary text-[10px] uppercase font-black tracking-widest opacity-40 mt-1">Quantity: {item.quantity}</p>
                    <p className="font-headline font-black text-brand-accent mt-2 text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6 border-t border-outline-variant/10 pt-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-light">
                  <span className="text-secondary uppercase tracking-[0.2em] text-[10px] font-black">Architecture Subtotal</span>
                  <span className="font-headline font-bold text-on-surface">₹{cartSubtotal.toLocaleString()}</span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-green-500/10 text-green-600 rounded text-[9px] font-black uppercase tracking-widest border border-green-500/20">{appliedPromo.code}</span>
                      <span className="text-green-600 uppercase tracking-[0.2em] text-[10px] font-black">Privilege Applied</span>
                    </div>
                    <span className="font-headline font-bold text-green-600">- ₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-light">
                  <span className="text-secondary uppercase tracking-[0.2em] text-[10px] font-black">Shipping / Logistics</span>
                  <span className="font-headline font-bold text-on-surface">₹{shipping.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-sm font-light">
                  <span className="text-secondary uppercase tracking-[0.2em] text-[10px] font-black">Estimated Tax (8%)</span>
                  <span className="font-headline font-bold text-on-surface">₹{tax.toLocaleString()}</span>
                </div>

                <div className="pt-6 border-t border-outline-variant/10 flex justify-between items-baseline">
                  <span className="font-headline text-[12px] font-black text-primary uppercase tracking-[0.4em]">Total Procurement</span>
                  <span className="font-headline text-4xl font-black text-brand-accent tracking-tighter">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="pt-8 border-t border-outline-variant/10">
                <label className="block text-[9px] font-black text-secondary tracking-[0.5em] uppercase mb-4 px-1">Promo Manifest</label>
                {!appliedPromo ? (
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="flex-1 bg-background/50 border border-outline-variant/10 rounded-lg px-5 py-4 text-[11px] font-black tracking-[0.2em] focus:ring-1 focus:ring-brand-accent outline-none uppercase transition-all"
                    />
                    <button 
                      onClick={handleApplyPromo}
                      type="button"
                      className="bg-primary text-white px-8 py-4 rounded-sm font-headline font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all duration-700 shadow-xl"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5 flex justify-between items-center group">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-green-600 font-black uppercase tracking-widest">{appliedPromo.code}</span>
                      <span className="text-[10px] text-green-600/60 font-medium">Manifest privilege recognized</span>
                    </div>
                    <button 
                      onClick={() => setAppliedPromo(null)}
                      type="button"
                      className="text-secondary hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">cancel</span>
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-4 px-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    {promoError}
                  </p>
                )}
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full py-6 rounded-sm font-headline font-black text-[11px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-[0_24px_48px_rgba(0,0,0,0.15)] group ${isSubmitting ? 'bg-secondary/20 text-secondary cursor-not-allowed' : 'bg-primary text-white hover:bg-brand-accent hover:scale-[1.02] active:scale-95'}`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Confirm Procurement
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-3 transition-transform duration-700">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-secondary/40 text-[9px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                By confirming, you agree to our <span className="text-primary hover:text-brand-accent cursor-pointer transition-colors">Architectural License Agreement</span>.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
