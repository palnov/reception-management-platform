import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Администраторы ДМЦ',
  description: 'Система управления персоналом',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-50 min-h-screen`}>
        <Navbar />
        <main className="max-w-[1600px] mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
