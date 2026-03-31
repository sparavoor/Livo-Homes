'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!orderId) {
      router.push('/products');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/profile');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, router]);

  return (
    <div className="bg-background min-h-screen pt-40 pb-24 px-6 md:px-12 flex items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-12">
        {/* Success Icon Animation */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="w-32 h-32 bg-brand-accent text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-brand-accent/20 relative"
        >
          <span className="material-symbols-outlined text-6xl">check_circle</span>
          <motion.div 
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-brand-accent"
          ></motion.div>
        </motion.div>

        {/* Text Presentation */}
        <div className="space-y-4">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-brand-accent font-black text-[10px] uppercase tracking-[0.5em] block"
          >
            Logistics Synchronized
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-headline text-5xl md:text-6xl font-black text-primary tracking-tighter"
          >
            Manifest Secured.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm font-medium text-secondary/50 max-w-md mx-auto leading-relaxed uppercase tracking-wider"
          >
            Your procurement request has been permanently recorded in our archival repository. 
            Authentication certificate ID: <span className="text-primary font-black ml-1">{orderId?.slice(0, 8).toUpperCase()}</span>
          </motion.p>
        </div>

        {/* Navigation Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm mx-auto"
        >
          <Link 
            href="/profile" 
            className="bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] py-5 px-8 hover:bg-brand-accent transition-all duration-500 shadow-xl shadow-primary/10"
          >
            Track Dispatch
          </Link>
          <Link 
            href="/products" 
            className="border border-outline/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] py-5 px-8 hover:bg-surface-container-low transition-all duration-500"
          >
            Return to Gallery
          </Link>
        </motion.div>

        {/* Footer info & Countdown */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="pt-12 border-t border-outline/5 space-y-4"
        >
           <p className="text-[9px] text-secondary/30 uppercase tracking-[0.3em]">
             Establishing encrypted connection to manifest... {countdown}s
           </p>
           <div className="flex justify-center gap-8 grayscale opacity-30">
              <span className="text-[10px] font-black tracking-widest text-primary">RELIANCE</span>
              <span className="text-[10px] font-black tracking-widest text-primary">AUTHENTICITY</span>
              <span className="text-[10px] font-black tracking-widest text-primary">ARCHITECTURAL</span>
           </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
