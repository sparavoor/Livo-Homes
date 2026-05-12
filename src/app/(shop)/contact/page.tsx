'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
      subject: 'Project Inquiry',
      status: 'unread'
    };

    try {
      const { error: supabaseError } = await supabase
        .from('contact_inquiries')
        .insert([data]);

      if (supabaseError) throw supabaseError;
      
      setSubmitted(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to dispatch inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-8 py-24 pt-32 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div>
          <span className="text-primary uppercase tracking-[0.3em] font-label text-xs">Reach Out</span>
          <h1 className="text-5xl font-headline font-extrabold text-on-surface tracking-tight mt-4 mb-8">Get in Touch</h1>
          <p className="text-secondary text-lg mb-10">Connect with our architectural consultants to discuss your next premium residential project.</p>

          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
              <div>
                <h4 className="font-headline font-bold text-on-surface">LAGO Global Headquarters</h4>
                <p className="text-secondary mt-1">Kottappuram,<br />Malappuram, Kerala,<br />India-673637</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">mail</span>
              <div>
                <h4 className="font-headline font-bold text-on-surface">Email Us</h4>
                <p className="text-secondary mt-1">lagoinfo@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-10 border border-outline-variant/30 shadow-sm relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div>
                    <label className="block font-semibold text-on-surface-variant text-sm mb-2">Name</label>
                    <input 
                      name="name" 
                      type="text" 
                      required 
                      className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-on-surface-variant text-sm mb-2">Email</label>
                    <input 
                      name="email" 
                      type="email" 
                      required 
                      className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-on-surface-variant text-sm mb-2">Project Details</label>
                    <textarea 
                      name="message" 
                      rows={4} 
                      required 
                      className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-sm resize-none"
                    ></textarea>
                  </div>
                  
                  {error && <p className="text-error text-xs uppercase tracking-widest font-bold">{error}</p>}

                  <button 
                    disabled={isSubmitting}
                    className="bg-primary text-white w-full py-5 rounded-sm font-headline font-black text-[12px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all duration-700 active:scale-95 mt-8 shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    {isSubmitting ? 'Dispatching...' : 'Dispatch Inquiry'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="thank-you"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-12"
              >
                <div className="w-20 h-20 bg-brand-accent rounded-full flex items-center justify-center mb-6 text-white shadow-xl shadow-brand-accent/20">
                  <span className="material-symbols-outlined text-4xl">task_alt</span>
                </div>
                <h3 className="text-2xl font-headline font-black text-primary tracking-tight mb-4">Inquiry Received</h3>
                <p className="text-secondary text-sm font-light leading-relaxed mb-8">Your message has been safely recorded in our private manifest. An architectural consultant will respond shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:text-brand-accent transition-colors"
                >
                  Send Another Message
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
