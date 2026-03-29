import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-surface">{children}</main>
      <Footer />
    </div>
  );
}
