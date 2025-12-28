import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_BUSINESS_NAME} - Fresh Cakes in ${process.env.NEXT_PUBLIC_CITY_NAME}`,
  description: `Order fresh custom cakes in ${process.env.NEXT_PUBLIC_CITY_NAME}. Home delivery & COD available.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen bg-gray-50">{children}</main>
      </body>
    </html>
  );
}
