import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { SettingsProvider } from "@/hooks/useSettings";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'NestSweets - Premium Custom Cakes & Bakery in India',
    template: '%s | NestSweets Bakery'
  },
  description: 'Order freshly baked custom cakes for birthdays, weddings, anniversaries. Premium quality ingredients, same-day delivery available. #1 rated bakery in town.',
  keywords: ['custom cakes', 'birthday cakes', 'wedding cakes', 'online bakery', 'cake delivery', 'fresh cakes', 'custom designs', 'bakery near me'],
  authors: [{ name: 'NestSweets Bakery' }],
  creator: 'NestSweets',
  publisher: 'NestSweets Bakery',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    title: 'NestSweets - Premium Custom Cakes & Bakery',
    description: 'Order freshly baked custom cakes for all occasions. Premium quality, same-day delivery.',
    siteName: 'NestSweets Bakery',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'NestSweets Premium Cakes',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NestSweets - Premium Custom Cakes',
    description: 'Order freshly baked custom cakes for all occasions',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <meta name="theme-color" content="#ec4899" />
        <meta name="color-scheme" content="light" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Bakery",
              "name": "NestSweets Bakery",
              "image": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`,
              "description": "Premium custom cakes and bakery items",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Main Market",
                "addressLocality": "Narnaund",
                "addressRegion": "Haryana",
                "postalCode": "125039",
                "addressCountry": "IN"
              },
              "telephone": "+91-1234567890",
              "priceRange": "₹₹",
              "servesCuisine": "Bakery",
              "acceptsReservations": "True",
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                  "opens": "09:00",
                  "closes": "21:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Sunday",
                  "opens": "10:00",
                  "closes": "20:00"
                }
              ],
              "url": process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "250"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>
            <SettingsProvider>
              <CartProvider>
                <ClientLayout>{children}</ClientLayout>
              </CartProvider>
            </SettingsProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
