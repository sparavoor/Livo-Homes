'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

function RegisterContent() {
  const { loginWithGoogle, sendOtp, verifyOtp } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName) {
      showError('Please enter your full name for the architectural registry.');
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      showError('Please enter a valid 10-digit phone number.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      // In Supabase, we can pass metadata during OTP sign up if it's the first time
      // But usually we update it after verification or via a trigger.
      // Our trigger uses NEW.raw_user_meta_data->>'full_name'
      await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      setIsOtpSent(true);
    } catch (err: any) {
      showError(err.message || 'Failed to initiate registration.');
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      showError('Please enter the 6-digit passcode.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const { data, error: verifyError } = await verifyOtp(formattedPhone, otp);
      
      if (verifyError) throw verifyError;
      if (data?.user) {
        router.push('/profile');
      }
    } catch (err: any) {
      showError(err.message || 'The passcode entered is invalid or expired.');
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  if (!isMounted) return <div className="min-h-[80vh]" />;

  return (
    <div className="container mx-auto px-6 py-24 pt-48 flex justify-center items-center min-h-[90vh]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="w-full max-w-md bg-white p-12 rounded-sm shadow-2xl border border-outline/5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-accent"></div>
        
        <div className="text-center mb-12">
          <Link href="/">
             <h2 className="text-3xl font-headline font-black text-primary tracking-tighter mb-2">LIVO <span className="font-serif italic text-secondary/40 font-light">HOMES.</span></h2>
          </Link>
          <div className="w-12 h-[1px] bg-brand-accent/30 mx-auto mt-6 mb-4"></div>
          <p className="text-secondary/60 text-[10px] uppercase font-black tracking-[0.4em] mt-4">
            {isOtpSent ? 'Verify Identity' : 'Architectural Registration'}
          </p>
        </div>
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 bg-error/5 text-error text-[10px] font-black uppercase tracking-widest rounded-sm border-l-2 border-error text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp} className="space-y-8">
          {!isOtpSent ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block font-black text-primary text-[8px] uppercase tracking-[0.4em]">Proprietor Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Legal Name" 
                  className="w-full bg-background border border-outline/10 focus:border-brand-accent/40 outline-none rounded-sm px-6 py-5 text-sm font-headline font-bold transition-all placeholder:text-secondary/20" 
                  required
                />
              </div>
              
              <div className="space-y-4">
                <label className="block font-black text-primary text-[8px] uppercase tracking-[0.4em]">Communications Channel</label>
                <div className="group relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-outline/10 pr-3 pointer-events-none">
                    <span className="text-secondary/40 text-xs font-bold leading-none">+91</span>
                  </div>
                  <input 
                    type="tel" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="00000 00000" 
                    className="w-full bg-background border border-outline/10 focus:border-brand-accent/40 outline-none rounded-sm pl-20 pr-6 py-5 text-sm font-headline font-bold transition-all placeholder:text-secondary/20" 
                    required
                  />
                </div>
              </div>
              <p className="text-[8px] text-secondary/40 uppercase tracking-[0.2em] px-1">Your credentials will be formalized via secure SMS verification.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="font-black text-primary text-[8px] uppercase tracking-[0.4em]">Passcode</label>
                <button 
                  type="button" 
                  onClick={() => setIsOtpSent(false)}
                  className="text-[8px] text-brand-accent font-black uppercase tracking-[0.2em] hover:opacity-70"
                >
                  Return to Registry
                </button>
              </div>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="0 0 0 0 0 0" 
                className="w-full bg-background border border-outline/10 focus:border-brand-accent/40 outline-none rounded-sm px-6 py-5 text-center text-lg tracking-[1em] font-black transition-all placeholder:opacity-5" 
                maxLength={6}
                required
                autoFocus
              />
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-6 rounded-sm font-headline font-black text-[10px] uppercase tracking-[0.5em] hover:bg-brand-accent transition-all duration-700 shadow-2xl disabled:opacity-30 disabled:translate-y-0 active:scale-95"
          >
            {loading ? 'Processing...' : (isOtpSent ? 'Finalise Membership' : 'Request Registry Access')}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-outline/5 text-center">
          <p className="text-secondary/40 text-[9px] font-black uppercase tracking-[0.2em]">
            Already recorded in manifest? <Link href="/login" className="text-brand-accent ml-2 hover:underline">Vault Access</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background">Initialising Registry...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
