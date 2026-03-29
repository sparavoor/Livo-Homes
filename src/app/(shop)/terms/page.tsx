export default function TermsPage() {
  return (
    <div className="container mx-auto px-8 py-24 pt-32 max-w-4xl min-h-[70vh]">
      <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-8">Terms of Service</h1>
      <div className="bg-surface-container-lowest rounded-2xl p-10 border border-outline-variant/30 shadow-sm">
        <p className="text-secondary leading-relaxed mb-6">
          By accessing the Livo Homes catalog, you agree to our terms of operational guidelines, sales contracts, and distribution policies.
        </p>
        <p className="text-secondary leading-relaxed">
          All architectural dimensions and material specs are subject to stringent quality checks, but we reserve the right to modify specifications for product enhancements.
        </p>
      </div>
    </div>
  );
}
