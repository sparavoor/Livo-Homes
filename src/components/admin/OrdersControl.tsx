'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { fetchOrdersAction, updateOrderStatusAction, fetchOrderItemsAction } from '@/app/admin/orders/actions';

export default function OrdersControl() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, any[]>>({});
  const [isDetailLoading, setIsDetailLoading] = useState<Record<string, boolean>>({});

  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  
  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setIsLoading(true);
    try {
      const data = await fetchOrdersAction();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderId = order.id?.toString() || '';
      const customerName = order.customer_name?.toLowerCase() || '';
      const customerPhone = order.customer_phone || '';
      const orderStatus = order.status || '';

      const matchesSearch = 
        orderId.includes(searchTerm) ||
        customerName.includes(searchTerm.toLowerCase()) ||
        customerPhone.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'All Statuses' || orderStatus === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  async function handleStatusChange(orderId: string, newStatus: string) {
    try {
      await updateOrderStatusAction(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      alert('Failed to update status');
    }
  }

  async function handleCancelOrder(orderId: string) {
    if (!confirm('Are you sure you want to cancel this order? This cannot be undone.')) return;
    await handleStatusChange(orderId, 'cancelled');
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  async function toggleOrderExpansion(orderId: string) {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);
    
    if (!orderItemsMap[orderId]) {
      setIsDetailLoading(prev => ({ ...prev, [orderId]: true }));
      try {
        const items = await fetchOrderItemsAction(orderId);
        setOrderItemsMap(prev => ({ ...prev, [orderId]: items }));
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setIsDetailLoading(prev => ({ ...prev, [orderId]: false }));
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-headline font-black text-primary tracking-tight">Orders Registry</h2>
          <p className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Transaction & Logistics Control</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-sm font-bold border border-outline/5 text-primary hover:bg-background transition-all shadow-sm bg-white text-[10px] uppercase tracking-widest">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Manifests
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-2xl border border-outline/5 overflow-hidden">
        <div className="p-6 border-b border-outline/5 flex flex-wrap gap-4 bg-background/30">
          <div className="relative flex-1 min-w-[250px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 text-xl">search</span>
            <input 
              type="text" 
              placeholder="Search Manifest ID, Identity or Contact..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm pl-12 pr-4 py-3 text-xs font-bold transition-all outline-none" 
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 min-w-[180px] bg-white border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest transition-all cursor-pointer appearance-none"
          >
            <option>All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-background/50 border-b border-outline/5 text-secondary/40 text-[9px] font-black uppercase tracking-[0.3em]">
                <th className="px-8 py-5">Manifest ID</th>
                <th className="px-8 py-5">Client Signature</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Valuation</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                      <div className="w-8 h-8 rounded-full border-2 border-primary/10 border-t-brand-accent animate-spin"></div>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/40">Synchronizing...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-secondary/40 font-serif italic text-sm">No procurement records archived.</td>
                </tr>
              ) : filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="hover:bg-background/50 transition-colors duration-500 group">
                    <td className="px-8 py-6">
                      <span className="font-mono text-[10px] text-primary font-black uppercase tracking-widest opacity-60">#LIVO-{order.id.toString().slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-headline font-black text-primary text-sm uppercase tracking-tight">{order.customer_name}</div>
                      <div className="text-[10px] text-secondary/40 mt-1 font-bold uppercase tracking-widest">{order.customer_phone}</div>
                    </td>
                    <td className="px-8 py-6 text-secondary/60 text-[10px] font-black uppercase tracking-widest">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { 
                        day: '2-digit', month: 'short', year: 'numeric' 
                      })}
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-headline font-black text-primary text-base tracking-tighter">₹{(order.total_amount ?? 0).toLocaleString()}</div>
                      <div className="text-[8px] text-brand-accent font-black mt-1 uppercase tracking-[0.2em]">
                        {order.payment_method === 'online' ? 'Digital Secure' : 'Settlement On Entry'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`${getStatusColor(order.status)} border-none px-4 py-1.5 rounded-full font-black text-[8px] uppercase tracking-[0.2em] cursor-pointer hover:brightness-95 transition-all outline-none appearance-none text-center min-w-[100px] shadow-sm`}
                      >
                        {statuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                      </select>
                    </td>
                    <td className="px-8 py-6 text-right space-x-4">
                      <button 
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="text-primary/40 font-black text-[9px] uppercase tracking-[0.2em] hover:text-brand-accent transition-colors"
                      >
                        {expandedOrderId === order.id ? 'Collapse' : 'Inspect'}
                      </button>
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-500/40 font-black text-[9px] uppercase tracking-[0.2em] hover:text-red-600 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedOrderId === order.id && (
                    <tr className="bg-background/30 border-b border-outline/5">
                      <td colSpan={6} className="px-8 py-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                          <div className="space-y-6">
                            <h4 className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.4em] border-b border-outline/10 pb-3">Shipping Intelligence</h4>
                            <div className="text-[11px] font-bold text-primary space-y-2 uppercase tracking-wider">
                              <p className="text-sm font-black text-brand-accent tracking-tighter">{order.customer_name}</p>
                              <p className="opacity-70 leading-relaxed">{order.shipping_address}</p>
                              <p className="opacity-70">{order.city}, {order.pincode}</p>
                              <div className="mt-6 pt-6 border-t border-outline/5 space-y-1">
                                <p className="text-[8px] text-secondary/40 font-black tracking-[0.3em]">CONTACT PROTOCOL</p>
                                <p>{order.customer_phone}</p>
                                <p className="opacity-60">{order.customer_email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="lg:col-span-2 space-y-6">
                            <h4 className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.4em] border-b border-outline/10 pb-3">Itemized Manifest</h4>
                            <div className="space-y-3">
                              {isDetailLoading[order.id] ? (
                                <div className="p-8 text-center text-[9px] font-black text-secondary/40 animate-pulse uppercase tracking-[0.3em]">Retrieving Logistics...</div>
                              ) : (orderItemsMap[order.id] || []).map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center bg-white p-4 border border-outline/5 rounded-sm shadow-sm group hover:border-brand-accent/20 transition-all">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/5 rounded-sm flex items-center justify-center text-[8px] font-black text-secondary/20 italic group-hover:bg-brand-accent/5 group-hover:text-brand-accent/20 transition-colors">LIVO</div>
                                    <div>
                                      <p className="text-[11px] font-black text-primary uppercase tracking-tight">{item.product_name || `UNIT-${item.product_id.slice(0,8).toUpperCase()}`}</p>
                                      <p className="text-[8px] text-secondary/40 font-bold uppercase tracking-[0.2em] mt-1">ID: {item.product_id} | QTY: {item.quantity}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-black text-primary tracking-tighter">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    <p className="text-[8px] text-secondary/40 font-bold uppercase tracking-widest mt-1">₹{item.price.toLocaleString()} / UNIT</p>
                                  </div>
                                </div>
                              ))}
                              <div className="flex justify-between items-end pt-8 mt-4 border-t border-dashed border-outline/10">
                                <span className="text-[10px] font-black text-secondary uppercase tracking-[0.4em]">Total Valuation</span>
                                <span className="text-3xl font-headline font-black text-primary tracking-tighter">₹{order.total_amount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
