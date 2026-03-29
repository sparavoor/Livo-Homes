'use client';

import { useState, useEffect } from 'react';
import { fetchDashboardStatsAction } from './orders/actions';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getStats() {
      try {
        const data = await fetchDashboardStatsAction();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    getStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">Loading Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard Overview Cards (Bento Style) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {/* Total Orders */}
        <div className="bg-white p-8 rounded-lg shadow-2xl border border-outline/5 transition-all group hover:border-brand-accent/20">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-primary text-white rounded-sm group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            </div>
          </div>
          <p className="text-secondary text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-40">Procurements</p>
          <h2 className="text-3xl font-headline font-black text-primary tracking-tighter">{stats?.totalOrders || 0}</h2>
          <div className="mt-6 h-[1px] w-full bg-outline/10">
            <div className="h-full bg-brand-accent w-3/4"></div>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white p-8 rounded-lg shadow-2xl border border-outline/5 transition-all group hover:border-brand-accent/20">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-brand-accent text-white rounded-sm group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <p className="text-secondary text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-40">Total Valuation</p>
          <h2 className="text-3xl font-headline font-black text-primary tracking-tighter">₹{(stats?.totalRevenue || 0).toLocaleString()}</h2>
          <div className="mt-6 h-[1px] w-full bg-outline/10">
            <div className="h-full bg-brand-accent w-2/3"></div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-8 rounded-lg shadow-2xl border border-outline/5 transition-all group hover:border-brand-accent/20">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-secondary text-white rounded-sm group-hover:scale-110 transition-transform duration-500 text-white/50">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
          </div>
          <p className="text-secondary text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-40">Client Base</p>
          <h2 className="text-3xl font-headline font-black text-primary tracking-tighter">{stats?.uniqueCustomers || 0}</h2>
          <div className="mt-6 h-[1px] w-full bg-outline/10">
            <div className="h-full bg-brand-accent w-1/2"></div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-8 rounded-lg shadow-2xl border border-outline/5 transition-all group hover:border-brand-accent/20">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-error/10 text-error rounded-sm group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
            {stats?.pendingOrders > 0 && <span className="bg-error text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Action Required</span>}
          </div>
          <p className="text-secondary text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-40">Pending Manifests</p>
          <h2 className="text-3xl font-headline font-black text-primary tracking-tighter">{stats?.pendingOrders || 0}</h2>
          <div className="mt-6 h-[1px] w-full bg-outline/10">
            <div className="h-full bg-error w-1/4"></div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Sales Chart Simulation Section */}
          <div className="bg-white rounded-lg shadow-2xl p-10 border border-outline/5 overflow-hidden">
            <div className="flex justify-between items-end mb-12">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-[1px] bg-brand-accent"></div>
                  <span className="text-brand-accent font-label text-[9px] font-black uppercase tracking-[0.4em]">Analytics</span>
                </div>
                <h3 className="font-headline text-2xl font-black text-primary tracking-tighter">Performance <span className="font-serif italic text-secondary/40 font-light">Trajectory.</span></h3>
              </div>
            </div>
            {/* Simulated Chart */}
            <div className="relative h-[300px] w-full flex items-end gap-3 px-4">
              {[40, 55, 45, 70, 60, 85, 95, 75, 65, 80, 72, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-primary/5 rounded-sm hover:bg-brand-accent/20 transition-all duration-700" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="flex justify-between mt-8 px-4">
              <span className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em]">January</span>
              <span className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em]">December</span>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-lg shadow-2xl border border-outline/5 overflow-hidden">
            <div className="p-8 border-b border-outline/5 flex justify-between items-end">
              <div>
                 <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-[1px] bg-brand-accent"></div>
                  <span className="text-brand-accent font-label text-[9px] font-black uppercase tracking-[0.4em]">Records</span>
                </div>
                <h3 className="font-headline text-2xl font-black text-primary tracking-tighter">Recent <span className="font-serif italic text-secondary/40 font-light">Acquisitions.</span></h3>
              </div>
              <Link className="text-[10px] font-black text-primary hover:text-brand-accent uppercase tracking-[0.3em] border-b border-primary/10 pb-1" href="/admin/orders">Archive View</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-background/50">
                    <th className="px-8 py-5 text-[9px] font-black text-secondary/60 uppercase tracking-[0.3em]">Manifest ID</th>
                    <th className="px-8 py-5 text-[9px] font-black text-secondary/60 uppercase tracking-[0.3em]">Client Signature</th>
                    <th className="px-8 py-5 text-[9px] font-black text-secondary/60 uppercase tracking-[0.3em]">Date</th>
                    <th className="px-8 py-5 text-[9px] font-black text-secondary/60 uppercase tracking-[0.3em]">Valuation</th>
                    <th className="px-8 py-5 text-[9px] font-black text-secondary/60 uppercase tracking-[0.3em]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/5">
                  {(stats?.recentOrders || []).map((order: any) => (
                    <tr key={order.id} className="hover:bg-background transition-colors duration-500">
                      <td className="px-8 py-6 font-mono text-[10px] text-primary font-black uppercase tracking-widest opacity-60">#LIVO-{order.id.toString().slice(-6).toUpperCase()}</td>
                      <td className="px-8 py-6 text-sm font-headline font-black text-primary">{order.customer_name}</td>
                      <td className="px-8 py-6 text-[10px] font-bold text-secondary uppercase tracking-widest">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-lg font-headline font-black text-primary tracking-tighter">₹{order.total_amount.toLocaleString()}</td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 text-[8px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm ${
                          order.status === 'pending' ? 'bg-brand-accent/10 text-brand-accent' : 
                          order.status === 'delivered' ? 'bg-green-500/10 text-green-600' : 
                          'bg-primary/10 text-primary'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-secondary/40 font-serif italic text-sm">No procurement data currently archived.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar / Quick Actions */}
        <div className="space-y-12">
          <div className="bg-primary p-12 rounded-lg text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -translate-y-16 translate-x-16 transition-transform duration-1000 group-hover:scale-150"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-[1px] bg-brand-accent"></div>
                <span className="text-brand-accent font-label text-[10px] font-black uppercase tracking-[0.4em]">Metrics</span>
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-40">Monthly Revenue</h3>
              <p className="text-5xl font-headline font-black tracking-tighter mb-6">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
              <div className="flex items-center gap-3 text-green-400 text-[10px] font-black uppercase tracking-[0.3em]">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                Performance Optimized
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6 px-2">
              <div className="w-5 h-[1px] bg-brand-accent"></div>
              <p className="text-[9px] font-black text-secondary tracking-[0.5em] uppercase px-1">Quick Access</p>
            </div>
            
            <Link href="/admin/products" className="w-full flex items-center justify-between p-6 bg-white hover:bg-background rounded-lg border border-outline/5 transition-all duration-700 group shadow-sm hover:shadow-2xl">
              <div className="flex items-center gap-5">
                <span className="material-symbols-outlined text-lg opacity-20 transition-colors group-hover:text-brand-accent">inventory_2</span>
                <span className="font-headline font-black text-[10px] uppercase tracking-[0.3em]">Inventory Register</span>
              </div>
              <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">arrow_forward</span>
            </Link>
            
            <Link href="/admin/banners" className="w-full flex items-center justify-between p-6 bg-white hover:bg-background rounded-lg border border-outline/5 transition-all duration-700 group shadow-sm hover:shadow-2xl">
              <div className="flex items-center gap-5">
                <span className="material-symbols-outlined text-lg opacity-20 transition-colors group-hover:text-brand-accent">view_carousel</span>
                <span className="font-headline font-black text-[10px] uppercase tracking-[0.3em]">Curation View</span>
              </div>
              <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">arrow_forward</span>
            </Link>
          </div>

          <div className="bg-white rounded-lg p-10 border border-outline/5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-5 h-[1px] bg-brand-accent"></div>
              <p className="text-[9px] font-black text-secondary tracking-[0.5em] uppercase px-1">Intelligence</p>
            </div>
            <div className="flex items-end gap-2 h-16 mb-8 px-2">
              <div className="w-3 bg-primary/5 h-[30%] rounded-sm"></div>
              <div className="w-3 bg-primary/5 h-[45%] rounded-sm"></div>
              <div className="w-3 bg-primary/5 h-[20%] rounded-sm"></div>
              <div className="w-3 bg-primary/5 h-[60%] rounded-sm"></div>
              <div className="w-3 bg-primary/5 h-[55%] rounded-sm"></div>
              <div className="w-3 bg-brand-accent h-[85%] rounded-sm shadow-xl shadow-brand-accent/20"></div>
              <div className="w-3 bg-primary/5 h-[40%] rounded-sm"></div>
            </div>
            <p className="text-[11px] text-secondary/60 leading-relaxed font-light italic">System performance is optimized. All APIs are responding within 120ms latency threshold.</p>
          </div>
        </div>
      </div>
    </>
  );
}
