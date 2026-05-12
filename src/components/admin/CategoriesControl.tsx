'use client';

import { useState, useEffect } from 'react';
import { createCategoryAction, deleteCategoryAction, fetchCategoriesAction, updateCategoryAction } from '@/app/admin/categories/actions';
import { Category } from '@/lib/db';

export default function CategoriesControl() {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (activeTab === 'list') {
      setIsLoading(true);
      fetchCategoriesAction().then((data) => {
        setCategories(data);
        setIsLoading(false);
      });
    }
  }, [activeTab]);

  async function handleSubmit(formData: FormData) {
    try {
      if (editingCategory) {
        await updateCategoryAction(editingCategory.id, formData);
      } else {
        await createCategoryAction(formData);
      }
      setEditingCategory(null);
      setActiveTab('list');
    } catch (error: any) {
      console.error('Failed to save category:', error);
      alert(error.message || 'Failed to save category.');
    }
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setActiveTab('add');
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this collection? This might affect products using it.')) {
      try {
        await deleteCategoryAction(id);
        setCategories(categories.filter(c => c.id !== id));
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category.');
      }
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-headline font-black text-primary tracking-tight">Category Registry</h2>
          <p className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Architectural Collections</p>
        </div>
        <div className="flex gap-1 bg-background/50 p-1 rounded-sm border border-outline/5">
          <button 
            onClick={() => setActiveTab('list')} 
            className={`px-6 py-2.5 rounded-sm font-black text-[9px] uppercase tracking-[0.2em] transition-all ${activeTab === 'list' ? 'bg-primary text-white shadow-xl' : 'text-secondary/40 hover:text-primary'}`}
          >
            Collections
          </button>
          <button 
            onClick={() => { setEditingCategory(null); setActiveTab('add'); }} 
            className={`px-6 py-2.5 rounded-sm font-black text-[9px] uppercase tracking-[0.2em] transition-all ${activeTab === 'add' ? 'bg-primary text-white shadow-xl' : 'text-secondary/40 hover:text-primary'}`}
          >
            Create New
          </button>
        </div>
      </header>

      {activeTab === 'list' ? (
        <div className="bg-white rounded-lg shadow-2xl border border-outline/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-background/50 border-b border-outline/5 text-secondary/40 text-[9px] font-black uppercase tracking-[0.3em]">
                  <th className="px-8 py-5">Asset</th>
                  <th className="px-8 py-5">Collection Identity</th>
                  <th className="px-8 py-5">Manifest Narrative</th>
                  <th className="px-8 py-5">Unit Count</th>
                  <th className="px-8 py-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-20 text-center"><div className="animate-pulse flex flex-col items-center gap-4"><div className="w-8 h-8 rounded-full border-2 border-primary/10 border-t-brand-accent animate-spin"></div><span className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/40">Synchronizing...</span></div></td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-secondary/40 font-serif italic text-sm">No collections currently registered.</td></tr>
                ) : categories.map((category) => (
                  <tr key={category.id} className="hover:bg-background/50 transition-colors duration-500 group">
                    <td className="px-8 py-6">
                      <div className="w-16 h-16 rounded-sm bg-background p-2 shadow-inner border border-outline/5 group-hover:scale-105 transition-transform overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="w-full h-full object-cover" alt={category.name} src={category.image} />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-headline font-black text-primary text-sm uppercase tracking-tight">{category.name}</div>
                      <div className="text-[10px] text-secondary/40 mt-1 font-bold uppercase tracking-widest">ID: {category.id}</div>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                      <p className="text-secondary/60 text-[11px] font-medium leading-relaxed line-clamp-2 uppercase tracking-wide">{category.description}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1 bg-primary/5 text-primary/60 border border-primary/5 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">
                        {category.count} Units
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right space-x-6">
                      <button 
                        onClick={() => handleEdit(category)}
                        className="text-primary/40 font-black text-[9px] uppercase tracking-[0.2em] hover:text-brand-accent transition-colors"
                      >
                        Edit
                      </button>
                      <button className="text-red-500/40 font-black text-[9px] uppercase tracking-[0.2em] hover:text-red-600 transition-colors" onClick={() => handleDelete(category.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-2xl border border-outline/5 p-12 max-w-4xl">
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-outline/5">
            <h3 className="text-xl font-headline font-black text-primary tracking-tight">
              {editingCategory ? 'Update Collection' : 'Register Collection'}
            </h3>
          </div>
          <form action={handleSubmit} className="space-y-10" encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="md:col-span-2">
                <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em] mb-4">Collection Identity</label>
                <input name="name" required type="text" defaultValue={editingCategory?.name} placeholder="e.g. Minimalist Faucets" className="w-full bg-background border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-5 py-4 text-xs font-bold transition-all outline-none" />
              </div>
              <div className="md:col-span-2 space-y-6">
                <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em] mb-4">Collection Asset (Cover Image)</label>
                <div className="flex flex-col gap-6 p-10 border-2 border-dashed border-outline/10 rounded-sm bg-background/50 hover:bg-background transition-all group">
                  <input 
                    name="images" 
                    type="file" 
                    accept="image/*"
                    className="w-full text-[10px] text-secondary font-bold file:mr-6 file:py-3 file:px-8 file:rounded-sm file:border-0 file:text-[9px] file:font-black file:uppercase file:tracking-[0.2em] file:bg-primary file:text-white hover:file:bg-brand-accent transition-all cursor-pointer" 
                  />
                  
                  {editingCategory && editingCategory.image && (
                    <div className="pt-6 border-t border-outline/5">
                      <p className="text-[8px] font-black text-primary/40 uppercase tracking-[0.4em] mb-4">Active Asset:</p>
                      <div className="w-24 h-24 rounded-sm bg-white border border-outline/10 p-2 shadow-2xl overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={editingCategory.image} alt="Current Asset" className="w-full h-full object-cover" />
                      </div>
                      <input type="hidden" name="existingImage" value={editingCategory.image} />
                    </div>
                  )}
                  
                  <div className="space-y-4 pt-4">
                    <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em]">Alternative Asset Protocol (URL)</label>
                    <input name="image" type="text" defaultValue={editingCategory?.image} placeholder="https://..." className="w-full bg-white border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-5 py-4 text-xs font-bold transition-all outline-none" />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em] mb-4">Collection Narrative</label>
                <textarea name="description" required rows={4} defaultValue={editingCategory?.description} placeholder="Describe the essence of this collection..." className="w-full bg-background border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-5 py-4 text-xs font-medium transition-all outline-none leading-relaxed" />
              </div>
            </div>
            <div className="pt-10 text-right">
              <button type="submit" className="bg-primary text-white px-12 py-6 rounded-sm font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:bg-brand-accent transition-all active:scale-[0.98]">
                {editingCategory ? 'Update Records' : 'Publish Collection'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
