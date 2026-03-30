'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { cancelOrderAction, updateProfileAction } from './actions';
import { fetchProductsAction } from '@/app/admin/products/actions';
import { fetchPromoCodesAction } from '@/app/admin/promo/actions';
import { Product } from '@/lib/db';
import { INDIA_STATES, STATE_DISTRICTS } from '@/data/india-locations';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  district: string;
  zip: string;
  country: string;
  is_default: boolean;
}

interface WishlistItem {
  product_id: string;
  product?: any;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method?: string;
  shipping_address?: string;
  city?: string;
  items?: OrderItem[];
}

export default function ProfilePage() {
  const { user, profile, loading, logout, refreshProfile } = useAuth();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Settings state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Data states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: 'Kerala',
    district: '',
    zip: '',
    country: 'India'
  });
  const [promoCodes, setPromoCodes] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (profile) {
      setEditName(profile.full_name || '');
      setEditPhone(profile.phone || '');
    }
  }, [user, loading, router, profile]);

  useEffect(() => {
    if (user) {
      if (activeTab === 'address') fetchAddresses();
      if (activeTab === 'orders') {
        fetchProducts();
        fetchOrders();
      }
      if (activeTab === 'coupons') fetchPromoCodes();
    }
  }, [user, activeTab]);

  const fetchPromoCodes = async () => {
    try {
      const allPromos = await fetchPromoCodesAction();
      
      const privilegeHierarchy: Record<string, number> = {
        'standard': 0,
        'silver': 1,
        'gold': 2,
        'platinum': 3
      };

      const userLevel = privilegeHierarchy[profile?.privilege_tier?.toLowerCase() || 'standard'] || 0;
      
      const availablePromos = (allPromos || []).filter(promo => {
        const requiredLevel = privilegeHierarchy[promo.min_privilege?.toLowerCase() || 'standard'] || 0;
        return userLevel >= requiredLevel && promo.status === 'active';
      });

      setPromoCodes(availablePromos);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await fetchProductsAction();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false });
      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      if (error) throw error;
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, items: data } : o));
      setExpandedOrderId(orderId);
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order? This action is consistent with our architectural integrity protocols and cannot be reversed.")) return;
    try {
      const result = await cancelOrderAction(orderId);
      if (result.success) {
        alert("Procurement status updated to: Cancelled. Any digital settlements will be accounted for within 7 business cycles.");
        fetchOrders();
      }
    } catch (error: any) {
      alert(error.message || "Failed to cancel order.");
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      setWishlist(data || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingSettings(true);
    setSettingsMessage({ type: '', text: '' });
    try {
      const result = await updateProfileAction({
        full_name: editName,
        phone: editPhone,
      });
      
      if (!result.success) throw new Error('Failed to update profile');
      
      // Refresh context profile
      await refreshProfile();
      
      setSettingsMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setSettingsMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { error } = await supabase
        .from('addresses')
        .insert([{ ...newAddress, profile_id: user.id }]);
      if (error) throw error;
      setIsAddingAddress(false);
      setNewAddress({ label: 'Home', street: '', city: '', state: 'Kerala', district: '', zip: '', country: 'India' });
      fetchAddresses();
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = '/';
    }
  };

  if (!hasMounted || loading) {
    return (
      <div className="container mx-auto px-8 py-24 pt-32 flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-surface-container-high rounded-full mb-8 shadow-inner overflow-hidden flex items-center justify-center">
             <div className="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-container-low animate-pulse"></div>
          </div>
          <div className="h-4 bg-surface-container-high rounded-full w-48 mb-4"></div>
          <div className="h-2 bg-surface-container-high rounded-full w-32 opacity-50"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayProfile = profile || {
    full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || 'Architectural Member',
    avatar_url: user?.user_metadata?.avatar_url || user?.user_metadata?.picture,
    phone: user?.phone || user?.email,
    email: user?.email
  };

  const userInitial = (displayProfile.full_name || 'U').charAt(0).toUpperCase();

  const navItems = [
    { id: 'orders', label: 'My Orders', icon: 'shopping_bag' },
    { id: 'wishlist', label: 'Wishlist', icon: 'favorite' },
    { id: 'address', label: 'Addresses', icon: 'location_on' },
    // { id: 'payments', label: 'Saved Cards', icon: 'credit_card' }, // Hidden as per request
    { id: 'coupons', label: 'Coupons', icon: 'confirmation_number' },
    { id: 'settings', label: 'Account Settings', icon: 'settings' },
    { id: 'help', label: 'Help & Support', icon: 'help' },
  ];

  return (
    <div className="container mx-auto px-8 py-24 pt-32">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 bg-white rounded-lg p-8 border border-outline/5 shadow-2xl lg:sticky lg:top-32">
          <div className="flex flex-col items-center text-center mb-12 pb-10 border-b border-outline/5">
            <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-headline font-black overflow-hidden mb-6 shadow-2xl border-4 border-white">
              {displayProfile.avatar_url ? (
                <img src={displayProfile.avatar_url} alt={displayProfile.full_name || ''} className="w-full h-full object-cover" />
              ) : userInitial}
            </div>
            <div className="w-full px-2">
              <h2 className="text-xl font-headline font-black text-primary tracking-tight truncate mb-1">
                {displayProfile.full_name || 'Architectural Member'}
              </h2>
              <p className="text-secondary text-[10px] uppercase font-black tracking-[0.2em] opacity-40 truncate">
                {displayProfile.email}
              </p>
              {displayProfile.phone && (
                <p className="text-secondary text-[9px] uppercase font-bold tracking-[0.1em] opacity-30 truncate mt-1">
                  {displayProfile.phone}
                </p>
              )}
            </div>
          </div>
          
          <nav className="flex flex-col gap-2">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)} 
                className={`flex items-center gap-5 px-6 py-5 rounded-lg transition-all duration-500 font-headline font-bold text-[10px] uppercase tracking-[0.2em] group ${
                  activeTab === item.id 
                    ? 'bg-brand-accent text-white shadow-xl translate-x-1' 
                    : 'hover:bg-primary/5 text-secondary'
                }`}
              >
                <span className={`material-symbols-outlined text-lg transition-colors ${activeTab === item.id ? 'text-white' : 'text-primary/20 group-hover:text-brand-accent'}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-5 px-6 py-5 rounded-lg transition-all duration-500 font-headline font-black text-[10px] uppercase tracking-[0.2em] text-error mt-10 hover:bg-error/5 group"
            >
              <span className="material-symbols-outlined text-lg opacity-20 group-hover:opacity-100">logout</span>
              Sign Out
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full bg-white rounded-lg p-12 border border-outline/5 shadow-2xl min-h-[700px]">
          
          {activeTab === 'orders' && (
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-8 h-[1px] bg-brand-accent"></div>
                <span className="text-brand-accent font-label text-[9px] font-black uppercase tracking-[0.4em]">Procurement</span>
              </div>
              <h2 className="text-4xl font-headline font-black text-primary tracking-tighter mb-12 pb-6 border-b border-outline/5">
                Order <span className="font-serif italic text-secondary/40 font-light">History.</span>
              </h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-32 bg-background rounded-xl border border-dashed border-outline/20">
                  <span className="material-symbols-outlined text-6xl text-primary/10 mb-6 font-light">receipt_long</span>
                  <h3 className="text-xl font-headline font-black text-primary mb-2 tracking-tight">Archives are empty</h3>
                  <p className="text-secondary text-sm font-light mb-10 max-w-sm mx-auto">Your architectural journey begins with your first procurement. Explore our curation.</p>
                  <Link href="/products" className="bg-primary text-white px-10 py-4 rounded-sm font-headline font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all duration-700 shadow-2xl inline-block">Begin Selection</Link>
                </div>
              ) : (
                <div className="space-y-12">
                  {orders.map(order => {
                    // Try to get the primary item for display
                    const primaryItem = order.items && order.items.length > 0 ? order.items[0] : null;
                    const productDetails = primaryItem ? products.find(p => p.id === primaryItem.product_id) : null;

                    return (
                      <div key={order.id} className="bg-white border-b border-outline/10 pb-12 group last:border-0">
                        <div className="flex flex-col md:flex-row gap-10 items-start">
                          {/* Product Image Focus */}
                          <div className="w-full md:w-56 h-56 bg-white border border-outline/5 rounded-sm overflow-hidden p-4 group-hover:scale-[1.02] transition-transform duration-700 shadow-sm relative">
                            {productDetails ? (
                              <img src={productDetails.image} alt={productDetails.name} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-[10px] text-secondary/20 uppercase tracking-[0.3em]">Vault Asset</div>
                            )}
                            <div className="absolute top-4 right-4 group-hover:opacity-100 opacity-0 transition-opacity">
                               <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] shadow-lg ${
                                order.status === 'delivered' ? 'bg-green-500 text-white' : 
                                order.status === 'cancelled' ? 'bg-error text-white' : 
                                'bg-brand-accent text-white'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>

                          {/* Order Brief */}
                          <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[9px] font-black text-brand-accent tracking-[0.4em] uppercase mb-2">Manifest Reference</p>
                                <h3 className="text-2xl font-headline font-black text-primary tracking-tighter mb-1 uppercase">
                                  {productDetails?.name || `ORDER #${order.id.slice(0,8).toUpperCase()}`}
                                  {order.items && order.items.length > 1 && <span className="text-secondary font-serif italic text-lg ml-2">+ {order.items.length - 1} more assets</span>}
                                </h3>
                                <p className="text-[10px] text-secondary/60 font-bold uppercase tracking-[0.2em]">Procured on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-headline font-black text-primary tracking-tighter">₹{order.total_amount.toLocaleString()}</p>
                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${
                                  order.status === 'delivered' ? 'text-green-600' : 
                                  order.status === 'cancelled' ? 'text-error' : 
                                  'text-brand-accent'
                                }`}>
                                  Status: {order.status}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-10 pt-4 items-center">
                              <button 
                                onClick={() => fetchOrderDetails(order.id)}
                                className="bg-primary text-white px-8 py-3 rounded-sm font-headline font-black text-[9px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all duration-700 shadow-lg flex items-center gap-3"
                              >
                                {expandedOrderId === order.id ? 'Conceal Manifest' : 'Expand Manifest'}
                                <span className={`material-symbols-outlined text-[14px] transition-transform duration-500 ${expandedOrderId === order.id ? 'rotate-180' : ''}`}>expand_more</span>
                              </button>
                              
                              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                <button 
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="text-error font-headline font-bold text-[9px] uppercase tracking-[0.3em] hover:underline transition-all opacity-40 hover:opacity-100"
                                >
                                  Suspend Order
                                </button>
                              )}
                              
                              {order.status === 'delivered' && (
                                <Link href={`/products/${primaryItem?.product_id}`} className="text-primary font-headline font-bold text-[9px] uppercase tracking-[0.3em] hover:text-brand-accent transition-all">Archived View</Link>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded details moved inside the card flow */}
                        {expandedOrderId === order.id && order.items && (
                          <div className="mt-12 p-10 bg-background/50 rounded-lg border border-outline/5 animate-in fade-in slide-in-from-top-4 duration-1000 shadow-inner">
                            <h4 className="font-label text-brand-accent text-[9px] font-black uppercase tracking-[0.6em] mb-10 border-b border-outline/10 pb-4">Architectural Manifest Specifications</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                                <div className="space-y-4">
                                  <p className="text-[8px] font-black text-secondary uppercase tracking-[0.4em]">Logistic Point</p>
                                  <p className="text-sm font-headline font-bold text-primary leading-relaxed opacity-80 uppercase tracking-tight">
                                    {profile?.full_name}<br />
                                    {order.shipping_address}<br />
                                    {order.city}, India
                                  </p>
                                </div>
                                  <div className="space-y-4">
                                    <p className="text-[8px] font-black text-secondary uppercase tracking-[0.4em]">Financial Status</p>
                                    <div className="flex items-center gap-3">
                                      <span className="material-symbols-outlined text-brand-accent text-sm">
                                        {order.payment_method === 'cod' ? 'handshake' : 'verified_user'}
                                      </span>
                                      <p className="text-[10px] text-primary font-black uppercase tracking-[0.1em]">
                                        {order.payment_method === 'cod' ? 'Settlement via Cash on Delivery' : 'Settlement via Online Portal'}
                                      </p>
                                    </div>
                                    <p className="text-[9px] text-secondary/60">ID Tag: {order.id}</p>
                                  </div>
                            </div>

                            <div className="space-y-6">
                              {order.items.map((item: any) => {
                                const itemProduct = products.find(p => p.id === item.product_id);
                                return (
                                  <div key={item.id} className="flex justify-between items-center bg-white p-6 rounded-sm border border-outline/5 transition-all hover:shadow-xl group/item">
                                    <div className="flex items-center gap-6">
                                      <div className="w-16 h-16 bg-background rounded-sm flex items-center justify-center border border-outline/5 p-2">
                                        {itemProduct ? <img src={itemProduct.image} alt={itemProduct.name} className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-secondary opacity-10">inventory_2</span>}
                                      </div>
                                      <div>
                                        <p className="text-sm font-headline font-black text-primary mb-1 uppercase tracking-tight">{itemProduct?.name || 'Vault Asset'}</p>
                                        <div className="flex gap-4">
                                          <p className="text-[9px] text-secondary/60 uppercase font-bold tracking-[0.2em]">Scale: {item.quantity} Units</p>
                                          <p className="text-[9px] text-secondary/60 uppercase font-bold tracking-[0.2em]">Ref: {item.product_id.slice(0,8).toUpperCase()}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <p className="text-lg font-headline font-black text-primary tracking-tighter">₹{(item.price_at_purchase ?? 0).toLocaleString()}</p>
                                  </div>
                                );
                              })}
                            </div>
                            
                            <div className="mt-12 pt-8 border-t border-dashed border-outline/20">
                               <Link href="#help" onClick={() => setActiveTab('help')} className="text-[9px] font-black text-secondary tracking-[0.3em] uppercase hover:text-brand-accent transition-colors">Review Cancellation & Reclamation Protocols</Link>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-8 h-[1px] bg-brand-accent"></div>
                <span className="text-brand-accent font-label text-[9px] font-black uppercase tracking-[0.4em]">Curation</span>
              </div>
              <h2 className="text-4xl font-headline font-black text-primary tracking-tighter mb-12 pb-6 border-b border-outline/5">
                My <span className="font-serif italic text-secondary/40 font-light">Wishlist.</span>
              </h2>
              {wishlist.length === 0 ? (
                <div className="text-center py-32 bg-background rounded-xl border border-dashed border-outline/20">
                  <span className="material-symbols-outlined text-6xl text-primary/10 mb-6 font-light font-variation-heart">favorite</span>
                  <h3 className="text-xl font-headline font-black text-primary mb-2 tracking-tight">No Curated Favorites</h3>
                  <p className="text-secondary text-sm font-light mb-10 max-w-sm mx-auto">Save your architectural inspirations for future procurement.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* List logic here */}
                </div>
              )}
            </div>
          )}

          {activeTab === 'address' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-outline/5 pb-6">
                <div>
                   <div className="flex items-center gap-4 mb-3">
                    <div className="w-8 h-[1px] bg-brand-accent"></div>
                    <span className="text-brand-accent font-label text-[9px] font-black uppercase tracking-[0.4em]">Logistics</span>
                  </div>
                  <h2 className="text-4xl font-headline font-black text-primary tracking-tighter">
                    Delivery <span className="font-serif italic text-secondary/40 font-light">Points.</span>
                  </h2>
                </div>
                <button 
                  onClick={() => setIsAddingAddress(true)}
                  className="bg-primary text-white px-8 py-3 rounded-sm font-headline font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all duration-700 shadow-2xl flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-sm font-black">add</span>
                  Register Point
                </button>
              </div>

              {isAddingAddress && (
                <form onSubmit={handleAddAddress} className="mb-12 p-10 bg-background rounded-xl border border-outline/10 shadow-2xl grid grid-cols-2 gap-8 animate-in slide-in-from-top-8 duration-700">
                  <div className="col-span-2">
                    <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase mb-3">Recognition Label</label>
                    <input type="text" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className="w-full bg-white border border-outline/10 rounded-lg p-5 text-sm focus:ring-1 focus:ring-brand-accent outline-none font-headline font-bold transition-all" placeholder="e.g. Master Residence" required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase mb-3">Street Architecture</label>
                    <input type="text" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full bg-white border border-outline/10 rounded-lg p-5 text-sm focus:ring-1 focus:ring-brand-accent outline-none font-headline font-bold transition-all" placeholder="123 Architectural Way" required />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase mb-3">State</label>
                    <select 
                      value={newAddress.state} 
                      onChange={e => setNewAddress({...newAddress, state: e.target.value, district: ''})} 
                      className="w-full bg-white border border-outline/10 rounded-lg p-5 text-sm focus:ring-1 focus:ring-brand-accent outline-none font-headline font-bold transition-all" 
                      required
                    >
                      <option value="">Select State</option>
                      {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase mb-3">District</label>
                    <select 
                      value={newAddress.district} 
                      onChange={e => setNewAddress({...newAddress, district: e.target.value})} 
                      className="w-full bg-white border border-outline/10 rounded-lg p-5 text-sm focus:ring-1 focus:ring-brand-accent outline-none font-headline font-bold transition-all"
                      disabled={!newAddress.state}
                      required
                    >
                      <option value="">Select District</option>
                      {newAddress.state && STATE_DISTRICTS[newAddress.state]?.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase mb-3">City / Town</label>
                    <input type="text" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full bg-white border border-outline/10 rounded-lg p-5 text-sm focus:ring-1 focus:ring-brand-accent outline-none font-headline font-bold transition-all" required />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase mb-3">Postal Code</label>
                    <input type="text" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} className="w-full bg-white border border-outline/10 rounded-lg p-5 text-sm focus:ring-1 focus:ring-brand-accent outline-none font-headline font-bold transition-all" required />
                  </div>
                  <div className="flex items-end justify-end gap-6 pt-4">
                    <button type="button" onClick={() => setIsAddingAddress(false)} className="text-secondary font-headline font-black text-[10px] uppercase tracking-[0.3em] hover:text-primary transition-colors">Discard</button>
                    <button type="submit" className="bg-primary text-white px-10 py-4 rounded-sm font-headline font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all duration-700 shadow-2xl">Save Point</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {addresses.length === 0 && !isAddingAddress && (
                  <div className="col-span-2 text-center py-24 bg-background rounded-xl border border-dashed border-outline/20">
                    <span className="material-symbols-outlined text-5xl mb-6 text-primary/10 font-light">location_off</span>
                    <p className="text-secondary font-headline font-bold uppercase tracking-[0.2em] text-[10px]">No delivery points registered.</p>
                  </div>
                )}
                {addresses.map(addr => (
                  <div key={addr.id} className="p-8 border border-outline/5 rounded-xl relative group hover:shadow-2xl transition-all duration-700 hover:border-brand-accent/20">
                    <div className="flex justify-between items-start mb-8">
                      <span className="px-5 py-1.5 bg-brand-accent/10 text-brand-accent text-[8px] font-black uppercase tracking-[0.3em] rounded-full">{addr.label}</span>
                      <button onClick={() => handleDeleteAddress(addr.id)} className="text-error opacity-0 group-hover:opacity-100 transition-all duration-500 p-3 hover:bg-error/5 rounded-full">
                        <span className="material-symbols-outlined text-[20px] font-light">delete</span>
                      </button>
                    </div>
                    <p className="text-xl font-headline font-black text-primary mb-2 tracking-tight">{addr.street}</p>
                    <p className="text-sm text-secondary font-light leading-relaxed">{addr.city}, {addr.district}, {addr.state} {addr.zip}</p>
                    <div className="w-12 h-[1px] bg-brand-accent/20 mt-8"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'coupons' && (
            <div>
               <div className="flex items-center gap-4 mb-3">
                <div className="w-8 h-[1px] bg-brand-accent"></div>
                <span className="text-brand-accent font-label text-[9px] font-black uppercase tracking-[0.4em]">Rewards</span>
              </div>
              <h2 className="text-4xl font-headline font-black text-primary tracking-tighter mb-12 pb-6 border-b border-outline/5">
                Privilege <span className="font-serif italic text-secondary/40 font-light">Vouchers.</span>
              </h2>
              
              {promoCodes.length === 0 ? (
                <div className="text-center py-32 bg-background rounded-xl border border-dashed border-outline/20">
                  <span className="material-symbols-outlined text-6xl text-primary/10 mb-6 font-light">confirmation_number</span>
                  <h3 className="text-xl font-headline font-black text-primary mb-2 tracking-tight">Tier Privileges Pending</h3>
                  <p className="text-secondary text-sm font-light mb-10 max-w-sm mx-auto">Elevate your architectural status to unlock exclusive procurement vouchers.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {promoCodes.map((promo) => (
                    <div key={promo.id} className="p-10 bg-primary rounded-xl relative overflow-hidden shadow-2xl border border-white/5 group">
                      <div className="absolute -top-10 -right-10 p-4 opacity-5 rotate-12 transition-transform duration-1000 group-hover:rotate-0 pointer-events-none">
                        <span className="material-symbols-outlined text-[180px] font-black text-white">confirmation_number</span>
                      </div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <p className="text-[9px] font-black text-brand-accent uppercase tracking-[0.5em] mb-2 block">{promo.min_privilege || 'STANDARD'} TIER EXCLUSIVE</p>
                              <h3 className="text-4xl font-headline font-black text-white tracking-tighter uppercase">{promo.code}</h3>
                           </div>
                           <div className="bg-white/10 px-4 py-2 rounded font-headline font-black text-[12px] text-brand-accent">
                              {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `₹${promo.discount_value}`} OFF
                           </div>
                        </div>
                        <p className="text-sm text-white/60 font-medium leading-relaxed mb-10 max-w-[250px]">{promo.description || 'Exclusive architectural privilege for matching tier members.'}</p>
                        <div className="flex items-center justify-between">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(promo.code);
                              alert('Voucher Manifest Copied!');
                            }}
                            className="text-white font-headline font-black text-[10px] uppercase tracking-[0.3em] hover:text-brand-accent transition-colors border-b border-white/10 pb-1"
                          >
                            Copy Manifest Code
                          </button>
                          {promo.expiry_date && (
                             <p className="text-[8px] text-white/30 font-bold uppercase tracking-[0.1em]">VALID TILL: {new Date(promo.expiry_date).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
               <div className="flex items-center gap-4 mb-3">
                <div className="w-8 h-[1px] bg-brand-accent"></div>
                <span className="text-brand-accent font-label text-[9px] font-black uppercase tracking-[0.4em]">Preferences</span>
              </div>
              <h2 className="text-4xl font-headline font-black text-primary tracking-tighter mb-12 pb-6 border-b border-outline/5">
                Identity <span className="font-serif italic text-secondary/40 font-light">Settings.</span>
              </h2>
              
              {settingsMessage.text && (
                <div className={`mb-10 p-6 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in duration-700 shadow-xl ${settingsMessage.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-error/10 text-error'}`}>
                  {settingsMessage.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase px-1">Full Signature (Name)</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all" 
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase px-1">Communication Channel (Phone)</label>
                    <input 
                      type="tel" 
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all" 
                      placeholder="+91 00000 00000"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase px-1">Electronic Mail (Protected)</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={displayProfile.email || ''} 
                      disabled 
                      className="w-full bg-background/50 border border-outline/5 opacity-50 rounded-lg p-5 text-sm font-headline font-bold cursor-not-allowed" 
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary opacity-20 text-lg">lock</span>
                  </div>
                  <p className="text-[8px] text-secondary/40 font-black uppercase tracking-[0.3em] px-1 italic">Verified identity cannot be modified.</p>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSavingSettings}
                  className="bg-primary text-white py-6 px-12 rounded-sm font-headline font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all duration-700 shadow-2xl disabled:opacity-50"
                >
                  {isSavingSettings ? 'Archiving Changes...' : 'Save Profile Integrity'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'help' && (
            <div>
               <div className="flex items-center gap-4 mb-3">
                <div className="w-8 h-[1px] bg-brand-accent"></div>
                <span className="text-brand-accent font-label text-[9px] font-black uppercase tracking-[0.4em]">Inquiry</span>
              </div>
              <h2 className="text-4xl font-headline font-black text-primary tracking-tighter mb-12 pb-6 border-b border-outline/5">
                Concierge <span className="font-serif italic text-secondary/40 font-light">Services.</span>
              </h2>
              <div className="space-y-6 max-w-3xl">
                <details className="group border border-outline/5 rounded-xl overflow-hidden bg-background">
                  <summary className="flex justify-between items-center p-8 cursor-pointer font-headline font-black text-[10px] uppercase tracking-[0.3em] select-none text-primary group-hover:text-brand-accent transition-colors">
                    Order Tracking Protocols
                    <span className="material-symbols-outlined transition-transform duration-500 group-open:rotate-180 text-secondary opacity-20">expand_more</span>
                  </summary>
                  <div className="px-8 pb-8 text-sm text-secondary font-light leading-[1.8] animate-in slide-in-from-top-2 duration-500">
                    Track your manifestation status within the "Procurement" portal. Upon dispatch, a specialized tracking reference will be assigned for logisitic transparency.
                  </div>
                </details>
                <details className="group border border-outline/5 rounded-xl overflow-hidden bg-background">
                  <summary className="flex justify-between items-center p-8 cursor-pointer font-headline font-black text-[10px] uppercase tracking-[0.3em] select-none text-primary group-hover:text-brand-accent transition-colors">
                    Reclamation Policy
                    <span className="material-symbols-outlined transition-transform duration-500 group-open:rotate-180 text-secondary opacity-20">expand_more</span>
                  </summary>
                  <div className="px-8 pb-8 text-sm text-secondary font-light leading-[1.8] animate-in slide-in-from-top-2 duration-500">
                    We maintain a rigorous 7-day manifestation integrity policy for CP fittings. Sanitary architecture is eligible for reclamation only in instances of logistic compromise.
                  </div>
                </details>

                <details className="group border border-outline/5 rounded-xl overflow-hidden bg-background" open>
                  <summary className="flex justify-between items-center p-8 cursor-pointer font-headline font-black text-[10px] uppercase tracking-[0.3em] select-none text-primary group-hover:text-brand-accent transition-colors">
                    Cancellation & Refund Protocols
                    <span className="material-symbols-outlined transition-transform duration-500 group-open:rotate-180 text-secondary opacity-20">expand_more</span>
                  </summary>
                  <div className="px-8 pb-8 space-y-6 text-sm text-secondary font-light leading-[1.8] animate-in slide-in-from-top-2 duration-500">
                    <p>At Livo Homes, we understand that architectural visions may evolve. Our cancellation protocols are designed to maintain procurement integrity while providing professional flexibility.</p>
                    <div className="space-y-4">
                      <div className="pl-6 border-l border-brand-accent/20">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Cancellation Window</p>
                        <p>Orders may be suspended within 24 hours of procurement, provided the asset has not entered the "Shipped" state. Once an asset is in transit, cancellation is strictly bound by our reclamation policy.</p>
                      </div>
                      <div className="pl-6 border-l border-brand-accent/20">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Financial Settlements (Refunds)</p>
                        <p>Digital settlements are processed via our secure gateway. Refunds for cancelled procurements are initiated within 48 hours and typically reflected in the original settlement channel within 5-7 business cycles.</p>
                      </div>
                      <div className="pl-6 border-l border-brand-accent/20">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Administrative Fees</p>
                        <p>Standard cancellations incur no administrative leverage. However, custom architectural commissions may be subject to a 10% procurement integrity fee if cancelled after the design freeze.</p>
                      </div>
                    </div>
                  </div>
                </details>
                
                <div className="mt-20 p-12 bg-primary rounded-xl text-center shadow-2xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-brand-accent/5 opacity-40"></div>
                  <div className="relative z-10">
                    <h3 className="font-headline font-black text-white text-2xl mb-4 tracking-tighter">Personalized Concierge</h3>
                    <p className="text-white/40 text-sm font-light mb-12 max-w-sm mx-auto">Our lead consultants are available for architectural guidance Mon-Sat, 9AM-8PM.</p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                      <a href="tel:+919876543210" className="bg-brand-accent text-white px-10 py-4 rounded-sm font-headline font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-primary transition-all duration-700 shadow-2xl flex items-center justify-center gap-3">
                         <span className="material-symbols-outlined text-lg">call</span>
                         Voice Portal
                      </a>
                      <a href="mailto:support@livohomes.com" className="bg-white/5 text-white border border-white/10 px-10 py-4 rounded-sm font-headline font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-primary transition-all duration-700 flex items-center justify-center gap-3 decoration-transparent">
                         <span className="material-symbols-outlined text-lg">mail</span>
                         Electronic Mail
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
