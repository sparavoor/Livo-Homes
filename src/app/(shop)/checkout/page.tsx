'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createOrder } from '@/lib/orders';
import { getUserAddresses, addUserAddress, UserAddress } from '@/lib/addresses';
import Link from 'next/link';
import indianStatesData from '@/data/indian-states.json';

const STATES = indianStatesData.states.map(s => s.state);
const DISTRICTS: Record<string, string[]> = indianStatesData.states.reduce((acc, curr) => {
  acc[curr.state] = curr.districts;
  return acc;
}, {} as Record<string, string[]>);

export default function CheckoutPage() {
  const { items, subtotal, clearCart, totalItems } = useCart();
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  // Constants for Tax & Shipping
  const TAX_RATE = 0.18; // 18% GST
  const SHIPPING_CHARGE = 25;
  const ESTIMATED_TAX = subtotal * TAX_RATE;
  const GRAND_TOTAL = subtotal + ESTIMATED_TAX + SHIPPING_CHARGE;
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  // Shipping Info
  const [shippingInfo, setShippingInfo] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    state: '',
    district: '',
    pincode: '',
    payment_method: 'cod'
  });

  useEffect(() => {
    // Only redirect if cart is empty AND we ARE NOT in the middle of a successful order processing
    if (items.length === 0 && !isProcessing && !isProcessingSuccess && step < 3) {
      router.push('/products');
    }
  }, [items, router, isProcessing, isProcessingSuccess, step]);

  useEffect(() => {
    if (user && profile) {
      setShippingInfo(prev => ({
        ...prev,
        customer_name: profile.full_name || '',
        customer_email: profile.email || '',
        customer_phone: profile.phone || ''
      }));

      // Fetch user's saved addresses
      getUserAddresses(user.id).then(addresses => {
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          const primary = addresses.find(a => a.is_primary) || addresses[0];
          setSelectedAddressId(primary.id);
          setShippingInfo(prev => ({
            ...prev,
            shipping_address: primary.address_line,
            state: primary.state,
            district: primary.district,
            pincode: primary.pincode
          }));
        }
      });
    }
  }, [user, profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => {
      const updated = { ...prev, [name]: value };
      // Reset district if state changes
      if (name === 'state') {
        updated.district = '';
      }
      return updated;
    });
  };

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'new') {
      setShippingInfo(prev => ({
        ...prev,
        shipping_address: '',
        state: '',
        district: '',
        pincode: ''
      }));
    } else {
      const addr = savedAddresses.find(a => a.id === id);
      if (addr) {
        setShippingInfo(prev => ({
          ...prev,
          shipping_address: addr.address_line,
          state: addr.state,
          district: addr.district,
          pincode: addr.pincode
        }));
      }
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      // If entering a new address and the user is logged in, save it to their profile.
      if (selectedAddressId === 'new' && user) {
        await addUserAddress({
          user_id: user.id,
          title: 'Recent Address',
          state: shippingInfo.state,
          district: shippingInfo.district,
          address_line: shippingInfo.shipping_address,
          pincode: shippingInfo.pincode,
          is_primary: savedAddresses.length === 0
        });
      }

      const orderData = {
        user_id: user?.id,
        ...shippingInfo,
        city: shippingInfo.district, // Map district to city to satisfy existing backend schema
        total_amount: GRAND_TOTAL,
        items: items
      };

      const order = await createOrder(orderData);
      
      if (order) {
        setIsProcessingSuccess(true);
        clearCart();
        router.push(`/checkout/success?orderId=${order.id}`);
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
    <div className="bg-background min-h-screen pt-40 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto selection:bg-brand-accent/20">
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
                      className="w-full bg-white border border-outline/10 p-5 text-sm font-light focus:border-brand-accent outline-none transition-colors"
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
                      className="w-full bg-white border border-outline/10 p-5 text-sm font-light focus:border-brand-accent outline-none transition-colors"
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
                      className="w-full bg-white border border-outline/10 p-5 text-sm font-light focus:border-brand-accent outline-none transition-colors"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 space-y-4 pt-6 mt-2 border-t border-outline/5">
                    <label className="text-[8px] font-black text-secondary/40 uppercase tracking-[0.4em]">Delivery Designation</label>
                    
                    {savedAddresses.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {savedAddresses.map((addr) => (
                          <div 
                            key={addr.id}
                            onClick={() => handleAddressSelect(addr.id)}
                            className={`p-4 border cursor-pointer transition-colors flex flex-col gap-2 ${selectedAddressId === addr.id ? 'border-brand-accent bg-brand-accent/5' : 'border-outline/10 hover:border-outline/20 bg-white'}`}
                          >
                            <span className="text-[10px] uppercase tracking-widest text-primary font-medium">{addr.title || 'Saved Address'}</span>
                            <span className="text-xs text-secondary font-light line-clamp-1">{addr.address_line}</span>
                          </div>
                        ))}
                        <div 
                          onClick={() => handleAddressSelect('new')}
                          className={`p-4 border cursor-pointer transition-colors flex items-center justify-center gap-2 ${selectedAddressId === 'new' ? 'border-primary bg-surface-container-low' : 'border-dashed border-outline/20 hover:border-outline/40 bg-white'}`}
                        >
                          <span className="text-[10px] uppercase tracking-widest font-medium">Add New Address</span>
                        </div>
                      </div>
                    )}

                    <textarea 
                      name="shipping_address"
                      value={shippingInfo.shipping_address}
                      onChange={handleInputChange}
                      disabled={selectedAddressId !== 'new'}
                      placeholder="Street, Building, Floor"
                      className="w-full bg-white border border-outline/10 p-5 text-sm font-light focus:border-brand-accent outline-none min-h-[120px] transition-colors disabled:bg-surface-container-low disabled:cursor-not-allowed"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[8px] font-black text-secondary/40 uppercase tracking-[0.4em]">State / Region</label>
                    <div className="relative">
                      <select 
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleInputChange}
                        disabled={selectedAddressId !== 'new'}
                        className="w-full bg-white border border-outline/10 p-5 text-sm font-light focus:border-brand-accent outline-none appearance-none transition-colors disabled:bg-surface-container-low disabled:cursor-not-allowed"
                        required
                      >
                        <option value="" disabled>Select State</option>
                        {STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[8px] font-black text-secondary/40 uppercase tracking-[0.4em]">District</label>
                    <div className="relative">
                      <select 
                        name="district"
                        value={shippingInfo.district}
                        onChange={handleInputChange}
                        disabled={selectedAddressId !== 'new' || !shippingInfo.state}
                        className="w-full bg-white border border-outline/10 p-5 text-sm font-light focus:border-brand-accent outline-none appearance-none transition-colors disabled:bg-surface-container-low disabled:cursor-not-allowed"
                        required
                      >
                        <option value="" disabled>Select District</option>
                        {(shippingInfo.state && DISTRICTS[shippingInfo.state] ? DISTRICTS[shippingInfo.state] : []).map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[8px] font-black text-secondary/40 uppercase tracking-[0.4em]">Pincode</label>
                    <input 
                      name="pincode"
                      value={shippingInfo.pincode}
                      onChange={handleInputChange}
                      disabled={selectedAddressId !== 'new'}
                      placeholder="000 000"
                      className="w-full bg-white border border-outline/10 p-5 text-sm font-light focus:border-brand-accent outline-none transition-colors disabled:bg-surface-container-low disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                </form>

                <button 
                  onClick={() => setStep(2)}
                  disabled={!shippingInfo.customer_name || !shippingInfo.shipping_address || !shippingInfo.customer_phone || !shippingInfo.state || !shippingInfo.district}
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
                  <span className="text-secondary/50">Subtotal</span>
                  <span className="text-primary">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="text-secondary/50">Estimated GST (18%)</span>
                  <span className="text-primary">₹{ESTIMATED_TAX.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="text-secondary/50">Shipping Logistics</span>
                  <span className="text-primary">
                    ₹{SHIPPING_CHARGE.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xl font-black pt-6 border-t border-dashed border-outline/10">
                  <span className="font-headline text-primary tracking-tighter">TOTAL VALUATION</span>
                  <span className="text-brand-accent">₹{GRAND_TOTAL.toLocaleString()}</span>
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
