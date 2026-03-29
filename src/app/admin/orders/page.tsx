'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { fetchOrdersAction, updateOrderStatusAction } from './actions';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col gap-8 font-body">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Orders Management</h1>
          <p className="text-secondary mt-1 text-sm font-medium opacity-70 uppercase tracking-widest">Architectural Procurement Log</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold border border-outline-variant/30 text-primary hover:bg-surface-container-low transition-all shadow-sm bg-white text-xs uppercase tracking-widest">
          <span className="material-symbols-outlined text-lg">download</span>
          Export Records
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/30 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20 flex flex-wrap gap-4 bg-surface-container-low/30">
          <div className="relative flex-1 min-w-[250px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-xl">search</span>
            <input 
              type="text" 
              placeholder="Search Order ID, Name or Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl pl-12 pr-4 py-3 text-sm transition-all outline-none" 
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 min-w-[200px] bg-white border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-4 py-3 text-sm font-bold transition-all cursor-pointer appearance-none"
          >
            <option>All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
          <input type="date" className="bg-white border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-4 py-3 text-sm font-bold text-primary cursor-pointer transition-all outline-none" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/20 text-secondary text-[0.65rem] font-bold uppercase tracking-[0.2em]">
                <th className="p-6">Order ID</th>
                <th className="p-6">Customer Details</th>
                <th className="p-6">Date</th>
                <th className="p-6">Valuation & Payment</th>
                <th className="p-6">Process Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                      <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                      <span className="text-xs font-bold uppercase tracking-widest text-secondary">Syncing with Registry...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-secondary font-medium italic">No procurement records found.</td>
                </tr>
              ) : filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="text-sm font-medium hover:bg-primary/[0.02] transition-colors group">
                    <td className="p-6">
                      <span className="font-headline font-bold text-primary">#LIVO-{order.id.toString().slice(-6).toUpperCase()}</span>
                      <div className="text-[10px] text-secondary/50 mt-1 uppercase tracking-tighter">Full ID: {order.id}</div>
                    </td>
                    <td className="p-6">
                      <div className="font-headline font-bold text-primary text-base">{order.customer_name}</div>
                      <div className="text-xs text-secondary mt-1 font-medium">{order.customer_phone}</div>
                      <div className="text-[10px] text-secondary/40 mt-0.5">{order.customer_email}</div>
                    </td>
                    <td className="p-6 text-secondary text-xs font-bold">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { 
                        day: '2-digit', month: 'short', year: 'numeric' 
                      })}
                    </td>
                    <td className="p-6">
                      <div className="font-headline font-bold text-primary text-lg">₹{(order.total_amount ?? 0).toLocaleString()}</div>
                      <div className="text-[10px] text-brand-accent font-bold mt-1 uppercase tracking-widest">
                        {order.payment_method === 'online' ? 'Digital Secure' : 'Settlement on Entry'}
                      </div>
                    </td>
                    <td className="p-6">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`${getStatusColor(order.status)} border-none px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest cursor-pointer hover:brightness-95 transition-all outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-center min-w-[120px]`}
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-6 text-right space-x-4">
                      <button 
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        className="text-primary font-bold text-[10px] uppercase tracking-widest hover:text-brand-accent transition-colors"
                      >
                        {expandedOrderId === order.id ? 'Hide' : 'Details'}
                      </button>
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-500 font-bold text-[10px] uppercase tracking-widest hover:text-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedOrderId === order.id && (
                    <tr className="bg-surface-container-low/20 animate-in fade-in duration-300 border-b border-outline-variant/10">
                      <td colSpan={6} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest border-b border-outline-variant/30 pb-2">Shipping Logistics</h4>
                            <div className="text-sm font-medium text-primary">
                              <p className="font-bold">{order.customer_name}</p>
                              <p className="opacity-70 mt-1">{order.shipping_address}</p>
                              <p className="opacity-70">{order.city}, {order.pincode}</p>
                              <div className="mt-4 pt-4 border-t border-outline-variant/10">
                                <p className="text-[10px] text-secondary">CONTACT</p>
                                <p>{order.customer_phone}</p>
                                <p className="text-xs opacity-60">{order.customer_email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="lg:col-span-2 space-y-4">
                            <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest border-b border-outline-variant/30 pb-2">Itemized Manifest</h4>
                            <div className="space-y-3">
                              {order.order_items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center bg-white/50 p-4 rounded-xl border border-outline-variant/10">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center text-[10px] font-black text-outline-variant italic">LIVO</div>
                                    <div>
                                      <p className="text-sm font-bold text-primary">{item.product_name || `Product: ${item.product_id.slice(0,8)}`}</p>
                                      <p className="text-[10px] text-secondary">SKU: {item.product_id} | Qty: {item.quantity}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    <p className="text-[10px] text-secondary">₹{item.price.toLocaleString()} / unit</p>
                                  </div>
                                </div>
                              ))}
                              <div className="flex justify-between pt-6 mt-4 border-t border-dashed border-outline-variant/30">
                                <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Total Valuation</span>
                                <span className="text-xl font-black text-brand-accent">₹{order.total_amount.toLocaleString()}</span>
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
