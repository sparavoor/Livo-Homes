'use client';
import Link from 'next/link';

export default function CategoryCard({ title, image, link }: { title: string, image: string, link: string }) {
  return (
    <div className="group relative h-[400px] overflow-hidden rounded-lg bg-surface-container-low border border-outline/5 transition-all duration-700 hover:shadow-2xl">
      <Link href={link} className="block w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          alt={title} 
          className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s] ease-[0.19,1,0.22,1]" 
          src={image} 
        />
        
        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
        
        <div className="absolute bottom-0 left-0 p-10 w-full z-10">
          <p className="text-brand-accent uppercase tracking-[0.5em] text-[8px] font-black mb-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
            Curated Space
          </p>
          <h3 className="text-white text-2xl font-headline font-bold tracking-tight mb-4 group-hover:text-brand-accent transition-colors duration-500">
            {title}
          </h3>
          <div className="w-12 h-[1px] bg-brand-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700 delay-100"></div>
        </div>
      </Link>
    </div>
  );
}
