'use client';

import { useState, useEffect } from 'react';
import { fetchSettingsAction, updateSettingsAction } from './actions';
import { SiteSettings } from '@/lib/db';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettingsAction().then(data => {
      setSettings(data);
      setIsLoading(false);
    });
  }, []);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await updateSettingsAction(formData);
      setMessage({ type: 'success', text: 'Global configuration archived successfully.' });
      // Refresh local state
      const updated = await fetchSettingsAction();
      setSettings(updated);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to archive manifest updates.' });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-brand-accent"></div>
        <p className="mt-6 text-xs font-headline font-black uppercase tracking-[0.3em] text-secondary/40">Synchronizing Registry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-3xl font-headline font-black text-primary tracking-tighter uppercase">Platform <span className="font-serif italic text-secondary/40 font-light lowercase">Configuration.</span></h2>
      </div>

      {message.text && (
        <div className={`mb-10 p-6 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top-4 duration-700 shadow-xl ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-error/10 text-error'}`}>
          {message.text}
        </div>
      )}

      <form action={handleSubmit} className="space-y-12">
        {/* Core Identity */}
        <section className="bg-white rounded-2xl p-12 border border-outline/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none transition-opacity group-hover:opacity-[0.05]">
             <span className="material-symbols-outlined text-[160px] font-black">architecture</span>
          </div>
          <h3 className="text-[10px] font-black text-brand-accent uppercase tracking-[0.5em] mb-10 pb-4 border-b border-outline/10 inline-block">Core Manifest</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-3">
              <label className="block text-[8px] font-black text-secondary tracking-[0.4em] uppercase">Site Designation</label>
              <input name="siteName" defaultValue={settings?.siteName} className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all" />
            </div>
            <div className="space-y-3">
              <label className="block text-[8px] font-black text-secondary tracking-[0.4em] uppercase">Aesthetic Tagline</label>
              <input name="tagline" defaultValue={settings?.tagline} className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all" />
            </div>
          </div>
        </section>

        {/* Logistic Points */}
        <section className="bg-white rounded-2xl p-12 border border-outline/5 shadow-2xl">
          <h3 className="text-[10px] font-black text-brand-accent uppercase tracking-[0.5em] mb-10 pb-4 border-b border-outline/10 inline-block">Logistic Communication</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-3">
              <label className="block text-[8px] font-black text-secondary tracking-[0.4em] uppercase">Verified Email</label>
              <input name="contactEmail" defaultValue={settings?.contactEmail} className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all" />
            </div>
            <div className="space-y-3">
              <label className="block text-[8px] font-black text-secondary tracking-[0.4em] uppercase">Voice Portal (Phone)</label>
              <input name="contactPhone" defaultValue={settings?.contactPhone} className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all" />
            </div>
            <div className="space-y-3">
              <label className="block text-[8px] font-black text-secondary tracking-[0.4em] uppercase">WhatsApp Integration ID</label>
              <input name="whatsappNumber" defaultValue={settings?.whatsappNumber} className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all" />
              <p className="text-[8px] text-secondary/40 font-black uppercase tracking-[0.2em]">Include country code without '+'.</p>
            </div>
             <div className="space-y-3">
              <label className="block text-[8px] font-black text-secondary tracking-[0.4em] uppercase">Operational Cycles (Hours)</label>
              <input name="officeHours" defaultValue={settings?.officeHours} className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all" />
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="block text-[8px] font-black text-secondary tracking-[0.4em] uppercase">Physical Registry (Address)</label>
              <textarea name="address" rows={3} defaultValue={settings?.address} className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all resize-none" />
            </div>
          </div>
        </section>

        {/* Social Expansion */}
        <section className="bg-white rounded-2xl p-12 border border-outline/5 shadow-2xl">
          <h3 className="text-[10px] font-black text-brand-accent uppercase tracking-[0.5em] mb-10 pb-4 border-b border-outline/10 inline-block">Social Reach</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-3">
              <label className="block text-[8px] font-black text-secondary tracking-[0.4em] uppercase italic">Instagram</label>
              <input name="instagram" defaultValue={settings?.socials?.instagram} className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all" />
            </div>
            <div className="space-y-3">
              <label className="block text-[8px] font-black text-secondary tracking-[0.4em] uppercase italic">Facebook</label>
              <input name="facebook" defaultValue={settings?.socials?.facebook} className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all" />
            </div>
            <div className="space-y-3">
              <label className="block text-[8px] font-black text-secondary tracking-[0.4em] uppercase italic">Twitter (X)</label>
              <input name="twitter" defaultValue={settings?.socials?.twitter} className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all" />
            </div>
            <div className="space-y-3">
              <label className="block text-[8px] font-black text-secondary tracking-[0.4em] uppercase italic">LinkedIn</label>
              <input name="linkedin" defaultValue={settings?.socials?.linkedin} className="w-full bg-background border border-outline/10 focus:ring-1 focus:ring-brand-accent outline-none rounded-lg p-5 text-sm font-headline font-bold transition-all" />
            </div>
          </div>
        </section>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-primary text-white px-16 py-6 rounded-sm font-headline font-black text-[12px] uppercase tracking-[0.4em] hover:bg-brand-accent transition-all duration-700 active:scale-95 shadow-2xl disabled:opacity-50 flex items-center gap-4"
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-3 w-3 border-2 border-white/20 border-t-white rounded-full"></div>
                Committing Manifest...
              </>
            ) : 'Archive Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
