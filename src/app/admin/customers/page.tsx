'use client';

import { useState, useEffect } from 'react';
import { fetchCustomersWithStatsAction, updateUserPrivilegeAction, fetchCustomerOrdersAction } from './actions';
import { Profile } from '@/context/auth-context';

interface CustomerWithStats extends Profile {
  orderCount: number;
  totalSpent: number;
  isRegistered: boolean;
  lastActive: string;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [viewMode, setViewMode] = useState<'profile' | 'orders'>('profile');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCustomersWithStatsAction();
      setCustomers(data as CustomerWithStats[]);
    } catch (error: any) {
      console.error('Error fetching customers:', error.message || error);
      setError(error.message || 'An unexpected error occurred while retrieving the client registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrders = async (customer: CustomerWithStats) => {
    setLoadingOrders(true);
    setViewMode('orders');
    try {
      const contact = customer.isRegistered 
        ? { userId: customer.id, email: customer.email }
        : { email: customer.email };
      const orders = await fetchCustomerOrdersAction(contact);
      setCustomerOrders(orders);
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  return (
    <div className="flex flex-col gap-10 font-body">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight">Customer Registry</h2>
          <p className="text-secondary mt-1 text-sm font-medium opacity-70 uppercase tracking-widest">Architectural Client Relations</p>
        </div>
      </header>
      
      <div className="bg-white rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/30 overflow-hidden">
        <div className="p-8 border-b border-outline-variant/20 bg-surface-container-low/30 flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-xl">search</span>
            <input 
              type="text" 
              placeholder="Search registry (Name, Email or Phone)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl pl-12 pr-4 py-3.5 text-sm transition-all outline-none" 
            />
          </div>
          
          <div className="flex items-center gap-4 text-xs font-bold text-secondary uppercase tracking-widest">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-lg border border-primary/20">{filteredCustomers.length} Total Members</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-24 text-center">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">Retrieving Client Records...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-20 text-center flex flex-col items-center gap-6">
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">error</span>
              </div>
              <div>
                <h3 className="text-xl font-headline font-bold text-primary mb-2">Registry Connection Failed</h3>
                <p className="text-secondary text-sm max-w-md mx-auto">{error}</p>
              </div>
              <button 
                onClick={fetchCustomers}
                className="bg-primary text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                Attempt Re-Sync
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant/20 text-secondary text-[0.65rem] font-bold uppercase tracking-[0.2em]">
                  <th className="p-6">Client Identity</th>
                  <th className="p-6">Contact Channels</th>
                  <th className="p-6">Procurement Stats</th>
                  <th className="p-6">Privilege Tier</th>
                  <th className="p-6 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="text-sm font-medium hover:bg-primary/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-surface-container-low text-primary rounded-full flex items-center justify-center font-headline font-black text-xs overflow-hidden shadow-inner border border-outline-variant/20 relative">
                          {customer.avatar_url ? (
                            <img src={customer.avatar_url} alt={customer.full_name || ''} className="w-full h-full object-cover" />
                          ) : (
                            (customer.full_name || 'U').charAt(0).toUpperCase()
                          )}
                          {!customer.isRegistered && (
                            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="text-[8px] font-black text-white uppercase tracking-tighter">Guest</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-headline font-bold text-primary text-base flex items-center gap-2">
                            {customer.full_name || 'Anonymous Client'}
                            {customer.isRegistered ? (
                              <span className="material-symbols-outlined text-brand-accent text-sm" title="Registered Member">verified</span>
                            ) : (
                              <span className="text-[8px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded uppercase tracking-widest font-black">Guest</span>
                            )}
                          </div>
                          <div className="text-[10px] text-secondary/60 mt-0.5 uppercase tracking-tighter">
                            Last Active: {new Date(customer.lastActive).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-primary font-bold">{customer.email || '—'}</div>
                      {customer.phone && <div className="text-[10px] text-secondary mt-1 font-bold tracking-widest uppercase">{customer.phone}</div>}
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-primary font-black text-lg">₹{customer.totalSpent.toLocaleString()}</span>
                        <span className="bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border border-brand-accent/20">
                          {customer.orderCount} Procurements
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      {customer.isRegistered ? (
                        <select 
                          value={customer.privilege_tier || 'standard'}
                          onChange={async (e) => {
                            const newTier = e.target.value;
                            try {
                              await updateUserPrivilegeAction(customer.id, newTier);
                              fetchCustomers();
                            } catch (err: any) {
                              alert(err.message || 'Failed to update tier');
                            }
                          }}
                          className="bg-surface-container-low border-none rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer hover:bg-surface-container-high transition-all"
                        >
                          <option value="standard">Standard</option>
                          <option value="silver">Silver</option>
                          <option value="gold">Gold</option>
                          <option value="platinum">Platinum</option>
                        </select>
                      ) : (
                        <span className="text-[9px] text-secondary/40 font-black uppercase tracking-widest italic">Unavailable for Guest</span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setViewMode('profile');
                        }}
                        className="bg-primary text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                      >
                        Detailed Profile
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-secondary font-medium italic">No client records match your search criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="relative h-32 bg-primary flex-shrink-0">
              <div className="absolute -bottom-16 left-10">
                <div className="w-32 h-32 rounded-[2rem] bg-white p-2 shadow-2xl">
                  <div className="w-full h-full bg-surface-container-low rounded-[1.5rem] overflow-hidden border-4 border-white flex items-center justify-center font-headline font-black text-4xl text-primary relative">
                    {selectedCustomer.avatar_url ? (
                      <img src={selectedCustomer.avatar_url} alt={selectedCustomer.full_name || ''} className="w-full h-full object-cover" />
                    ) : (
                      (selectedCustomer.full_name || 'U').charAt(0).toUpperCase()
                    )}
                    {!selectedCustomer.isRegistered && (
                      <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-xs font-black text-white uppercase tracking-tighter">Guest</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="pt-20 p-10 overflow-y-auto custom-scrollbar">
              {viewMode === 'profile' ? (
                <>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-3xl font-headline font-black text-primary">{selectedCustomer.full_name || 'Anonymous Client'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-0.5 ${selectedCustomer.isRegistered ? 'bg-brand-accent' : 'bg-secondary/40'} text-white text-[9px] font-black uppercase tracking-widest rounded-full`}>
                          {selectedCustomer.isRegistered ? `${(selectedCustomer.privilege_tier || 'Standard').toUpperCase()} TIER` : 'GUEST ACCESS'}
                        </span>
                        <span className="text-secondary text-[10px] font-bold uppercase tracking-widest opacity-60">
                          {selectedCustomer.isRegistered ? `ID: ${selectedCustomer.id.slice(0, 12)}...` : 'Unregistered Record'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-headline font-black text-primary">₹{selectedCustomer.totalSpent.toLocaleString()}</div>
                      <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mt-1">Total Lifetime Valuation</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
                      <div className="text-[10px] font-black text-secondary uppercase tracking-widest mb-3 opacity-60 flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs">mail</span> Contact Logistics
                      </div>
                      <p className="text-sm font-bold text-primary truncate">{selectedCustomer.email || '—'}</p>
                      <p className="text-xs font-bold text-secondary mt-1">{selectedCustomer.phone || 'No phone record'}</p>
                    </div>
                    <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
                      <div className="text-[10px] font-black text-secondary uppercase tracking-widest mb-3 opacity-60 flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs">shopping_bag</span> Procurement Stats
                      </div>
                      <p className="text-sm font-bold text-primary">{selectedCustomer.orderCount} Orders Logged</p>
                      <p className="text-xs font-bold text-brand-accent mt-1">
                        {selectedCustomer.isRegistered ? 'Verified Account' : 'Guest Purchase Record'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest border-b border-outline-variant/30 pb-3 mb-4">Registry Details</h4>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-secondary font-medium">Last Interaction</span>
                      <span className="text-primary font-bold">{new Date(selectedCustomer.lastActive).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-secondary font-medium">Administrative Status</span>
                      <span className={`px-3 py-1 ${selectedCustomer.isRegistered ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'} text-[10px] font-black rounded-full uppercase tracking-widest border`}>
                        {selectedCustomer.isRegistered ? 'Registered Member' : 'Anonymous Guest'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-12 flex gap-4">
                    <button 
                      onClick={() => handleViewOrders(selectedCustomer)}
                      className="flex-1 bg-surface-container-high text-primary py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-surface-container-highest transition-all border border-outline-variant/20 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">history</span>
                      View Order History
                    </button>
                    <button 
                      onClick={() => setSelectedCustomer(null)}
                      className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                    >
                      Close Profile
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between border-b border-outline-variant/30 pb-6">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setViewMode('profile')}
                        className="w-10 h-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center hover:bg-surface-container-high transition-all"
                      >
                        <span className="material-symbols-outlined">arrow_back</span>
                      </button>
                      <h3 className="text-2xl font-headline font-black text-primary">Procurement History</h3>
                    </div>
                    <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{customerOrders.length} Records Found</span>
                  </div>

                  {loadingOrders ? (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                      <div className="w-10 h-10 rounded-full border-2 border-primary/10 border-t-primary animate-spin"></div>
                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Retrieving Manifests...</p>
                    </div>
                  ) : customerOrders.length > 0 ? (
                    <div className="space-y-4">
                      {customerOrders.map(order => (
                        <div key={order.id} className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 hover:border-brand-accent/30 transition-all group">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="text-xs font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
                                #LIVO-{order.id.slice(-6).toUpperCase()}
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                                  order.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                  'bg-primary/5 text-primary/60'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-secondary font-bold uppercase tracking-tighter opacity-60">
                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-headline font-black text-primary">₹{order.total_amount.toLocaleString()}</p>
                              <p className="text-[9px] text-brand-accent font-black uppercase tracking-widest">{order.payment_method}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {(order.order_items || []).slice(0, 3).map((item: any, idx: number) => (
                              <div key={idx} className="bg-surface-container-low px-3 py-1.5 rounded-lg flex items-center gap-2 border border-outline-variant/10">
                                <div className="w-4 h-4 bg-primary/10 rounded flex items-center justify-center text-[8px] font-black text-primary">
                                  {item.quantity}
                                </div>
                                <span className="text-[10px] font-bold text-secondary max-w-[120px] truncate">{item.product_name}</span>
                              </div>
                            ))}
                            {order.order_items?.length > 3 && (
                              <div className="text-[10px] font-black text-secondary/40 flex items-center px-2">
                                + {order.order_items.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-4 bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/50">
                      <span className="material-symbols-outlined text-4xl text-outline-variant">inbox</span>
                      <p className="text-sm font-bold text-secondary italic opacity-60">No procurement records found in the archive.</p>
                    </div>
                  )}

                  <div className="pt-6 border-t border-outline-variant/30">
                    <button 
                      onClick={() => setViewMode('profile')}
                      className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                    >
                      Back to Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
