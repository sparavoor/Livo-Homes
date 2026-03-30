'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserOrders } from '@/lib/orders';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      setEditedName(profile?.full_name || '');
    }
  }, [user, profile]);

  const fetchOrders = async () => {
    if (!user) return;
    setIsOrdersLoading(true);
    try {
      const userOrders = await getUserOrders(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editedName.trim()) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editedName.trim(), updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      setIsEditing(false);
    } catch (error: any) {
      alert(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading || (!user && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">Securing Session...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-background min-h-screen pt-40 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-8 h-[1px] bg-brand-accent"></div>
              <span className="text-brand-accent font-black text-[9px] uppercase tracking-[0.4em]">Proprietor Profile</span>
            </div>
            
            <div className="flex items-end gap-6 pb-8 border-b border-outline/5">
              <div className="w-24 h-24 bg-primary text-white flex items-center justify-center font-headline font-black text-3xl overflow-hidden shadow-2xl relative group">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-full h-full object-cover" />
                ) : (
                  (profile?.full_name || 'U').charAt(0).toUpperCase()
                )}
                <div className="absolute inset-0 bg-brand-accent/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                   <span className="material-symbols-outlined text-white text-xl">edit</span>
                </div>
              </div>
              <div>
                <h1 className="font-headline text-3xl font-black text-primary tracking-tighter leading-none mb-1">
                  {profile?.full_name || 'Anonymous Registry'}
                </h1>
                <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em]">
                   {profile?.privilege_tier || 'Standard'} Member
                </p>
              </div>
            </div>

            <div className="space-y-8 py-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-secondary/30 uppercase tracking-[0.4em]">Identity Manifest</label>
                <p className="text-sm font-bold text-primary">{profile?.email || 'No email recorded'}</p>
                <p className="text-sm font-bold text-primary">{profile?.phone || 'No communications channel'}</p>
              </div>
              
              <div className="space-y-4 pt-4">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent hover:opacity-70 transition-opacity flex items-center gap-2"
                  >
                    Modify Credentials <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-4 bg-surface-container-low p-6 border border-outline/5">
                    <input 
                      className="w-full bg-white border border-outline/10 p-3 text-sm font-bold focus:border-brand-accent outline-none"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="New Display Name"
                    />
                    <div className="flex gap-4">
                      <button 
                        type="submit" 
                        disabled={isUpdating}
                        className="text-[9px] font-black uppercase tracking-[0.2em] bg-primary text-white px-4 py-2 hover:bg-brand-accent transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? 'Saving...' : 'Update'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(false)}
                        className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary hover:text-primary transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                
                {profile?.is_admin && (
                   <Link 
                    href="/admin"
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:text-brand-accent transition-colors flex items-center gap-2 border-t border-outline/5 pt-4"
                  >
                    Executive Portal <span className="material-symbols-outlined text-xs">admin_panel_settings</span>
                  </Link>
                )}

                <button 
                  onClick={handleLogout}
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-error/60 hover:text-error transition-colors flex items-center gap-2 border-t border-outline/5 pt-4 w-full"
                >
                  Terminate Session <span className="material-symbols-outlined text-xs">logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-headline text-3xl font-black text-primary tracking-tighter">Procurement History</h2>
              <div className="h-[1px] flex-1 mx-8 bg-outline/5 hidden md:block"></div>
              <span className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.4em]">{orders.length} Records</span>
            </div>

            {isOrdersLoading ? (
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="h-40 bg-surface-container-low animate-pulse border border-outline/5"></div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-20 border border-outline/5 text-center space-y-8">
                 <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-secondary/30 text-3xl">contract_edit</span>
                 </div>
                 <div className="space-y-4">
                  <h3 className="font-headline text-xl font-black text-primary uppercase tracking-widest">Manifest is Empty</h3>
                  <p className="text-sm font-medium text-secondary/50 max-w-xs mx-auto leading-relaxed">Your architectural journey has no recorded acquisitions. Explore our collections to begin.</p>
                 </div>
                 <Link href="/products" className="inline-block bg-primary text-white text-[10px] font-black uppercase tracking-[0.4em] px-10 py-5 hover:bg-brand-accent transition-all duration-700 active:scale-95">Browse Collection</Link>
              </div>
            ) : (
              <div className="space-y-8">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="group bg-white border border-outline/5 p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-outline/10 group-hover:bg-brand-accent transition-colors duration-700"></div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.4em]">#LIVO-{order.id.slice(-6).toUpperCase()}</span>
                          <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 border ${
                            order.status === 'delivered' ? 'border-success text-success bg-success/5' : 
                            order.status === 'cancelled' ? 'border-error text-error bg-error/5' : 
                            'border-brand-accent text-brand-accent bg-brand-accent/5'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <h3 className="font-headline text-lg font-black text-primary tracking-tight">₹{order.total_amount.toLocaleString()}</h3>
                        <p className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.2em]">
                          Authenticated on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {order.order_items?.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="w-12 h-12 bg-surface-container-high border border-outline/10 rounded-sm flex items-center justify-center text-[8px] font-black text-secondary/20 italic">
                             IMAGE
                          </div>
                        ))}
                        {order.order_items?.length > 3 && (
                          <div className="w-12 h-12 flex items-center justify-center text-[10px] font-black text-secondary/30">
                            +{order.order_items.length - 3}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 md:pt-0">
                        <button className="text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:text-brand-accent transition-colors flex items-center gap-2">
                          View Details <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
