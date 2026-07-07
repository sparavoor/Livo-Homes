import Link from 'next/link';
import { getProducts, getCategories, getBanners, getSignatureMasterpieces, getRecentProducts, Product, Category, Banner } from '@/lib/db';
import { getWhatsAppLink, DEFAULT_INQUIRY_MESSAGE } from '@/lib/whatsapp';
import MotionSection from '@/components/MotionSection';
import MotionItem from '@/components/MotionItem';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import HeroSlider from '@/components/HeroSlider';

export default async function Home() {
  const [signatureMasterpieces, recentlyAdded, categories, banners] = await Promise.all([
    getSignatureMasterpieces(8),
    getRecentProducts(8),
    getCategories(),
    getBanners()
  ]);
  const latestProduct = recentlyAdded[0];

  return (
    <main className="pt-24 bg-background">
      {/* 2. Dynamic Hero Slider Section */}
      <HeroSlider banners={banners} />

      {/* 3. Shop by Category (Refined Grid) */}
      <section className="py-48 px-10 max-w-[1440px] mx-auto overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-[1px] bg-brand-accent"></div>
              <span className="font-label text-brand-accent text-[10px] tracking-[0.4em] font-black uppercase block">The Collection</span>
            </div>
            <h2 className="font-headline text-5xl md:text-6xl font-black text-primary tracking-tight leading-tight">
              Curated Spaces.
            </h2>
          </div>
          <Link href="/products" className="group flex items-center gap-4 text-primary font-black text-[10px] tracking-[0.3em] uppercase transition-all duration-500 hover:text-brand-accent">
            View All Categories
            <div className="w-10 h-10 rounded-full border border-outline/10 flex items-center justify-center group-hover:bg-brand-accent group-hover:border-brand-accent transition-all">
              <span className="material-symbols-outlined text-sm group-hover:text-white transition-colors">east</span>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {categories.slice(0, 5).map((cat: Category, index: number) => (
            <MotionItem key={cat.id} delay={index * 0.1}>
              <CategoryCard
                title={cat.name}
                image={cat.image}
                link={`/category/${cat.id}`}
              />
            </MotionItem>
          ))}
        </div>
      </section>

      {/* 4. Signature Masterpieces Section */}
      {signatureMasterpieces.length > 0 && (
        <section className="bg-white border-y border-outline/5 py-48">
          <div className="max-w-[1440px] mx-auto px-10">
            <MotionSection className="text-center mb-32">
              <span className="font-label text-brand-accent text-[10px] tracking-[0.5em] font-black uppercase mb-6 block">Our Legacy</span>
              <h2 className="font-headline text-5xl md:text-7xl font-black text-primary tracking-tighter">
                Signature Masterpieces.
              </h2>
            </MotionSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
              {signatureMasterpieces.slice(0, 8).map((product: Product, index: number) => (
                <MotionItem key={product.id} delay={index * 0.1}>
                  <ProductCard {...product} />
                </MotionItem>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Recently Added Products */}
      <section className="py-48 px-10 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-[1px] bg-brand-accent"></div>
              <span className="font-label text-brand-accent text-[10px] tracking-[0.4em] font-black uppercase block">New Arrivals</span>
            </div>
            <h2 className="font-headline text-5xl md:text-6xl font-black text-primary tracking-tight leading-tight">
              Recent Additions.
            </h2>
          </div>
          <Link href="/products" className="group flex items-center gap-4 text-primary font-black text-[10px] tracking-[0.3em] uppercase transition-all duration-500 hover:text-brand-accent">
            Explore All
            <div className="w-10 h-10 rounded-full border border-outline/10 flex items-center justify-center group-hover:bg-brand-accent group-hover:border-brand-accent transition-all">
              <span className="material-symbols-outlined text-sm group-hover:text-white transition-colors">east</span>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
          {recentlyAdded.slice(0, 4).map((product: Product, index: number) => (
            <MotionItem key={product.id} delay={index * 0.15}>
              <ProductCard {...product} />
            </MotionItem>
          ))}
        </div>
      </section>

      {/* 6. Why Choose LIVO? (Light Clean Section) */}
      <section className="bg-surface-container-low/40 border-y border-outline/5 py-48 px-10">
        <div className="max-w-[1440px] mx-auto">
          <MotionSection className="text-center mb-32">
            <span className="font-label text-brand-accent text-[10px] tracking-[0.5em] font-black uppercase mb-6 block">Why Choose LIVO?</span>
            <h2 className="font-headline text-5xl md:text-6xl font-black text-primary tracking-tight leading-tight">
              Crafting the Extraordinary.
            </h2>
          </MotionSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
            <MotionItem delay={0.1}>
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-full bg-brand-accent/5 flex items-center justify-center text-brand-accent">
                  <span className="material-symbols-outlined text-2xl font-light">verified</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-primary tracking-tight">Premium Quality</h3>
                <p className="text-secondary/60 font-light leading-relaxed text-sm">
                  Superior materials and strict quality standards ensure long-lasting performance.
                </p>
              </div>
            </MotionItem>
            <MotionItem delay={0.2}>
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-full bg-brand-accent/5 flex items-center justify-center text-brand-accent">
                  <span className="material-symbols-outlined text-2xl font-light">palette</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-primary tracking-tight">Modern Designs</h3>
                <p className="text-secondary/60 font-light leading-relaxed text-sm">
                  Elegant and contemporary collections inspired by global trends.
                </p>
              </div>
            </MotionItem>
            <MotionItem delay={0.3}>
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-full bg-brand-accent/5 flex items-center justify-center text-brand-accent">
                  <span className="material-symbols-outlined text-2xl font-light">settings_suggest</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-primary tracking-tight">Reliable Performance</h3>
                <p className="text-secondary/60 font-light leading-relaxed text-sm">
                  Products engineered for durability, comfort, and everyday convenience.
                </p>
              </div>
            </MotionItem>
            <MotionItem delay={0.4}>
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-full bg-brand-accent/5 flex items-center justify-center text-brand-accent">
                  <span className="material-symbols-outlined text-2xl font-light">payments</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-primary tracking-tight">Affordable Excellence</h3>
                <p className="text-secondary/60 font-light leading-relaxed text-sm">
                  Premium-quality home solutions at prices accessible to everyone.
                </p>
              </div>
            </MotionItem>
          </div>
        </div>
      </section>

      {/* 7. Why Choose Livo (Clean Minimalist) */}
      <section className="bg-primary py-48 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-white/[0.02] -skew-x-12 transform translate-x-1/2"></div>
        <div className="max-w-[1440px] mx-auto px-10 relative z-10">
          <MotionSection className="text-left mb-32 max-w-3xl">
            <span className="font-label text-brand-accent text-[10px] tracking-[0.5em] font-black uppercase mb-8 block">The Livo Standard</span>
            <h2 className="font-headline text-5xl md:text-7xl font-black tracking-tight leading-[0.9] mb-12">
              Engineering Eternity.
            </h2>
            <p className="text-white/40 text-xl font-light leading-relaxed max-w-xl">
              Where architectural precision meets sensory comfort. We define the future of living through timeless hardware.
            </p>
          </MotionSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
            <MotionItem delay={0.1}>
              <div className="group">
                <span className="text-5xl font-black text-brand-accent/20 mb-10 block font-headline group-hover:text-brand-accent transition-colors duration-500">01</span>
                <h3 className="font-headline text-2xl font-bold mb-6 tracking-tight">Mission</h3>
                <p className="text-white/40 font-light leading-relaxed text-base group-hover:text-white/60 transition-colors">
                  To provide high-quality, durable, and stylish home solution products that make modern living accessible and affordable for everyone.
                </p>
              </div>
            </MotionItem>
            <MotionItem delay={0.2}>
              <div className="group">
                <span className="text-5xl font-black text-brand-accent/20 mb-10 block font-headline group-hover:text-brand-accent transition-colors duration-500">02</span>
                <h3 className="font-headline text-2xl font-bold mb-6 tracking-tight">Vision</h3>
                <p className="text-white/40 font-light leading-relaxed text-base group-hover:text-white/60 transition-colors">
                  To become one of the most trusted and preferred brands in sanitaryware and home solutions through innovation, quality, and customer satisfaction.
                </p>
              </div>
            </MotionItem>
            <MotionItem delay={0.3}>
              <div className="group">
                <span className="text-5xl font-black text-brand-accent/20 mb-10 block font-headline group-hover:text-brand-accent transition-colors duration-500">03</span>
                <h3 className="font-headline text-2xl font-bold mb-6 tracking-tight">Values</h3>
                <p className="text-white/40 font-light leading-relaxed text-base group-hover:text-white/60 transition-colors">
                  Grounded in honesty and customer trust, we uphold the highest manufacturing standards while continuously innovating to bring modern, efficient products to the global market.
                </p>
              </div>
            </MotionItem>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button (Discreet) */}
      <a
        className="fixed bottom-10 right-10 z-50 bg-white p-5 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 border border-outline/10 group"
        href={getWhatsAppLink(DEFAULT_INQUIRY_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366" className="group-hover:scale-110 transition-transform"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
        <span className="absolute right-full mr-4 bg-white text-primary text-[10px] font-black py-2 px-4 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity uppercase tracking-widest whitespace-nowrap">Concierge</span>
      </a>
    </main >
  );
}
