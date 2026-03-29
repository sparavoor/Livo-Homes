'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Banner } from '@/lib/db';

interface HeroSliderProps {
  banners: Banner[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  
  const activeBanners = banners.filter(b => b.isActive);
  
  // Auto-slide logic
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[current];

  return (
    <section className="relative h-[95vh] min-h-[750px] w-full overflow-hidden bg-primary px-4 py-4">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentBanner.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
          className="absolute inset-0 rounded-3xl overflow-hidden m-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            className="w-full h-full object-cover opacity-50 scale-105 saturate-[0.8]" 
            alt={currentBanner.title} 
            src={currentBanner.image}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/40 to-transparent"></div>
        </motion.div>
      </AnimatePresence>
      
      <div className="relative h-full max-w-[1440px] mx-auto px-10 flex flex-col justify-center items-start z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentBanner.id + '-content'}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="w-full"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-[1px] bg-brand-accent"></div>
              <span className="font-label text-brand-accent tracking-[0.5em] text-[10px] font-black uppercase block">Signature Collection</span>
            </div>
            
            <h1 className="font-headline text-white text-7xl md:text-9xl font-black leading-[0.85] max-w-5xl mb-12 tracking-tighter"
                dangerouslySetInnerHTML={{ __html: currentBanner.title.replace(/\. /g, '.<br/>') }} />
            
            <p className="text-white/60 text-lg md:text-xl max-w-xl mb-16 leading-relaxed font-light tracking-wide">
              {currentBanner.subtitle}
            </p>
            
            <div className="flex flex-wrap gap-8 items-center">
              <Link 
                href={currentBanner.link} 
                className="bg-brand-accent text-white px-14 py-6 rounded-sm font-headline font-black text-[10px] tracking-[0.3em] uppercase hover:bg-white hover:text-primary transition-all duration-700 shadow-2xl flex items-center gap-4"
              >
                Explore Collection
                <span className="material-symbols-outlined text-lg">arrow_right_alt</span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-16 left-14 z-20 flex gap-4">
          {activeBanners.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrent(i)}
              className={`h-0.5 transition-all duration-500 rounded-full ${i === current ? 'w-16 bg-brand-accent' : 'w-8 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
      )}
      
      <div className="absolute bottom-16 right-16 flex flex-col items-center gap-6 z-20">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
           <span className="material-symbols-outlined text-white/30 text-2xl font-light">keyboard_double_arrow_down</span>
        </motion.div>
        <span className="text-white/30 text-[8px] font-black uppercase tracking-[0.4em] rotate-90 origin-left mt-8">Scroll</span>
      </div>
    </section>
  );
}
