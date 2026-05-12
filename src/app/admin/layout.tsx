'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Basic admin authentication check
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isAdminLoggedIn && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('adminLoggedIn');
      await logout();
      window.location.href = '/admin/login';
    } catch (error) {
      console.error("Admin logout failed:", error);
      window.location.href = '/admin/login';
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { name: 'Orders', path: '/admin/orders', icon: 'shopping_cart' },
    { name: 'Customers', path: '/admin/customers', icon: 'group' },
    { name: 'Categories', path: '/admin/categories', icon: 'category' },
    { name: 'Sub-Categories', path: '/admin/subcategories', icon: 'layers' },
    { name: 'Products', path: '/admin/products', icon: 'inventory_2' },
    { name: 'Hero Banners', path: '/admin/banners', icon: 'view_carousel' },
    { name: 'Inquiries', path: '/admin/inquiries', icon: 'forum' },
    { name: 'Settings', path: '/admin/settings', icon: 'settings' },
  ];

  // If we are on the login page, don't show the sidebar/header shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background font-body text-primary antialiased">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:sticky top-0 left-0 w-64 bg-primary text-white flex flex-col h-screen z-50 border-r border-outline/5 shadow-2xl transition-transform duration-500
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-24 flex items-center justify-between px-8 border-b border-white/5 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="LIVO HOMES" className="h-6 w-auto object-contain brightness-0 invert opacity-90" />
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-white/40 hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 px-6 py-10 space-y-2 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-lg transition-all duration-500 group ${isActive
                  ? 'bg-brand-accent text-white shadow-xl translate-x-1'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-white' : 'text-white/20 group-hover:text-brand-accent'}`}>{link.icon}</span>
                <span className="font-headline font-bold text-[10px] uppercase tracking-[0.2em]">{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-12 pb-6">
            <p className="px-5 text-[9px] font-black uppercase tracking-[0.4em] text-white/10">Architecture Supply</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 text-error/60 hover:text-error hover:bg-error/5 rounded-lg transition-all duration-500 group mt-4"
          >
            <span className="material-symbols-outlined text-[20px] opacity-20 group-hover:opacity-100">logout</span>
            <span className="font-headline font-bold text-[10px] uppercase tracking-[0.2em]">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="h-24 lg:h-32 flex justify-between items-center px-6 lg:px-16 border-b border-outline/5 bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-primary/40 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[28px]">menu</span>
            </button>
            <div className="hidden sm:block">
              <div className="flex items-center gap-4 mb-1">
                <div className="w-6 h-[1px] bg-brand-accent"></div>
                <span className="text-brand-accent font-label text-[8px] font-black uppercase tracking-[0.4em]">Administrative Portal</span>
              </div>
              <h1 className="font-headline text-xl lg:text-3xl font-black text-primary tracking-tighter truncate max-w-[200px] sm:max-w-none">
                {navLinks.find(link => link.path === pathname)?.name || 'Executive Overview'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-10">
            {/* Notifications */}
            <button className="relative p-2 text-primary/40 hover:text-brand-accent transition-colors hidden sm:block">
              <span className="material-symbols-outlined text-[24px] font-light">notifications</span>
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-accent rounded-full ring-4 ring-background"></span>
            </button>
            {/* Admin Profile */}
            <div className="flex items-center gap-3 lg:gap-5 lg:pl-10 lg:border-l lg:border-outline/10">
              <div className="text-right hidden md:block">
                <p className="text-sm font-black text-primary tracking-tight">Super Admin</p>
                <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em] font-label">Livo Homes</p>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-brand-accent opacity-0 group-hover:opacity-20 rounded-full blur transition-opacity duration-500"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Admin Avatar"
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-outline/10 object-cover shadow-2xl relative"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5q_El5ouCqjhvC-sUTPX1rZwGGhw6kUW0iwjhAyglKDQpZlYSrFe5USxI78xFFyI-DSt3Ndi0hQKXgLtrqz3tMHeS4EyJHcrFPkHYfHqATS8B8muLdHwl7DfANhvC0DEuhpS3fKt-0WanAzqD4xbKp3DLcmPLMgeCpUBkwsON4UnHs06zJrMh52Tqq3p8UJMuWEnAGVwKrVvSbx0EjytSsY4I4Y9_5No_l1CCREz0QEfAHi8_uxQALXpSvQCHWaAfNziSWdz34ao"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-16 flex-1">
          {children}
        </main>
      </div>

      {/* WhatsApp Support Floating Action Button */}
      <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50">
        <a
          className="bg-green-600 p-3 lg:p-4 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/20 hover:bg-green-700 hover:scale-110 transition-transform active:scale-95 duration-300 group"
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="material-symbols-outlined text-white text-[24px] lg:text-[28px]">chat</span>
          <span className="absolute right-full mr-4 bg-white text-primary text-xs font-bold py-2 px-4 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap hidden lg:block">Technical Support</span>
        </a>
      </div>
    </div>
  );
}

