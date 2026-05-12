'use client';

import { useState } from 'react';
import OrdersControl from '@/components/admin/OrdersControl';
import InquiriesControl from '@/components/admin/InquiriesControl';

export default function SalesManagementPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'inquiries'>('orders');

  return (
    <div className="min-h-screen bg-background font-body text-primary p-10 lg:p-16">
      <header className="mb-16 pb-10 border-b border-outline/5">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-8 h-[1px] bg-brand-accent"></div>
          <span className="text-brand-accent font-label text-[9px] font-black uppercase tracking-[0.4em]">Sales & Engagement Portal</span>
        </div>
        <h1 className="font-headline text-4xl font-black text-primary tracking-tighter">
          Managerial Control
        </h1>
      </header>

      <div className="space-y-10">
        {/* Tab Selection */}
        <div className="flex gap-1 border-b border-outline/5">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative ${activeTab === 'orders' ? 'text-primary' : 'text-secondary/40 hover:text-primary/60'
              }`}
          >
            Orders
            {activeTab === 'orders' && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-accent"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative ${activeTab === 'inquiries' ? 'text-primary' : 'text-secondary/40 hover:text-primary/60'
              }`}
          >
            Inquiries
            {activeTab === 'inquiries' && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-accent"></div>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'orders' ? <OrdersControl /> : <InquiriesControl />}
        </div>
      </div>
    </div>
  );
}
