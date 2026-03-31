'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const { totalItems } = useCart();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
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

  const handleLogout = () => {
    // Initiate logout and redirect immediately
    logout();
    router.push('/');
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
              className="bg-transparent border-none focus:ring-0 text-xs w-48 font-body text-primary ml-2"
            />
          </form>

          {/* Cart Icon */}
          <Link href="/cart" className="relative p-2 text-primary dark:text-white hover:text-brand-accent transition-colors group">
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">shopping_bag</span>
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1 right-1 w-4 h-4 bg-brand-accent text-white rounded-full flex items-center justify-center text-[8px] font-black"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* User Profile / Login */}
          <div className="relative hidden md:block">
            {user ? (
              <>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 p-1 rounded-full border border-outline/10 hover:border-brand-accent/30 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (profile?.full_name?.charAt(0).toUpperCase() || 'U')}
                  </div>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-4 w-56 bg-white border border-outline/10 shadow-2xl py-4 z-50 overflow-hidden"
                    >
                      <div className="px-6 py-2 mb-4">
                        <p className="text-[10px] font-black text-primary uppercase tracking-tighter truncate">{profile?.full_name}</p>
                        <p className="text-[8px] font-bold text-secondary/40 uppercase tracking-widest truncate">{profile?.email || profile?.phone}</p>
                      </div>
                      <div className="h-[1px] bg-outline/5 mb-2 mx-4"></div>
                      <Link href="/profile" className="flex items-center gap-3 px-6 py-3 text-[9px] font-black text-secondary hover:text-brand-accent hover:bg-surface-container-low transition-all uppercase tracking-widest">
                        <span className="material-symbols-outlined text-lg">person</span> Profile
                      </Link>
                      <Link href="/profile" className="flex items-center gap-3 px-6 py-3 text-[9px] font-black text-secondary hover:text-brand-accent hover:bg-surface-container-low transition-all uppercase tracking-widest">
                        <span className="material-symbols-outlined text-lg">history</span> Orders
                      </Link>
                      {profile?.is_admin && (
                        <Link href="/admin" className="flex items-center gap-3 px-6 py-3 text-[9px] font-black text-primary hover:text-brand-accent hover:bg-surface-container-low transition-all uppercase tracking-widest border-t border-outline/5 mt-2 pt-4">
                          <span className="material-symbols-outlined text-lg">admin_panel_settings</span> Exec Portal
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-6 py-3 text-[9px] font-black text-error/60 hover:text-error hover:bg-error/5 transition-all uppercase tracking-widest border-t border-outline/5 mt-2 pt-4"
                      >
                        <span className="material-symbols-outlined text-lg">logout</span> Terminate Session
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                href="/login"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:text-brand-accent transition-colors flex items-center gap-2"
              >
                Vault Access <span className="material-symbols-outlined text-lg">lock</span>
              </Link>
            )}
          </div>

          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-primary dark:text-white hover:bg-surface-container-low rounded-full transition-all"
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
                {user ? (
                  <>
                    <Link href="/profile" className="flex items-center gap-3 text-primary uppercase tracking-widest font-black text-[10px]">
                      <span className="material-symbols-outlined text-lg">person</span> Profile Details
                    </Link>
                    <Link href="/profile" className="flex items-center gap-3 text-primary uppercase tracking-widest font-black text-[10px]">
                      <span className="material-symbols-outlined text-lg">history</span> Procurement History
                    </Link>
                    {profile?.is_admin && (
                      <Link href="/admin" className="flex items-center gap-3 text-brand-accent uppercase tracking-widest font-black text-[10px]">
                        <span className="material-symbols-outlined text-lg">admin_panel_settings</span> Executive Portal
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 text-error uppercase tracking-widest font-black text-[10px] text-left"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span> Terminate Session
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="flex items-center gap-3 text-primary uppercase tracking-widest font-black text-[10px]">
                    <span className="material-symbols-outlined text-lg">lock</span> Member Vault Access
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
