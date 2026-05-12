export default function GalleryPage() {
  const images = [
    { src: '/images/hero1.png', title: 'Modern Living', category: 'Interior' },
    { src: '/images/hero2.png', title: 'Minimalist Kitchen', category: 'Kitchen' },
    { src: '/images/hero1.png', title: 'Luxury Bathroom', category: 'Bath' },
    { src: '/images/hero2.png', title: 'Smart Home Automation', category: 'Tech' },
    { src: '/images/hero1.png', title: 'Custom Closets', category: 'Storage' },
    { src: '/images/hero2.png', title: 'Architectural Lighting', category: 'Lighting' },
  ];

  return (
    <div className="container mx-auto px-8 py-24 pt-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <span className="text-primary uppercase tracking-[0.3em] font-label text-xs">Our Portfolio</span>
          <h1 className="text-5xl font-headline font-extrabold text-on-surface tracking-tight mt-4">Project Gallery</h1>
        </div>
        <div className="flex gap-4">
          <button className="text-primary font-bold border-b-2 border-primary pb-1">All Projects</button>
          <button className="text-secondary font-bold hover:text-on-surface transition-colors pb-1">Residential</button>
          <button className="text-secondary font-bold hover:text-on-surface transition-colors pb-1">Commercial</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {images.map((img, i) => (
          <div key={i} className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm border border-outline-variant/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
              <span className="text-primary-container text-xs font-bold uppercase tracking-widest mb-2">{img.category}</span>
              <h3 className="text-white text-2xl font-headline font-bold">{img.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
