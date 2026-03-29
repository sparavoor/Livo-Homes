'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  fetchBannersAction, 
  addBannerAction, 
  updateBannerAction, 
  deleteBannerAction, 
  toggleBannerStatusAction 
} from './actions';
import { Banner } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [message, setMessage] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    setIsLoading(true);
    const data = await fetchBannersAction();
    setBanners(data);
    setIsLoading(false);
  }

  function openModal(banner: Banner | null = null) {
    if (banner) {
      setEditingBanner(banner);
      setTitle(banner.title);
      setSubtitle(banner.subtitle);
      setImage(banner.image);
      setLink(banner.link);
      setIsActive(banner.isActive);
    } else {
      setEditingBanner(null);
      setTitle('');
      setSubtitle('');
      setImage('');
      setLink('/products');
      setIsActive(true);
    }
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    
    let imageUrl = image;

    // Handle File Upload if selected
    if (fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file);

      if (uploadError) {
        alert('Visual manifest upload failed: ' + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);
      
      imageUrl = publicUrl;
    }

    const bannerData = { title, subtitle, image: imageUrl, link, isActive, order: 0 };
    
    try {
      if (editingBanner) {
        await updateBannerAction(editingBanner.id, bannerData);
      } else {
        await addBannerAction(bannerData);
      }
      setIsModalOpen(false);
      loadBanners();
    } catch (error) {
      console.error('Failed to save banner:', error);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this architectural asset?')) {
      await deleteBannerAction(id);
      loadBanners();
    }
  }

  async function handleToggleStatus(id: string) {
    await toggleBannerStatusAction(id);
    loadBanners();
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-brand-accent"></div>
        <p className="mt-6 text-xs font-headline font-black uppercase tracking-[0.3em] text-secondary/40">Synchronizing Visual Assets...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-outline/5 pb-10">
        <div>
          <h2 className="text-3xl font-headline font-black text-primary tracking-tighter uppercase mb-2">Architectural <span className="font-serif italic text-secondary/40 font-light lowercase">Projections.</span></h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40 italic">Curating the digital entry experience.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-4 px-10 py-5 rounded-sm font-headline font-black text-[10px] uppercase tracking-[0.4em] bg-primary text-white hover:bg-brand-accent transition-all duration-700 shadow-2xl active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
          Add Visual Manifest
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {banners.length === 0 ? (
          <div className="col-span-full py-32 bg-white rounded-2xl border border-dashed border-outline/20 text-center">
             <span className="material-symbols-outlined text-6xl text-secondary/10 mb-6 font-thin">landscape</span>
             <p className="text-sm font-headline font-black uppercase tracking-[0.3em] text-secondary/30">No active projections found.</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-2xl shadow-2xl border border-outline/5 overflow-hidden group hover:border-brand-accent/20 transition-all duration-700">
              <div className="relative h-64 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-6 right-6">
                  <button 
                    onClick={() => handleToggleStatus(banner.id)}
                    className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl transition-all ${banner.isActive ? 'bg-green-500 text-white' : 'bg-primary/40 text-white/50 blur-[0.5px]'}`}
                  >
                    {banner.isActive ? 'Live' : 'Archived'}
                  </button>
                </div>
              </div>
              
              <div className="p-10 space-y-8">
                <div>
                  <h3 className="text-xl font-headline font-black text-primary tracking-tight mb-3 truncate">{banner.title}</h3>
                  <p className="text-secondary text-sm font-light leading-relaxed line-clamp-2">{banner.subtitle}</p>
                </div>
                
                <div className="flex items-center gap-4 py-4 px-5 bg-background rounded-lg border border-outline/5 text-[9px] font-black text-secondary/60 uppercase tracking-widest truncate">
                  <span className="material-symbols-outlined text-sm opacity-40">link</span>
                  {banner.link}
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-outline/5">
                  <button 
                    onClick={() => openModal(banner)}
                    className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:text-brand-accent transition-colors group/btn"
                  >
                    <span className="material-symbols-outlined text-sm opacity-20 group-hover/btn:opacity-100 transition-opacity">edit_square</span>
                    Refine Detail
                  </button>
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-error hover:scale-105 transition-transform"
                  >
                    <span className="material-symbols-outlined text-sm opacity-40">delete_forever</span>
                    Discard
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-primary/40 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-outline/10 animate-in zoom-in-95 duration-700">
            <div className="p-10 border-b border-outline/5 flex justify-between items-center">
              <h3 className="text-2xl font-headline font-black text-primary tracking-tighter uppercase">{editingBanner ? 'Refine Projection' : 'New Visual Entry'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase">Visual Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Architecture for Living" className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all" />
              </div>
              
              <div className="space-y-3">
                <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase">Aesthetic Narrative (Subtitle)</label>
                <textarea required value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={3} placeholder="Describe the essence of this banner..." className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all resize-none" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase">Visual Projection (Image)</label>
                  <div className="flex flex-col gap-4">
                    {image && (
                      <div className="w-full h-32 rounded-lg overflow-hidden border border-outline/10 bg-background mb-2">
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 border-2 border-dashed border-outline/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-secondary/60 hover:border-brand-accent/40 hover:text-brand-accent transition-all flex items-center justify-center gap-3"
                    >
                      <span className="material-symbols-outlined text-lg">upload_file</span>
                      {image ? 'Change Visual Asset' : 'Select Visual Manifest'}
                    </button>
                    <p className="text-[8px] text-secondary/30 italic">Recommended aspect ratio: 21:9 for wide projections.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase">Navigation Gateway (Link)</label>
                  <input required value={link} onChange={e => setLink(e.target.value)} placeholder="/products/..." className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all" />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <input type="checkbox" id="is_active" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-5 h-5 accent-brand-accent rounded cursor-pointer" />
                <label htmlFor="is_active" className="text-[10px] font-black text-secondary tracking-[0.2em] uppercase cursor-pointer">Set as Active Projection</label>
              </div>

              <div className="pt-10 flex gap-6">
                  <button 
                    type="submit"
                    disabled={uploading}
                    className="bg-primary text-white flex-1 py-6 rounded-sm font-headline font-black text-[12px] uppercase tracking-[0.4em] hover:bg-brand-accent transition-all duration-700 active:scale-95 shadow-2xl disabled:opacity-50 flex items-center justify-center gap-4"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Manifesting visual...
                      </>
                    ) : (
                      editingBanner ? 'Archive Changes' : 'Commit to Site'
                    )}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
