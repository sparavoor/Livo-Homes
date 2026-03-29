'use client';

import { useState, useEffect, useMemo } from 'react';
import { createProductAction, deleteProductAction, fetchProductsAction, updateProductAction } from './actions';
import { fetchCategoriesAction } from '../categories/actions';
import { Product, Category } from '@/lib/db';

export default function AdminProducts() {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [imagesToKeep, setImagesToKeep] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Fetch data on mount and when tab changes
  useEffect(() => {
    setIsLoading(true);
    // Reset states when switching tabs or loading
    setPreviewImages([]);
    setImagesToKeep([]);
    
    Promise.all([
      fetchProductsAction(),
      fetchCategoriesAction()
    ]).then(([productData, categoryData]) => {
      setProducts(productData);
      setCategories(categoryData);
      setIsLoading(false);
    });
  }, [activeTab]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toString().toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  async function handleSubmit(formData: FormData) {
    try {
      // Add existing images that we want to keep
      formData.set('existingImages', JSON.stringify(imagesToKeep));
      
      if (editingProduct) {
        await updateProductAction(editingProduct.id, formData);
      } else {
        await createProductAction(formData);
      }
      setEditingProduct(null);
      setPreviewImages([]);
      setImagesToKeep([]);
      setActiveTab('list');
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product.');
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setImagesToKeep(product.images || [product.image]);
    setPreviewImages([]);
    setActiveTab('add');
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  }

  function removeExistingImage(url: string) {
    setImagesToKeep(prev => prev.filter(img => img !== url));
  }

  function removePreviewImage(index: number) {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    // Note: We can't easily remove a single file from the input[type=file] 
    // but the actions.ts will handle it if we just clear all previews 
    // or let it process what's there. 
    // For a truly robust solution, we'd need to manage the FileList.
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProductAction(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product.');
      }
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight">Inventory Control</h2>
          <p className="text-secondary mt-1 text-sm font-medium opacity-70 uppercase tracking-widest">Architectural Registry</p>
        </div>
        <div className="flex gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20 shadow-sm">
          <button 
            onClick={() => setActiveTab('list')} 
            className={`px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white text-primary shadow-md scale-[1.02]' : 'text-secondary hover:text-primary'}`}
          >
            Catalogue
          </button>
          <button 
            onClick={() => { setEditingProduct(null); setImagesToKeep([]); setPreviewImages([]); setActiveTab('add'); }} 
            className={`px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'add' ? 'bg-white text-primary shadow-md scale-[1.02]' : 'text-secondary hover:text-primary'}`}
          >
            Register New
          </button>
        </div>
      </header>

      {activeTab === 'list' ? (
        <div className="bg-white rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/30 overflow-hidden">
          <div className="p-8 border-b border-outline-variant/20 bg-surface-container-low/30 flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-xl">search</span>
              <input 
                type="text" 
                placeholder="Find in registry (Name or ID)..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl pl-12 pr-4 py-3.5 text-sm transition-all" 
              />
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] whitespace-nowrap">Filter By:</span>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-6 py-3.5 text-xs font-bold transition-all cursor-pointer min-w-[180px] appearance-none"
              >
                <option value="">All Collections</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant/20 text-secondary text-[0.65rem] font-bold uppercase tracking-[0.2em]">
                  <th className="p-6">Asset</th>
                  <th className="p-6">Identification</th>
                  <th className="p-6">Collection</th>
                  <th className="p-6">Valuation</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {isLoading ? (
                  <tr><td colSpan={6} className="p-20 text-center"><div className="animate-pulse flex flex-col items-center gap-4"><div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div><span className="text-xs font-bold uppercase tracking-widest text-secondary">Retrieving Registry...</span></div></td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan={6} className="p-20 text-center text-secondary font-medium italic">No assets match your search or filter requirements.</td></tr>
                ) : filteredProducts.map((product) => (
                  <tr key={product.id} className="text-sm font-medium hover:bg-primary/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="w-16 h-16 rounded-xl bg-surface-container-low p-2 shadow-inner border border-outline-variant/10 group-hover:scale-105 transition-transform">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="w-full h-full object-contain mix-blend-multiply" alt={product.name} src={product.image} />
                      </div>
                    </td>
                    <td className="p-6 text-primary">
                      <div className="font-headline font-bold text-base">{product.name}</div>
                      <div className="text-[10px] text-secondary/60 mt-1 uppercase tracking-tighter">ID: {product.id}</div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-surface-container-low text-secondary border border-outline-variant/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-6 font-bold text-primary text-lg">₹{product.price}</td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest w-fit inline-block ${product.stock > 10 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {product.stock} Units
                        </span>
                        {product.isNew && <span className="bg-brand-accent/10 text-brand-accent px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit">New Arrival</span>}
                        {product.isSignatureMasterpiece && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit border border-amber-200">Signature</span>}
                      </div>
                    </td>
                    <td className="p-6 text-right space-x-6">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="text-primary font-bold text-[10px] uppercase tracking-widest hover:text-brand-accent transition-colors"
                      >
                        Edit
                      </button>
                      <button className="text-red-500 font-bold text-[10px] uppercase tracking-widest hover:text-red-700 transition-colors" onClick={() => handleDelete(product.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/30 p-12 max-w-4xl min-h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-outline-variant/20">
            <h2 className="text-3xl font-headline font-bold text-primary">
              {editingProduct ? 'Update Asset' : 'Register Asset'}
            </h2>
            {editingProduct && (
              <button 
                onClick={() => { setEditingProduct(null); setImagesToKeep([]); setPreviewImages([]); setActiveTab('list'); }}
                className="text-secondary hover:text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Cancel
              </button>
            )}
          </div>
          <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 flex-1" encType="multipart/form-data">
            <div className="md:col-span-2">
              <label className="block font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em] mb-3">Product Name</label>
              <input name="name" required type="text" defaultValue={editingProduct?.name} placeholder="e.g. Helios Matte Monochrome" className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-5 py-4 text-sm font-medium transition-all" />
            </div>
            <div>
              <label className="block font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em] mb-3">Collection</label>
              <select name="category" required defaultValue={editingProduct?.category} className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-5 py-4 text-sm font-bold appearance-none transition-all cursor-pointer">
                <option value="">Select Collection</option>
                {categories.map((cat: Category) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em] mb-3">Availability Status</label>
              <select name="availability" required defaultValue={editingProduct?.availability || 'In Stock'} className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-5 py-4 text-sm font-bold appearance-none transition-all cursor-pointer">
                <option value="In Stock">In Stock</option>
                <option value="Sold Out">Sold Out</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em] mb-3">Material</label>
              <input name="material" defaultValue={editingProduct?.material} placeholder="e.g. Lead-free Brass" className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-5 py-4 text-sm font-medium transition-all" />
            </div>
            <div>
              <label className="block font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em] mb-3">Color / Finish</label>
              <input name="color" defaultValue={editingProduct?.color} placeholder="e.g. Obsidian Black" className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-5 py-4 text-sm font-medium transition-all" />
            </div>
            <div>
              <label className="block font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em] mb-3">Physical Size</label>
              <input name="size" defaultValue={editingProduct?.size} placeholder="e.g. 450mm x 320mm" className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-5 py-4 text-sm font-medium transition-all" />
            </div>
            <div>
              <label className="block font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em] mb-3">Inventory Count</label>
              <input name="stock" required type="number" defaultValue={editingProduct?.stock} placeholder="0" className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-5 py-4 text-sm font-medium transition-all" />
            </div>
            <div className="flex items-center gap-4 h-full pt-6">
              <input 
                name="isSignatureMasterpiece" 
                type="checkbox" 
                id="isSignatureMasterpiece"
                defaultChecked={editingProduct?.isSignatureMasterpiece}
                className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all pointer-events-auto cursor-pointer" 
              />
              <label htmlFor="isSignatureMasterpiece" className="font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em] cursor-pointer">Signature Masterpiece</label>
            </div>
            <div>
              <label className="block font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em] mb-3">Retail Price (₹)</label>
              <input name="price" required type="number" step="0.01" defaultValue={editingProduct?.price} placeholder="0.00" className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-5 py-4 text-sm font-bold transition-all" />
            </div>
            <div className="md:col-span-2 space-y-4">
              <label className="block font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em] mb-3">Product Gallery (Upload 3-4 Images)</label>
              <div className="flex flex-col gap-6 p-8 border-2 border-dashed border-outline-variant/50 rounded-2xl bg-surface-container-low/30 hover:bg-surface-container-low/50 transition-all group">
                <input 
                  name="images" 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-secondary file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-primary file:text-white hover:file:bg-brand-accent transition-all cursor-pointer" 
                />
                
                {/* Image Previews & Management */}
                {(imagesToKeep.length > 0 || previewImages.length > 0) && (
                  <div className="flex flex-wrap gap-4 pt-4">
                    {/* Existing Images */}
                    {imagesToKeep.map((img, i) => (
                      <div key={`existing-${i}`} className="relative group/img w-24 h-24 rounded-xl bg-white border border-outline-variant/20 p-2 shadow-sm overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Existing ${i}`} className="w-full h-full object-contain" />
                        <button 
                          type="button"
                          onClick={() => removeExistingImage(img)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                        <div className="absolute bottom-0 left-0 w-full bg-primary/80 py-0.5 px-1">
                          <p className="text-[6px] text-white font-bold uppercase text-center tracking-tighter">Current</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* New Uploads Previews */}
                    {previewImages.map((blob, i) => (
                      <div key={`preview-${i}`} className="relative group/img w-24 h-24 rounded-xl bg-surface-container-low border border-primary/30 p-2 shadow-sm overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={blob} alt={`New Preview ${i}`} className="w-full h-full object-contain opacity-70" />
                        <button 
                          type="button"
                          onClick={() => removePreviewImage(i)}
                          className="absolute top-1 right-1 bg-primary text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                        <div className="absolute bottom-0 left-0 w-full bg-brand-accent/80 py-0.5 px-1">
                          <p className="text-[6px] text-white font-bold uppercase text-center tracking-tighter">New Asset</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-secondary/60 font-medium">Recommended: High-resolution PNG or JPG with transparent/minimal background.</p>
                
                <input type="hidden" name="existingImages" value={JSON.stringify(imagesToKeep)} />
                
                <div className="space-y-2 border-t border-outline-variant/20 pt-6 mt-2">
                  <label className="block font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em]">Or provide a single master URL</label>
                  <input name="image" type="text" defaultValue={editingProduct?.image} placeholder="https://..." className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-5 py-4 text-sm font-medium transition-all" />
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block font-bold text-primary text-[0.65rem] uppercase tracking-[0.2em] mb-3">Architectural Description</label>
              <textarea name="description" required rows={4} defaultValue={editingProduct?.description} placeholder="Description for architects and designers..." className="w-full bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-5 py-4 text-sm font-medium transition-all" />
            </div>
            <div className="md:col-span-2 pt-8 text-right">
              <button type="submit" className="bg-primary text-white px-12 py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.25em] shadow-2xl shadow-primary/30 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 transition-all">
                {editingProduct ? 'Save Changes' : 'Publish Asset'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
