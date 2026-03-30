'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

function RegisterContent() {
  const { user, loginWithGoogle, sendOtp, verifyOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const redirect = searchParams?.get('redirect') || '/profile';
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && user) {
      router.push(redirect);
    }
  }, [user, router, redirect, isMounted]);

  // Handle errors gracefully
  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      showError(err.message || 'Failed to register with Google');
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setError('');
    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      await sendOtp(formattedPhone);
      setIsOtpSent(true);
    } catch (err: any) {
      showError(err.message || 'Failed to send OTP. Ensure number is valid.');
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setError('');
    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      await verifyOtp(formattedPhone, otp);
    } catch (err: any) {
      showError(err.message || 'Verification failed. Please try again.');
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
            {isOtpSent ? 'Establish Registry' : 'Create Account'}
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
            <div className="space-y-4">
              <label className="block font-black text-primary text-[8px] uppercase tracking-[0.4em]">Primary Communication Channel</label>
              <div className="group relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary/40 text-xs font-bold">+91</span>
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="XXXXXXXXXX" 
                  className="w-full bg-background border border-outline/10 focus:border-brand-accent/40 outline-none rounded-sm pl-16 pr-6 py-5 text-sm font-headline font-bold transition-all placeholder:text-secondary/20" 
                  required
                />
              </div>
              <p className="text-[8px] text-secondary/40 uppercase tracking-[0.2em] px-1">Your mobile number will serve as your architectural ID.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="font-black text-primary text-[8px] uppercase tracking-[0.4em]">Registry Passcode</label>
                <button 
                  type="button" 
                  onClick={() => setIsOtpSent(false)}
                  className="text-[8px] text-brand-accent font-black uppercase tracking-[0.2em] hover:underline"
                >
                  Modify Number
                </button>
              </div>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="0 0 0 0 0 0" 
                className="w-full bg-background border border-outline/10 focus:border-brand-accent/40 outline-none rounded-sm px-6 py-5 text-center text-lg tracking-[1em] font-black transition-all placeholder:opacity-10" 
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
            {loading ? 'Initializing...' : (isOtpSent ? 'Verify Registry' : 'Register Account')}
          </button>
        </form>

        <div className="relative my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline/5"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-6 bg-white text-secondary/30 font-black text-[8px] uppercase tracking-[0.4em]">Or registry via</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-4 w-full py-5 px-6 border border-outline/10 rounded-sm font-black text-[9px] uppercase tracking-[0.2em] hover:bg-background transition-all active:scale-95 disabled:opacity-30"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google Identity
        </button>

        <div className="mt-12 pt-8 border-t border-outline/5 text-center">
          <p className="text-secondary/40 text-[9px] font-black uppercase tracking-[0.2em]">
            Existing identity? <Link href="/login" className="text-brand-accent ml-2 hover:underline">Secure Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Initialising Registry...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
