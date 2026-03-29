import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-8 py-24 pt-32 max-w-4xl">
      <span className="text-primary uppercase tracking-[0.3em] font-label text-xs">Our Heritage</span>
      <h1 className="text-5xl font-headline font-extrabold text-on-surface tracking-tight mt-4 mb-12">Livo: Your Home, Your Style
      </h1>

      <div className="bg-surface-container-lowest rounded-2xl p-10 border border-outline-variant/30 shadow-sm mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-bl-full -z-0"></div>
        <div className="relative z-10 text-secondary text-lg leading-relaxed flex flex-col gap-6">
          <p>LAGO's exclusive product line, Livo, is designed to bring premium quality and exceptional style into every home. Livo products are crafted to make any bathroom look stunning without the high price tag. We are committed to serving the common man, ensuring that our high-quality sanitaryware is always within a budget-friendly range. With Livo, you don’t have to choose between style and affordability—you get both.</p>
          <p></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-64 md:h-auto bg-surface-container-high bg-[url('/images/hero1.png')] bg-cover bg-center rounded-2xl shadow-sm border border-outline-variant/20"></div>
        <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/30 flex flex-col justify-center">
          <h3 className="text-2xl font-headline font-bold text-on-surface mb-4">LAGO: The Art of Living Well</h3>
          <p className="text-secondary mb-8 text-sm leading-relaxed">For 12 years, LAGO has been a name synonymous with quality and trust in the sanitaryware industry. What began with a single shop in Malappuram, Kerala, has grown into a leading national and international brand. Our journey is built on a simple promise: to offer premium products that are accessible to everyone, ensuring that a beautiful home is within every family’s reach.</p>
          
          <Link 
            href="https://lagogroup.in" 
            target="_blank"
            className="inline-flex items-center justify-center gap-2 bg-white text-on-surface px-6 py-3 rounded-full text-sm font-label font-bold tracking-wider hover:bg-surface-container-high transition-all active:scale-95 shadow-lg shadow-black/5 border border-outline-variant/30 w-fit"
          >
            VISIT LAGO GROUP
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
