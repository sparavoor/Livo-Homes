'use client';

import { useState, useEffect, useMemo } from 'react';
import { createProductAction, deleteProductAction, fetchProductsAction, updateProductAction } from '@/app/admin/products/actions';
import { fetchCategoriesAction } from '@/app/admin/categories/actions';
import { fetchSubcategoriesAction } from '@/app/admin/subcategories/actions';
import { Product, Category, Subcategory } from '@/lib/db';

export default function ProductsControl() {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formSelectedCategory, setFormSelectedCategory] = useState('');
  const [formIsSpecial, setFormIsSpecial] = useState(false);
  const [imagesToKeep, setImagesToKeep] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setPreviewImages([]);
    setImagesToKeep([]);
    
    Promise.all([
      fetchProductsAction(),
      fetchCategoriesAction(),
      fetchSubcategoriesAction()
    ]).then(([productData, categoryData, subData]) => {
      setProducts(productData);
      setCategories(categoryData);
      setSubcategories(subData);
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

  const formFilteredSubcategories = useMemo(() => {
    if (!formSelectedCategory) return [];
    const cat = categories.find(c => c.name === formSelectedCategory);
    if (!cat) return [];
    return subcategories.filter(s => s.categoryId === cat.id);
  }, [formSelectedCategory, categories, subcategories]);

  async function handleSubmit(formData: FormData) {
    try {
      formData.set('existingImages', JSON.stringify(imagesToKeep));
      if (editingProduct) {
        await updateProductAction(editingProduct.id, formData);
      } else {
        await createProductAction(formData);
      }
      setEditingProduct(null);
      setPreviewImages([]);
      setImagesToKeep([]);
      setFormSelectedCategory('');
      setFormIsSpecial(false);
      setActiveTab('list');
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product.');
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setFormSelectedCategory(product.category || '');
    setFormIsSpecial(!!product.isSpecial);
    setImagesToKeep(product.images || [product.image]);
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
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this asset?')) {
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
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-headline font-black text-primary tracking-tight">Inventory Registry</h2>
          <p className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Architectural Asset Management</p>
        </div>
        <div className="flex gap-1 bg-background/50 p-1 rounded-sm border border-outline/5">
          <button 
            onClick={() => setActiveTab('list')} 
            className={`px-6 py-2.5 rounded-sm font-black text-[9px] uppercase tracking-[0.2em] transition-all ${activeTab === 'list' ? 'bg-primary text-white shadow-xl' : 'text-secondary/40 hover:text-primary'}`}
          >
            Catalog
          </button>
          <button 
            onClick={() => { setEditingProduct(null); setImagesToKeep([]); setPreviewImages([]); setFormSelectedCategory(''); setFormIsSpecial(false); setActiveTab('add'); }} 
            className={`px-6 py-2.5 rounded-sm font-black text-[9px] uppercase tracking-[0.2em] transition-all ${activeTab === 'add' ? 'bg-primary text-white shadow-xl' : 'text-secondary/40 hover:text-primary'}`}
          >
            Register Asset
          </button>
        </div>
      </header>

      {activeTab === 'list' ? (
        <div className="bg-white rounded-lg shadow-2xl border border-outline/5 overflow-hidden">
          <div className="p-6 border-b border-outline/5 flex flex-wrap gap-4 bg-background/30">
            <div className="relative flex-1 min-w-[250px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 text-xl">search</span>
              <input 
                type="text" 
                placeholder="Find Asset by Identity or Protocol..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm pl-12 pr-4 py-3 text-xs font-bold transition-all outline-none" 
              />
            </div>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 min-w-[180px] bg-white border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-4 py-3 text-xs font-black uppercase tracking-widest transition-all cursor-pointer appearance-none"
            >
              <option value="">All Collections</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name.toUpperCase()}</option>
              ))}
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-background/50 border-b border-outline/5 text-secondary/40 text-[9px] font-black uppercase tracking-[0.3em]">
                  <th className="px-8 py-5">Asset</th>
                  <th className="px-8 py-5">Identity</th>
                  <th className="px-8 py-5">Segmentation</th>
                  <th className="px-8 py-5">Valuation</th>
                  <th className="px-8 py-5">Inventory</th>
                  <th className="px-8 py-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {isLoading ? (
                  <tr><td colSpan={6} className="p-20 text-center"><div className="animate-pulse flex flex-col items-center gap-4"><div className="w-8 h-8 rounded-full border-2 border-primary/10 border-t-brand-accent animate-spin"></div><span className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/40">Syncing Registry...</span></div></td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan={6} className="p-20 text-center text-secondary/40 font-serif italic text-sm">No assets found in registry.</td></tr>
                ) : filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-background/50 transition-colors duration-500 group">
                    <td className="px-8 py-6">
                      <div className="w-16 h-16 rounded-sm bg-background p-2 shadow-inner border border-outline/5 group-hover:scale-105 transition-transform overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="w-full h-full object-contain mix-blend-multiply" alt={product.name} src={product.image} />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-headline font-black text-primary text-sm uppercase tracking-tight">{product.name}</div>
                      <div className="text-[10px] text-secondary/40 mt-1 font-bold uppercase tracking-widest">SKU: {product.id}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="px-3 py-1 bg-primary/5 text-primary/60 border border-primary/5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] w-fit">
                          {product.isSpecial ? 'Special Product' : (product.category || 'None')}
                        </span>
                        {product.subcategory && (
                          <span className="px-3 py-0.5 bg-brand-accent/5 text-brand-accent/70 border border-brand-accent/10 rounded-full text-[7px] font-black uppercase tracking-[0.2em] w-fit ml-2">
                            {product.subcategory}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 font-headline font-black text-primary text-lg tracking-tighter">₹{product.price.toLocaleString()}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-[0.2em] w-fit inline-block ${product.stock > 10 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {product.stock} Units
                        </span>
                        {product.isSignatureMasterpiece && <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-[0.2em] w-fit border border-amber-100">Signature</span>}
                        {product.isSpecial && <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-[0.2em] w-fit border border-purple-100">Special</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right space-x-4">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="text-primary/40 font-black text-[9px] uppercase tracking-[0.2em] hover:text-brand-accent transition-colors"
                      >
                        Edit
                      </button>
                      <button className="text-red-500/40 font-black text-[9px] uppercase tracking-[0.2em] hover:text-red-600 transition-colors" onClick={() => handleDelete(product.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-2xl border border-outline/5 p-12 max-w-5xl">
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-outline/5">
            <h3 className="text-xl font-headline font-black text-primary tracking-tight">
              {editingProduct ? 'Update Asset Specification' : 'Register Asset Specification'}
            </h3>
          </div>
          <form action={handleSubmit} className="space-y-12" encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="md:col-span-2">
                <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em] mb-4">Asset Identity</label>
                <input name="name" required type="text" defaultValue={editingProduct?.name} placeholder="e.g. Helios Matte Monochrome" className="w-full bg-background border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-5 py-4 text-xs font-bold transition-all outline-none" />
              </div>
              <div>
                <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em] mb-4">
                  Collection Assignment {formIsSpecial ? '(Optional)' : '(Required)'}
                </label>
                <select 
                  name="category" 
                  required={!formIsSpecial} 
                  disabled={formIsSpecial}
                  value={formIsSpecial ? '' : formSelectedCategory}
                  onChange={(e) => setFormSelectedCategory(e.target.value)}
                  className="w-full bg-background border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-5 py-4 text-xs font-black uppercase tracking-widest transition-all outline-none cursor-pointer appearance-none disabled:opacity-50"
                >
                  <option value="">Assign Collection</option>
                  {categories.map((cat: Category) => (
                    <option key={cat.id} value={cat.name}>{cat.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em] mb-4">Segment Specialization</label>
                <select 
                  name="subcategory" 
                  defaultValue={editingProduct?.subcategory || ''}
                  className="w-full bg-background border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-5 py-4 text-xs font-black uppercase tracking-widest transition-all outline-none cursor-pointer appearance-none"
                  disabled={!formSelectedCategory}
                >
                  <option value="">Assign Segment (Optional)</option>
                  {formFilteredSubcategories.map((sub: Subcategory) => (
                    <option key={sub.id} value={sub.name}>{sub.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em] mb-4">Availability Status</label>
                <select name="availability" required defaultValue={editingProduct?.availability || 'In Stock'} className="w-full bg-background border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-5 py-4 text-xs font-black uppercase tracking-widest transition-all outline-none cursor-pointer appearance-none">
                  <option value="In Stock">IN STOCK</option>
                  <option value="Sold Out">SOLD OUT</option>
                </select>
              </div>
              <div>
                <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em] mb-4">Material Integrity</label>
                <input name="material" defaultValue={editingProduct?.material} placeholder="e.g. Lead-free Brass" className="w-full bg-background border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-5 py-4 text-xs font-bold transition-all outline-none" />
              </div>
              <div>
                <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em] mb-4">Color Palette</label>
                <input name="color" defaultValue={editingProduct?.color} placeholder="e.g. Matte Black, Rose Gold" className="w-full bg-background border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-5 py-4 text-xs font-bold transition-all outline-none" />
              </div>
              <div>
                <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em] mb-4">Surface Finish</label>
                <input name="finish" defaultValue={editingProduct?.finish || ''} placeholder="e.g. Brushed, PVD Coated" className="w-full bg-background border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-5 py-4 text-xs font-bold transition-all outline-none" />
              </div>
              <div>
                <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em] mb-4">Dimensional Scale</label>
                <input name="size" defaultValue={editingProduct?.size} placeholder="e.g. 450mm x 320mm" className="w-full bg-background border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-5 py-4 text-xs font-bold transition-all outline-none" />
              </div>
              <div>
                <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em] mb-4">Inventory Register Count</label>
                <input name="stock" required type="number" defaultValue={editingProduct?.stock} placeholder="0" className="w-full bg-background border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-5 py-4 text-xs font-bold transition-all outline-none" />
              </div>
              <div>
                <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em] mb-4">Retail Valuation (₹)</label>
                <input name="price" required type="number" step="0.01" defaultValue={editingProduct?.price} placeholder="0.00" className="w-full bg-background border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-5 py-4 text-xs font-black transition-all outline-none" />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <input 
                  name="isSignatureMasterpiece" 
                  type="checkbox" 
                  id="isSignatureMasterpiece"
                  defaultChecked={editingProduct?.isSignatureMasterpiece}
                  className="w-4 h-4 rounded-sm border-outline/20 text-primary focus:ring-brand-accent/20 transition-all cursor-pointer" 
                />
                <label htmlFor="isSignatureMasterpiece" className="font-black text-primary/60 text-[8px] uppercase tracking-[0.4em] cursor-pointer">Signature Masterpiece Protocol</label>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <input 
                  name="isSpecial" 
                  type="checkbox" 
                  id="isSpecial"
                  checked={formIsSpecial}
                  onChange={(e) => setFormIsSpecial(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-outline/20 text-primary focus:ring-brand-accent/20 transition-all cursor-pointer" 
                />
                <label htmlFor="isSpecial" className="font-black text-primary/60 text-[8px] uppercase tracking-[0.4em] cursor-pointer">Special (Home Page Only)</label>
              </div>
              
              <div className="md:col-span-2 space-y-8">
                <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em] mb-4">Asset Gallery (3-4 High-Res Assets)</label>
                <div className="flex flex-col gap-8 p-10 border-2 border-dashed border-outline/10 rounded-sm bg-background/50 hover:bg-background transition-all group">
                  <input 
                    name="images" 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-[10px] text-secondary font-bold file:mr-6 file:py-3 file:px-8 file:rounded-sm file:border-0 file:text-[9px] file:font-black file:uppercase file:tracking-[0.2em] file:bg-primary file:text-white hover:file:bg-brand-accent transition-all cursor-pointer" 
                  />
                  
                  {(imagesToKeep.length > 0 || previewImages.length > 0) && (
                    <div className="flex flex-wrap gap-6">
                      {imagesToKeep.map((img, i) => (
                        <div key={`existing-${i}`} className="relative group/img w-28 h-28 rounded-sm bg-white border border-outline/5 p-2 shadow-2xl overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`Asset ${i}`} className="w-full h-full object-contain" />
                          <button 
                            type="button"
                            onClick={() => removeExistingImage(img)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      ))}
                      {previewImages.map((blob, i) => (
                        <div key={`preview-${i}`} className="relative group/img w-28 h-28 rounded-sm bg-background border border-brand-accent/20 p-2 shadow-2xl overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={blob} alt={`Preview ${i}`} className="w-full h-full object-contain opacity-60" />
                          <button 
                            type="button"
                            onClick={() => removePreviewImage(i)}
                            className="absolute top-2 right-2 bg-primary text-white p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-4 border-t border-outline/5 pt-8">
                    <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em]">Alternative Master Protocol (URL)</label>
                    <input name="image" type="text" defaultValue={editingProduct?.image} placeholder="https://..." className="w-full bg-white border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-5 py-4 text-xs font-bold transition-all outline-none" />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block font-black text-primary/40 text-[8px] uppercase tracking-[0.4em] mb-4">Architectural Specification & Narrative</label>
                <textarea name="description" required rows={5} defaultValue={editingProduct?.description} placeholder="Description for architects and designers..." className="w-full bg-background border border-outline/5 focus:ring-1 focus:ring-brand-accent/20 focus:border-brand-accent/40 rounded-sm px-5 py-4 text-xs font-medium transition-all outline-none leading-relaxed" />
              </div>
            </div>
            <div className="pt-10 text-right">
              <button type="submit" className="bg-primary text-white px-16 py-6 rounded-sm font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:bg-brand-accent transition-all active:scale-[0.98]">
                {editingProduct ? 'Save Specifications' : 'Publish Asset'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
