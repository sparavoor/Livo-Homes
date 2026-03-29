import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 font-headline text-sm leading-relaxed relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 py-24 px-8 max-w-[1440px] mx-auto relative z-10">
        <div className="space-y-8">
          <div className="flex flex-col">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="LIVO HOMES" className="h-8 w-auto object-contain brightness-0 opacity-80" />
          </div>
          <p className="text-slate-400 font-light text-base leading-relaxed max-w-xs">
            To be the most trusted and sought-after brand in the sanitaryware industry, recognized for our commitment to quality, affordability, and customer satisfaction.
          </p>
          <div className="flex space-x-6">
            <span className="material-symbols-outlined text-slate-300 cursor-pointer hover:text-primary transition-colors text-xl">public</span>
            <span className="material-symbols-outlined text-slate-300 cursor-pointer hover:text-primary transition-colors text-xl">share</span>
            <span className="material-symbols-outlined text-slate-300 cursor-pointer hover:text-primary transition-colors text-xl">star</span>
          </div>
        </div>
        <div className="flex flex-col space-y-6">
          <h4 className="font-black text-primary uppercase tracking-[0.2em] text-[10px] mb-2">Collections</h4>
          <Link className="text-slate-400 hover:text-primary transition-all font-light text-base" href="/category/closets">Closets</Link>
          <Link className="text-slate-400 hover:text-primary transition-all font-light text-base" href="/category/wash-basin">Wash Basin</Link>
          <Link className="text-slate-400 hover:text-primary transition-all font-light text-base" href="/category/faucets">Faucets</Link>
          <Link className="text-slate-400 hover:text-primary transition-all font-light text-base" href="/category/shower">Shower</Link>
        </div>
        <div className="flex flex-col space-y-6">
          <h4 className="font-black text-primary uppercase tracking-[0.2em] text-[10px] mb-2">Registry</h4>
          <Link className="text-slate-400 hover:text-primary transition-all font-light text-base" href="/about">About Us</Link>
          <Link className="text-slate-400 hover:text-primary transition-all font-light text-base" href="/contact">Contact</Link>
          <Link className="text-slate-400 hover:text-primary transition-all font-light text-base" href="/privacy">Privacy Policy</Link>
          <Link className="text-slate-400 hover:text-primary transition-all font-light text-base" href="/terms">Terms of Service</Link>
        </div>
        <div className="flex flex-col space-y-8">
          <h4 className="font-black text-primary uppercase tracking-[0.2em] text-[10px] mb-2">Atelier</h4>
          <div className="space-y-4">
            <p className="text-slate-400 font-light flex items-center gap-4 text-base">
              <span className="material-symbols-outlined text-slate-200 text-lg">mail</span>
              <span>lagoinfo@gmail.com</span>
            </p>
            <p className="text-slate-400 font-light flex items-center gap-4 text-base">
              <span className="material-symbols-outlined text-slate-200 text-lg">phone</span>
              <span>+91 9072 123 001</span>
            </p>
            <p className="text-slate-400 font-light flex items-center gap-4 text-base">
              <span className="material-symbols-outlined text-slate-200 text-lg">location_on</span>
              <span className="leading-tight">LAGO Global Headquarters<br />Kottappuram, Malappuram, Kerala</span>
            </p>
          </div>
        </div>
      </div>
      <div className="py-12 px-8 border-t border-slate-100 text-center relative z-10">
        <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em]">
          © 2026 Livo Homes Atelier. Powered by Paper n Pencil.
        </p>
      </div>
    </footer>
  );
}
