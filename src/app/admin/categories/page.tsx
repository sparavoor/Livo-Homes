'use client';

import { useState, useEffect } from 'react';
import { createCategoryAction, deleteCategoryAction, fetchCategoriesAction, updateCategoryAction } from './actions';
import { Category } from '@/lib/db';

export default function AdminCategories() {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Fetch categories on mount and when tab changes to list
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
    if (confirm('Are you sure you want to delete this category? This might affect products using it.')) {
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
    <div className="flex flex-col gap-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight">Category Registry</h2>
          <p className="text-secondary mt-1 text-sm font-medium opacity-70 uppercase tracking-widest">Architectural Collections</p>
        </div>
        <div className="flex gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20 shadow-sm">
          <button 
            onClick={() => setActiveTab('list')} 
            className={`px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white text-primary shadow-md scale-[1.02]' : 'text-secondary hover:text-primary'}`}
          >
            Collections
          </button>
          <button 
            onClick={() => setActiveTab('add')} 
            className={`px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'add' ? 'bg-white text-primary shadow-md scale-[1.02]' : 'text-secondary hover:text-primary'}`}
          >
            Create New
          </button>
        </div>
      </header>

      {activeTab === 'list' ? (
        <div className="bg-white rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/30 overflow-hidden">
          <div className="p-8 border-b border-outline-variant/20 bg-surface-container-low/30">
            <div className="relative max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">search</span>
              <input 
                type="text" 
                placeholder="Find in collections..." 
                className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl pl-12 pr-4 py-3.5 text-sm transition-all" 
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant/20 text-secondary text-[0.65rem] font-bold uppercase tracking-[0.2em]">
                  <th className="p-6">Cover</th>
                  <th className="p-6">Collection Name</th>
                  <th className="p-6">Description</th>
                  <th className="p-6">Product Count</th>
                  <th className="p-6 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-20 text-center"><div className="animate-pulse flex flex-col items-center gap-4"><div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div><span className="text-xs font-bold uppercase tracking-widest text-secondary">Retrieving Collections...</span></div></td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-secondary font-medium italic">No collections currently registered.</td></tr>
                ) : categories.map((category) => (
                  <tr key={category.id} className="text-sm font-medium hover:bg-primary/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="w-20 h-20 rounded-xl bg-surface-container-low p-2 shadow-inner border border-outline-variant/10 group-hover:scale-105 transition-transform">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="w-full h-full object-cover rounded-lg" alt={category.name} src={category.image} />
                      </div>
                    </td>
                    <td className="p-6 text-primary">
                      <div className="font-headline font-bold text-base">{category.name}</div>
                      <div className="text-[10px] text-secondary/60 mt-1 uppercase tracking-tighter">ID: {category.id}</div>
                    </td>
                    <td className="p-6 max-w-xs">
                      <p className="text-secondary text-xs line-clamp-2">{category.description}</p>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-surface-container-low text-secondary border border-outline-variant/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {category.count} Products
                      </span>
                    </td>
                    <td className="p-6 text-right space-x-6">
                      <button 
                        onClick={() => handleEdit(category)}
                        className="text-primary font-bold text-[10px] uppercase tracking-widest hover:text-brand-accent transition-colors"
                      >
                        Edit
                      </button>
                      <button className="text-red-500 font-bold text-[10px] uppercase tracking-widest hover:text-red-700 transition-colors" onClick={() => handleDelete(category.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/30 p-12 max-w-4xl min-h-[500px] flex flex-col">
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-outline-variant/20">
            <h2 className="text-3xl font-headline font-bold text-primary">
              {editingCategory ? 'Update Collection' : 'Establish Collection'}
            </h2>
            {editingCategory && (
              <button 
                onClick={() => { setEditingCategory(null); setActiveTab('list'); }}
                className="text-secondary hover:text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Cancel
              </button>
            )}
          </div>
          <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 flex-1" encType="multipart/form-data">
            <div className="md:col-span-2">
              <label className="block font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em] mb-3">Collection Name</label>
              <input name="name" required type="text" defaultValue={editingCategory?.name} placeholder="e.g. Minimalist Faucets" className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-5 py-4 text-sm font-medium transition-all" />
            </div>
            <div className="md:col-span-2 space-y-4">
              <label className="block font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em] mb-3">Collection Cover (Upload Image)</label>
              <div className="flex flex-col gap-6 p-8 border-2 border-dashed border-outline-variant/50 rounded-2xl bg-surface-container-low/30 hover:bg-surface-container-low/50 transition-all group">
                <input 
                  name="images" 
                  type="file" 
                  accept="image/*"
                  className="w-full text-sm text-secondary file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-primary file:text-white hover:file:bg-brand-accent transition-all cursor-pointer" 
                />
                <p className="text-[10px] text-secondary/60 font-medium">Recommended: 800x800px or larger. PNG, JPG or WebP.</p>
                
                {editingCategory && editingCategory.image && (
                  <div className="pt-4 border-t border-outline-variant/20">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">Current Asset:</p>
                    <div className="w-24 h-24 rounded-lg bg-white border border-outline-variant/20 p-2 shadow-sm overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editingCategory.image} alt="Current Asset" className="w-full h-full object-cover" />
                    </div>
                    <input type="hidden" name="existingImage" value={editingCategory.image} />
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="block font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em]">Or provide a master URL</label>
                  <input name="image" type="text" defaultValue={editingCategory?.image} placeholder="https://..." className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-5 py-4 text-sm font-medium transition-all" />
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em] mb-3">Collection Narrative</label>
              <textarea name="description" required rows={4} defaultValue={editingCategory?.description} placeholder="Describe the essence of this collection..." className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-5 py-4 text-sm font-medium transition-all" />
            </div>
            <div className="md:col-span-2 pt-8 text-right">
              <button type="submit" className="bg-primary text-white px-12 py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.25em] shadow-2xl shadow-primary/30 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 transition-all">
                {editingCategory ? 'Save Changes' : 'Publish Collection'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
