'use client';
import Link from 'next/link';

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-body text-primary antialiased">
      {/* Top Header */}
      <nav className="h-24 bg-white border-b border-outline/5 px-10 lg:px-16 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-8">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="LIVO HOMES" className="h-8 w-auto object-contain" />
          </Link>
          <div className="h-6 w-[1px] bg-outline/10"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary/40">Portal Access</span>
        </div>

        <div className="flex items-center gap-6">
          <Link 
            href="/"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 hover:text-brand-accent transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Return Home
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto p-10 lg:p-16">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="p-16 border-t border-outline/5 bg-white/50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
          <p className="text-[9px] font-black uppercase tracking-[0.4em]">Livo Homes Management Interface © 2026</p>
          <div className="flex gap-10">
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Secure Access</span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Encrypted Session</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
