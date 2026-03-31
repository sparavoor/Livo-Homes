'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getUserOrders, cancelOrder } from '@/lib/orders';
import { getUserAddresses, deleteUserAddress, UserAddress } from '@/lib/addresses';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import useSWR from 'swr';

type Tab = 'orders' | 'addresses' | 'wishlist' | 'settings';

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile, logout } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // SWR for Orders
  const { data: orders, error: ordersError, isLoading: isOrdersLoading, mutate: mutateOrders } = useSWR(
    user ? `orders-${user.id}` : null,
    () => getUserOrders(user!.id),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  // SWR for Addresses
  const { data: addresses, error: addressesError, isLoading: isAddressesLoading, mutate: mutateAddresses } = useSWR(
    user ? `addresses-${user.id}` : null,
    () => getUserAddresses(user!.id),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  useEffect(() => {
    if (profile) {
      setEditedName(profile.full_name || '');
      setEditedEmail(profile.email || '');
      setEditedPhone(profile.phone || '');
    }
  }, [profile]);

  const handleRemoveAddress = async (id: string) => {
    if (!user) return;
    const confirmed = window.confirm("Are you sure you want to remove this address?");
    if (!confirmed) return;
    
    try {
      await deleteUserAddress(id, user.id);
      mutateAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
      const updates = {
        full_name: editedName.trim(),
        email: editedEmail.trim() || profile?.email,
        phone: editedPhone.trim() || profile?.phone,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      alert('Account settings updated successfully.');
    } catch (error: any) {
      console.error('Profile update failed:', error.message);
      alert(error.message || 'Credentials could not be updated.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    logout();
    router.push('/');
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!user) return;
    const confirmed = window.confirm("Are you sure you want to cancel this procurement? This action cannot be undone.");
    if (!confirmed) return;

    setIsCancelling(true);
    try {
      await cancelOrder(orderId, user.id);
      mutateOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
      alert("Procurement successfully cancelled.");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Unable to cancel order at this time.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Improved Login Check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router]);

  // Loading State - Use Skeleton instead of blank screen
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-background pt-32 px-6 md:px-12 max-w-[1440px] mx-auto animate-pulse">
        <div className="h-12 w-64 bg-surface-container-low mb-12"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-3 space-y-4">
             {[1,2,3,4].map(i => <div key={i} className="h-8 w-full bg-surface-container-low"></div>)}
          </div>
          <div className="lg:col-span-9 h-96 bg-surface-container-low"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="font-body selection:bg-brand-accent/20 bg-background min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 md:mb-24"
      >
        <h1 className="font-headline text-4xl md:text-5xl font-light text-primary mb-4 tracking-tight">Your Account</h1>
        <p className="text-secondary font-light text-lg">Manage your architectural procurements, addresses, and personal credentials.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 lg:sticky lg:top-32 space-y-2 border-l border-outline/40 pl-6">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`block w-full text-left text-sm uppercase tracking-widest py-3 transition-colors ${activeTab === 'orders' ? 'text-primary font-medium' : 'text-secondary hover:text-primary'}`}
          >
            Order History
          </button>
          <button 
            onClick={() => setActiveTab('addresses')}
            className={`block w-full text-left text-sm uppercase tracking-widest py-3 transition-colors ${activeTab === 'addresses' ? 'text-primary font-medium' : 'text-secondary hover:text-primary'}`}
          >
            Saved Addresses
          </button>
          <button 
            onClick={() => setActiveTab('wishlist')}
            className={`block w-full text-left text-sm uppercase tracking-widest py-3 transition-colors ${activeTab === 'wishlist' ? 'text-primary font-medium' : 'text-secondary hover:text-primary'}`}
          >
            Wishlist
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`block w-full text-left text-sm uppercase tracking-widest py-3 transition-colors ${activeTab === 'settings' ? 'text-primary font-medium' : 'text-secondary hover:text-primary'}`}
          >
            Account Settings
          </button>
          
          {profile?.is_admin && (
            <Link 
              href="/admin"
              className="block w-full text-left text-sm uppercase tracking-widest py-3 text-brand-accent hover:text-primary transition-colors mt-8"
            >
              Executive Portal
            </Link>
          )}

          <button 
            onClick={handleLogout}
            className="block w-full text-left text-sm uppercase tracking-widest py-3 text-error/80 hover:text-error transition-colors mt-8"
          >
            Sign Out
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 min-h-[500px]">
          
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-headline text-3xl font-light text-primary mb-10 tracking-tight">Order History</h2>
              
              {isOrdersLoading ? (
                <div className="space-y-6">
                  {[1, 2].map(i => (
                    <div key={i} className="h-32 bg-surface-container-low animate-pulse rounded-sm"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-surface-container-low p-16 flex flex-col items-center justify-center text-center rounded-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-secondary mb-6"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                  <h3 className="text-xl font-headline font-light text-primary mb-2">No past procurements</h3>
                  <p className="text-secondary font-light max-w-sm">Your architectural journey has no recorded acquisitions. Explore our collections to begin.</p>
                  <Link href="/products" className="mt-8 border border-outline text-primary px-8 py-3 rounded-sm font-body text-xs uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all">Browse Collections</Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders?.map((order: any) => (
                    <div key={order.id} className="border border-outline rounded-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-shadow bg-white">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-secondary uppercase tracking-widest font-medium">Order #{order.id.slice(-6).toUpperCase()}</span>
                          <span className={`text-[10px] uppercase tracking-[0.2em] font-medium px-2 py-1 rounded-sm ${
                            order.status === 'delivered' ? 'text-green-700 bg-green-50' : 
                            order.status === 'cancelled' ? 'text-red-700 bg-red-50' : 
                            'text-brand-accent bg-orange-50'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-light text-primary tracking-tight">₹{order.total_amount.toLocaleString()}</h3>
                        <p className="text-xs text-secondary font-light">
                          Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex gap-2">
                          {order.order_items?.slice(0, 3).map((item: any, i: number) => (
                            <div key={i} className="w-16 h-16 bg-surface-container-low rounded-sm flex items-center justify-center overflow-hidden">
                               {item.products?.image ? (
                                 <img src={item.products.image} alt="item" className="w-full h-full object-cover" />
                               ) : (
                                 <span className="text-[10px] text-secondary/40 font-medium uppercase">No Img</span>
                               )}
                            </div>
                          ))}
                          {order.order_items?.length > 3 && (
                            <div className="w-16 h-16 bg-surface-container-low rounded-sm flex items-center justify-center text-xs text-secondary font-medium">
                              +{order.order_items.length - 3}
                            </div>
                          )}
                        </div>
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="hidden sm:block text-xs uppercase tracking-widest text-primary hover:text-brand-accent transition-colors font-medium"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Order Details Modal Overlay */}
            <AnimatePresence>
              {selectedOrder && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-primary/20 backdrop-blur-sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl p-8 sm:p-12 relative"
                  >
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="absolute top-8 right-8 text-secondary hover:text-primary transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>

                    <div className="space-y-12">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent">Procurement Details</span>
                          <span className={`text-[10px] uppercase tracking-[0.2em] font-medium px-2 py-1 rounded-sm ${
                            selectedOrder.status === 'delivered' ? 'text-green-700 bg-green-50' : 
                            selectedOrder.status === 'cancelled' ? 'text-red-700 bg-red-50' : 
                            'text-brand-accent bg-orange-50'
                          }`}>
                            {selectedOrder.status}
                          </span>
                        </div>
                        <h2 className="font-headline text-3xl font-light text-primary tracking-tight">Order #{selectedOrder.id.slice(-8).toUpperCase()}</h2>
                        <p className="text-secondary text-sm font-light">Placed on {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary/60 pb-2 border-b border-outline">Inventory Items</h3>
                        <div className="space-y-6">
                          {selectedOrder.order_items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-surface-container-low rounded-sm overflow-hidden flex-shrink-0">
                                {item.products?.image && <img src={item.products.image} className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-primary uppercase tracking-tight">{item.product_name}</p>
                                <p className="text-xs text-secondary font-light">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString()}</p>
                              </div>
                              <p className="text-sm font-medium text-primary">₹{(Number(item.price) * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-outline">
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary/60">Shipping Logistics</h3>
                          <p className="text-sm text-primary font-medium leading-relaxed">
                            {selectedOrder.customer_name}<br/>
                            <span className="font-light text-secondary">
                              {selectedOrder.shipping_address}<br/>
                              {selectedOrder.district}, {selectedOrder.state} {selectedOrder.pincode}<br/>
                              Direct: {selectedOrder.customer_phone}
                            </span>
                          </p>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary/60">Valuation</h3>
                          <div className="space-y-2">
                             <div className="flex justify-between text-sm">
                               <span className="text-secondary font-light">Subtotal</span>
                               <span className="text-primary font-medium">₹{Number(selectedOrder.total_amount).toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                               <span className="text-secondary font-light">Shipping</span>
                               <span className="text-green-600 font-medium tracking-widest uppercase text-[10px]">Complimentary</span>
                             </div>
                             <div className="flex justify-between text-lg pt-4 border-t border-dashed border-outline font-headline">
                               <span className="text-primary tracking-tight">Total</span>
                               <span className="text-brand-accent">₹{Number(selectedOrder.total_amount).toLocaleString()}</span>
                             </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-12 flex flex-col sm:flex-row gap-6">
                        {selectedOrder.status === 'pending' && (
                          <button 
                            disabled={isCancelling}
                            onClick={() => handleCancelOrder(selectedOrder.id)}
                            className="bg-error/5 text-error text-[10px] font-bold uppercase tracking-[0.3em] px-8 py-4 rounded-sm hover:bg-error hover:text-white transition-all disabled:opacity-50"
                          >
                            {isCancelling ? 'Processing Withdrawal...' : 'Cancel Procurement'}
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedOrder(null)}
                          className="flex-1 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.3em] px-8 py-4 rounded-sm hover:opacity-90 transition-all"
                        >
                          Close Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-headline text-3xl font-light text-primary mb-10 tracking-tight">Saved Addresses</h2>
              
              {isAddressesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="h-64 bg-surface-container-low animate-pulse rounded-sm"></div>
                  </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {addresses?.map((addr) => (
                     <div key={addr.id} className="border border-outline rounded-sm p-6 sm:p-8 flex flex-col h-full bg-white">
                        <div className="mb-4">
                          <span className="text-[10px] uppercase tracking-widest text-secondary font-medium border border-outline px-2 py-1 rounded-sm">{addr.title || 'Saved Address'}</span>
                        </div>
                        <p className="text-primary font-medium text-lg mb-2">{profile?.full_name || 'Anonymous User'}</p>
                        <p className="text-secondary font-light text-sm leading-relaxed mb-6">
                          {addr.address_line}<br/>
                          {addr.district}, {addr.state} {addr.pincode}<br/>
                          India
                        </p>
                        <p className="text-secondary font-light text-sm mb-auto">Phone: {profile?.phone || 'Not provided'}</p>
                        
                        <div className="pt-6 mt-6 border-t border-outline flex gap-6 text-xs uppercase tracking-widest font-medium">
                          <button onClick={() => alert('Editing addresses will be supported in an upcoming patch.')} className="text-primary hover:text-brand-accent transition-colors">Edit</button>
                          <button onClick={() => handleRemoveAddress(addr.id)} className="text-error/80 hover:text-error transition-colors">Remove</button>
                        </div>
                     </div>
                   ))}
                   
                   {/* Add New Button */}
                   <Link href="/products" className="border border-dashed border-outline rounded-sm p-8 flex flex-col items-center justify-center gap-4 text-secondary hover:text-primary hover:border-primary transition-colors min-h-[300px] h-full group bg-surface-container-low/50 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      <span className="text-xs uppercase tracking-widest font-medium text-center leading-relaxed">Shop carefully to<br/>Add a New Address</span>
                   </Link>
                </div>
              )}

            </motion.div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-headline text-3xl font-light text-primary mb-10 tracking-tight">Curated Wishlist</h2>
              <div className="bg-surface-container-low p-16 flex flex-col items-center justify-center text-center rounded-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-secondary mb-6"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                <h3 className="text-xl font-headline font-light text-primary mb-2">Your wishlist is empty</h3>
                <p className="text-secondary font-light max-w-sm">Save your favorite architectural pieces to review later or share with your procurement team.</p>
                <Link href="/products" className="mt-8 border border-outline text-primary px-8 py-3 rounded-sm font-body text-xs uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all">Explore Collections</Link>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <h2 className="font-headline text-3xl font-light text-primary mb-10 tracking-tight">Account Settings</h2>
               <div className="max-w-xl">
                 <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="space-y-2">
                       <label className="text-xs uppercase tracking-widest text-secondary font-medium">Display Name</label>
                       <input 
                          className="w-full bg-transparent border-b border-outline pb-3 text-lg font-light text-primary focus:border-brand-accent outline-none transition-colors"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          placeholder="Your full name"
                       />
                    </div>
                     <div className="space-y-4">
                        <label className="text-xs uppercase tracking-widest text-secondary font-medium">Email / Contact Manifest</label>
                        {profile?.email ? (
                          <input 
                            disabled
                            className="w-full bg-transparent border-b border-outline pb-3 text-lg font-light text-secondary outline-none cursor-not-allowed"
                            value={profile.email}
                          />
                        ) : (
                          <input 
                            className="w-full bg-transparent border-b border-outline pb-3 text-lg font-light text-primary focus:border-brand-accent outline-none transition-colors"
                            value={editedEmail}
                            onChange={(e) => setEditedEmail(e.target.value)}
                            placeholder="Add your email address"
                          />
                        )}
                        <p className="text-[10px] text-secondary mt-1">{profile?.email ? "Primary login email cannot be changed here." : "Add an email to receive digital procurement receipts."}</p>
                     </div>
                     <div className="space-y-4">
                        <label className="text-xs uppercase tracking-widest text-secondary font-medium">Direct Line (Phone)</label>
                        {profile?.phone ? (
                          <input 
                            disabled
                            className="w-full bg-transparent border-b border-outline pb-3 text-lg font-light text-secondary outline-none cursor-not-allowed"
                            value={profile.phone}
                          />
                        ) : (
                          <input 
                            className="w-full bg-transparent border-b border-outline pb-3 text-lg font-light text-primary focus:border-brand-accent outline-none transition-colors"
                            value={editedPhone}
                            onChange={(e) => setEditedPhone(e.target.value)}
                            placeholder="Add your phone number (e.g. +91...)"
                          />
                        )}
                        <p className="text-[10px] text-secondary mt-1">{profile?.phone ? "Registered mobile number." : "Add a mobile number for logistics coordination."}</p>
                     </div>
                     
                     <button 
                        type="submit" 
                        disabled={isUpdating}
                        className="mt-8 bg-primary text-white px-10 py-4 rounded-sm font-body text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all disabled:opacity-50"
                     >
                        {isUpdating ? "Saving Credentials..." : "Save Manifest Updates"}
                     </button>
                 </form>
               </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
