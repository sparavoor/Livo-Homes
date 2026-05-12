'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (isAdminLoggedIn) {
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // For a real production app, this should be an API call to verify against hashed passwords
    // But per user request to "Set this username and password", we implement the requested check.
    if (username === 'livohome' && password === 'livo9695') {
      localStorage.setItem('adminLoggedIn', 'true');
      router.push('/admin');
    } else {
      setError('Invalid administrative credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-accent/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <Link href="/">
            <h1 className="font-headline text-4xl font-black text-primary tracking-tighter mb-2">LIVO <span className="font-serif italic text-secondary/40 font-light">HOMES.</span></h1>
          </Link>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="w-8 h-[1px] bg-brand-accent"></div>
            <span className="text-brand-accent font-label text-[9px] font-black uppercase tracking-[0.4em]">Administrative Access</span>
            <div className="w-8 h-[1px] bg-brand-accent"></div>
          </div>
        </div>

        <div className="bg-white p-10 md:p-12 rounded-lg shadow-2xl border border-outline/5 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-accent"></div>
          
          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <div className="p-4 bg-error/5 border-l-2 border-error text-error text-[10px] font-black uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/60 ml-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-outline/10 focus:border-brand-accent/40 outline-none rounded-sm px-6 py-4 text-sm font-headline font-bold transition-all placeholder:text-secondary/20"
                placeholder="ADMIN_ID"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/60 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-outline/10 focus:border-brand-accent/40 outline-none rounded-sm px-6 py-4 text-sm font-headline font-bold transition-all placeholder:text-secondary/20"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-5 rounded-sm font-headline font-black text-[10px] uppercase tracking-[0.5em] hover:bg-brand-accent transition-all duration-700 shadow-2xl disabled:opacity-50 active:scale-95"
            >
              {isLoading ? 'Authenticating...' : 'Establish Connection'}
            </button>
          </form>
        </div>

        <p className="mt-12 text-center text-[10px] font-black text-secondary/30 uppercase tracking-[0.2em]">
          Secure executive portal. Unauthorized access is strictly prohibited.
        </p>
      </motion.div>
    </div>
  );
}
