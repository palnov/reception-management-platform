import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { APP_NAME } from '@/lib/constants';
import { getCurrentEmployee, toNavUser } from '@/lib/current-user';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Система управления персоналом',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentEmployee();

  return (
    <html lang="ru">
      <body className={`${inter.className} bg-zinc-50 min-h-screen`}>
        <Navbar initialUser={toNavUser(currentUser)} />
        <main className="max-w-[1700px] mx-auto px-3 sm:px-6 py-4 sm:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
