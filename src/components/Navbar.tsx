'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/auth-context';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { user } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 dark:bg-primary/95 backdrop-blur-md border-b border-outline/10">
      <div className="flex justify-between items-center h-24 px-6 md:px-12 max-w-[1440px] mx-auto w-full relative">
        <Link href="/" className="transition-opacity hover:opacity-80 flex items-center h-full py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="LIVO HOMES" className="h-8 w-auto object-contain dark:brightness-0 dark:invert transition-all" />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-12 font-headline font-bold tracking-widest text-[10px] uppercase">
          <Link href="/" className={`architectural-underline pb-1 transition-colors ${isActive('/') ? 'text-brand-accent' : 'text-secondary hover:text-primary dark:hover:text-white'}`}>Home</Link>
          <Link href="/products" className={`architectural-underline pb-1 transition-colors ${isActive('/products') ? 'text-brand-accent' : 'text-secondary hover:text-primary dark:hover:text-white'}`}>Collection</Link>
          <Link href="/about" className={`architectural-underline pb-1 transition-colors ${isActive('/about') ? 'text-brand-accent' : 'text-secondary hover:text-primary dark:hover:text-white'}`}>Legacy</Link>
          <Link href="/contact" className={`architectural-underline pb-1 transition-colors ${isActive('/contact') ? 'text-brand-accent' : 'text-secondary hover:text-primary dark:hover:text-white'}`}>Contact</Link>
        </div>

        <div className="flex items-center space-x-4 md:space-x-8">
          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden xl:flex items-center bg-surface-container-low px-4 py-2.5 rounded-full border border-outline/5 focus-within:border-brand-accent/30 transition-all group">
            <span className="material-symbols-outlined text-secondary group-focus-within:text-brand-accent text-xl transition-colors">search</span>
            <input 
              type="text"
              placeholder="Search aesthetics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-xs w-40 font-body text-primary placeholder:text-secondary/50 placeholder:font-light"
            />
          </form>

          <div className="flex items-center space-x-2 md:space-x-4">
            <Link href={user ? "/profile" : "/login"} className="p-2 text-primary dark:text-white hover:bg-surface-container-low rounded-full transition-all">
              <span className="material-symbols-outlined text-2xl font-light">
                {user ? 'account_circle' : 'person'}
              </span>
            </Link>
            
            <Link href="/cart" className="p-2 text-primary dark:text-white hover:bg-surface-container-low rounded-full transition-all relative">
              <span className="material-symbols-outlined text-2xl font-light">shopping_cart</span>
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-brand-accent text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-in zoom-in duration-500 scale-110">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-primary dark:text-white hover:bg-surface-container-low rounded-full transition-all"
            >
              <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white dark:bg-primary border-b border-outline/10 lg:hidden overflow-hidden z-40"
          >
            <div className="flex flex-col p-8 space-y-8 font-headline font-bold text-xs uppercase tracking-[0.3em]">
              <Link href="/" className={`transition-colors ${isActive('/') ? 'text-brand-accent' : 'text-secondary'}`}>Home</Link>
              <Link href="/products" className={`transition-colors ${isActive('/products') ? 'text-brand-accent' : 'text-secondary'}`}>Collection</Link>
              <Link href="/about" className={`transition-colors ${isActive('/about') ? 'text-brand-accent' : 'text-secondary'}`}>Legacy</Link>
              <Link href="/contact" className={`transition-colors ${isActive('/contact') ? 'text-brand-accent' : 'text-secondary'}`}>Contact</Link>
              
              <div className="pt-8 border-t border-outline/10 flex flex-col gap-6">
                 <form onSubmit={handleSearch} className="flex items-center bg-surface-container-low px-5 py-4 rounded-2xl border border-outline/5">
                  <span className="material-symbols-outlined text-secondary text-xl mr-3">search</span>
                  <input 
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm w-full font-body text-primary"
                  />
                </form>
                
                <Link href={user ? "/profile" : "/login"} className="flex items-center gap-4 text-xs font-black text-primary">
                  <span className="material-symbols-outlined font-light">person</span>
                  {user ? 'My Profile' : 'Sign In'}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
