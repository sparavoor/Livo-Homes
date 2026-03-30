import { AuthProvider } from '@/context/auth-context';
import type { Metadata } from "next";

import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: 'swap' });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: 'swap' });

export const metadata: Metadata = {
  title: "Livo Homes | Architectural Excellence",
  description: "Premium fixtures and architectural elements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background font-body text-primary selection:bg-brand-accent selection:text-white min-h-screen antialiased">
        <AuthProvider>
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}
