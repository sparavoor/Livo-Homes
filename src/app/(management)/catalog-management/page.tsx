'use client';

import { useState } from 'react';
import CategoriesControl from '@/components/admin/CategoriesControl';
import SubCategoriesControl from '@/components/admin/SubCategoriesControl';
import ProductsControl from '@/components/admin/ProductsControl';

export default function CatalogManagementPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories' | 'products'>('products');

  return (
    <div className="min-h-screen bg-background font-body text-primary p-10 lg:p-16">
      <header className="mb-16 pb-10 border-b border-outline/5">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-8 h-[1px] bg-brand-accent"></div>
          <span className="text-brand-accent font-label text-[9px] font-black uppercase tracking-[0.4em]">Catalog & Inventory Portal</span>
        </div>
        <h1 className="font-headline text-4xl font-black text-primary tracking-tighter">
          Inventory Control
        </h1>
      </header>

      <div className="space-y-10">
        {/* Tab Selection */}
        <div className="flex gap-1 border-b border-outline/5 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative whitespace-nowrap ${activeTab === 'categories' ? 'text-primary' : 'text-secondary/40 hover:text-primary/60'
              }`}
          >
            Category
            {activeTab === 'categories' && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-accent"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('subcategories')}
            className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative whitespace-nowrap ${activeTab === 'subcategories' ? 'text-primary' : 'text-secondary/40 hover:text-primary/60'
              }`}
          >
            Sub-Category
            {activeTab === 'subcategories' && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-accent"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative whitespace-nowrap ${activeTab === 'products' ? 'text-primary' : 'text-secondary/40 hover:text-primary/60'
              }`}
          >
            Products
            {activeTab === 'products' && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-accent"></div>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'products' && <ProductsControl />}
          {activeTab === 'categories' && <CategoriesControl />}
          {activeTab === 'subcategories' && <SubCategoriesControl />}
        </div>
      </div>
    </div>
  );
}
