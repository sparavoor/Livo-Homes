export default function ContactPage() {
  return (
    <div className="container mx-auto px-8 py-24 pt-32 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div>
          <span className="text-primary uppercase tracking-[0.3em] font-label text-xs">Reach Out</span>
          <h1 className="text-5xl font-headline font-extrabold text-on-surface tracking-tight mt-4 mb-8">Get in Touch</h1>
          <p className="text-secondary text-lg mb-10">Connect with our architectural consultants to discuss your next premium residential project.</p>

          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
              <div>
                <h4 className="font-headline font-bold text-on-surface">LAGO Global Headquarters</h4>
                <p className="text-secondary mt-1">Kottappuram,<br />Malappuram, Kerala,<br />India-673637</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">mail</span>
              <div>
                <h4 className="font-headline font-bold text-on-surface">Email Us</h4>
                <p className="text-secondary mt-1">lagoinfo@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-10 border border-outline-variant/30 shadow-sm">
          <form className="flex flex-col gap-6">
            <div>
              <label className="block font-semibold text-on-surface-variant text-sm mb-2">Name</label>
              <input type="text" className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="block font-semibold text-on-surface-variant text-sm mb-2">Email</label>
              <input type="email" className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="block font-semibold text-on-surface-variant text-sm mb-2">Project Details</label>
              <textarea rows={4} className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-sm resize-none"></textarea>
            </div>
            <button className="bg-primary text-white w-full py-5 rounded-sm font-headline font-black text-[12px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all duration-700 active:scale-95 mt-8 shadow-2xl flex items-center justify-center gap-3">
              <span className="material-symbols-outlined text-[18px]">send</span>
              Dispatch Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
