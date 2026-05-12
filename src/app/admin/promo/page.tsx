'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createPromoCodeAction, 
  deletePromoCodeAction, 
  deactivatePromoCodeAction, 
  fetchPromoCodesAction 
} from './actions';
import { motion, AnimatePresence } from 'framer-motion';

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number;
  current_uses: number;
  expiry_date: string | null;
  min_privilege: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export default function AdminPromo() {
  const router = useRouter();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    max_uses: 0,
    expiry_date: '',
    min_privilege: 'standard',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPromoCodesAction();
      setPromoCodes(data || []);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to fetch promo codes' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await createPromoCodeAction(formData);
      setMessage({ type: 'success', text: 'Voucher issued successfully!' });
      setIsModalOpen(false);
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        max_uses: 0,
        expiry_date: '',
        min_privilege: 'standard',
      });
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create promo code' });
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this voucher? This cannot be undone.')) return;
    try {
      await deactivatePromoCodeAction(id);
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to deactivate' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('This action will permanently purge the manifest record. Are you sure?')) return;
    try {
      await deletePromoCodeAction(id);
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete' });
    }
  };

  return (
    <div className="flex flex-col gap-10 p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-outline-variant/10 pb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-8 h-[1px] bg-brand-accent"></div>
            <span className="text-brand-accent font-label text-[9px] font-black uppercase tracking-[0.4em]">Rewards Management</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-on-surface tracking-tighter uppercase">
            Promo <span className="font-serif italic text-primary/40 font-light">Inventory.</span>
          </h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-4 px-10 py-5 rounded-sm font-headline font-black text-[10px] uppercase tracking-[0.3em] bg-primary text-white hover:bg-brand-accent transition-all duration-700 shadow-2xl hover:scale-[1.02] active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Issue New Voucher
        </button>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-xl ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}
        >
          {message.text}
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="w-12 h-12 border-2 border-primary/10 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] animate-pulse font-headline">Manifesting Records...</p>
        </div>
      ) : promoCodes.length === 0 ? (
        <div className="text-center py-40 bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant/30">
          <span className="material-symbols-outlined text-7xl text-primary/10 mb-8 font-light">confirmation_number</span>
          <h3 className="text-2xl font-headline font-black text-on-surface mb-2 tracking-tight uppercase">Voucher Archives Empty</h3>
          <p className="text-secondary text-sm font-light mb-12 max-w-sm mx-auto">No architectural privileges have been issued yet. Start by generating your first manifest.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-12 py-5 rounded-sm font-headline font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all duration-700 shadow-2xl"
          >
            Generate First Privilege
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promoCodes.map((promo) => (
            <motion.div 
              layout
              key={promo.id} 
              className="bg-white group rounded-xl shadow-sm border border-outline-variant/10 p-10 relative overflow-hidden hover:shadow-2xl hover:border-brand-accent/20 transition-all duration-700 hover:-translate-y-2"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-1000 -z-0"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-brand-accent uppercase tracking-[0.5em] mb-3">Privilege ID</span>
                  <span className="font-headline font-black text-3xl text-primary tracking-tighter border-2 border-primary/20 border-dashed px-5 py-3 rounded-lg bg-background/50 uppercase">
                    {promo.code}
                  </span>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${promo.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500/20 text-red-600'}`}>
                  {promo.status}
                </span>
              </div>
              
              <h3 className="text-lg font-headline font-bold text-on-surface mb-2 relative z-10 leading-snug uppercase tracking-tight">
                {promo.description || 'Generic Procurement Perk'}
              </h3>
              
              <div className="flex gap-4 mb-8 relative z-10">
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.1em]">
                  VALUE: <span className="text-on-surface">{promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `₹${promo.discount_value} OFF`}</span>
                </p>
              </div>

              <div className="space-y-4 mb-10 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[16px] text-primary/40">military_tech</span>
                  <p className="text-[10px] text-brand-accent font-black uppercase tracking-[0.2em]">
                    TIER: {promo.min_privilege || 'STANDARD'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[16px] text-primary/40">event</span>
                  <p className="text-[10px] text-secondary/60 font-bold uppercase tracking-[0.1em]">
                     VALID UNTIL: {promo.expiry_date ? new Date(promo.expiry_date).toLocaleDateString() : 'PERPETUAL'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[16px] text-primary/40">groups</span>
                  <p className="text-[10px] text-secondary/60 font-bold uppercase tracking-[0.1em]">
                    PROCUREMENT COUNT: {promo.current_uses} / {promo.max_uses || '∞'}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-outline-variant/10 pt-8 relative z-10">
                <button 
                  onClick={() => handleDelete(promo.id)}
                  className="p-3 bg-red-500/5 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all duration-500"
                  title="Purge Record"
                >
                  <span className="material-symbols-outlined text-[20px] font-light">delete_forever</span>
                </button>
                
                {promo.status === 'active' && (
                  <button 
                    onClick={() => handleDeactivate(promo.id)}
                    className="text-primary font-headline font-black text-[9px] uppercase tracking-[0.3em] hover:text-brand-accent transition-colors border-b border-primary/10 hover:border-brand-accent/40 pb-1"
                  >
                    Deactivate Voucher
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Issuance Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-xl"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-[0_32px_128px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20"
            >
              <div className="p-12">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h2 className="text-3xl font-headline font-black text-on-surface tracking-tighter uppercase mb-2">Issue Manifest Voucher</h2>
                    <p className="text-secondary text-sm font-light">Define the architectural privilege parameters below.</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-12 h-12 bg-background rounded-full flex items-center justify-center hover:bg-brand-accent hover:text-white transition-all duration-700"
                  >
                    <span className="material-symbols-outlined font-light">close</span>
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="col-span-2">
                       <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase px-1 mb-3">Coupon Manifest Reference (Code)</label>
                       <input 
                        type="text" 
                        required 
                        value={formData.code}
                        onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        className="w-full bg-background/50 border border-outline-variant/10 rounded-lg p-5 text-sm font-headline font-bold uppercase tracking-widest focus:ring-1 focus:ring-brand-accent outline-none transition-all"
                        placeholder="e.g. LIVO20"
                       />
                    </div>
                    
                    <div className="col-span-2">
                       <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase px-1 mb-3">Architectural Description</label>
                       <input 
                        type="text" 
                        required 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-background/50 border border-outline-variant/10 rounded-lg p-5 text-sm font-headline font-bold focus:ring-1 focus:ring-brand-accent outline-none transition-all"
                        placeholder="e.g. 20% privilege on master fittings"
                       />
                    </div>

                    <div>
                      <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase px-1 mb-3">Privilege Type</label>
                      <select 
                        value={formData.discount_type}
                        onChange={e => setFormData({...formData, discount_type: e.target.value as any})}
                        className="w-full bg-background/50 border border-outline-variant/10 rounded-lg p-5 text-sm font-headline font-bold focus:ring-1 focus:ring-brand-accent outline-none transition-all cursor-pointer"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase px-1 mb-3">Discount Value</label>
                      <input 
                        type="number" 
                        required 
                        value={formData.discount_value}
                        onChange={e => setFormData({...formData, discount_value: parseFloat(e.target.value)})}
                        className="w-full bg-background/50 border border-outline-variant/10 rounded-lg p-5 text-sm font-headline font-bold focus:ring-1 focus:ring-brand-accent outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase px-1 mb-3">Total Manifests (Limit)</label>
                      <input 
                        type="number" 
                        required 
                        value={formData.max_uses}
                        onChange={e => setFormData({...formData, max_uses: parseInt(e.target.value)})}
                        className="w-full bg-background/50 border border-outline-variant/10 rounded-lg p-5 text-sm font-headline font-bold focus:ring-1 focus:ring-brand-accent outline-none transition-all"
                        placeholder="0 for unlimited"
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase px-1 mb-3">Architectural Tier (Privilege)</label>
                      <select 
                        value={formData.min_privilege}
                        onChange={e => setFormData({...formData, min_privilege: e.target.value})}
                        className="w-full bg-background/50 border border-outline-variant/10 rounded-lg p-5 text-sm font-headline font-bold focus:ring-1 focus:ring-brand-accent outline-none transition-all cursor-pointer"
                      >
                        <option value="standard">Standard Member</option>
                        <option value="silver">Silver Tier</option>
                        <option value="gold">Gold Master</option>
                        <option value="platinum">Platinum Elite</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8px] font-black text-secondary tracking-[0.5em] uppercase px-1 mb-3">Cessation Date (Expiry)</label>
                      <input 
                        type="date" 
                        value={formData.expiry_date}
                        onChange={e => setFormData({...formData, expiry_date: e.target.value})}
                        className="w-full bg-background/50 border border-outline-variant/10 rounded-lg p-5 text-sm font-headline font-bold focus:ring-1 focus:ring-brand-accent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-6 pt-10 border-t border-outline-variant/10">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-6 rounded-sm font-headline font-black text-[10px] uppercase tracking-[0.3em] text-secondary hover:text-on-surface transition-all"
                    >
                      Discard
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] bg-primary text-white py-6 rounded-sm font-headline font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all duration-700 shadow-2xl"
                    >
                      Certify & Issue Voucher
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
