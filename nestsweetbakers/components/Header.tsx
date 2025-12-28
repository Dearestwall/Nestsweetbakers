'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/cakes', label: 'Cakes' },
    { href: '/custom-cake', label: 'Custom Order' },
    { href: '/#contact', label: 'Contact' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-pink-600">
            {process.env.NEXT_PUBLIC_BUSINESS_NAME}
          </Link>
          <div className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium ${
                  pathname === link.href ? 'text-pink-600' : 'text-gray-700 hover:text-pink-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href={`https://wa.me/${process.env.NEXT_PUBLIC_BUSINESS_PHONE}?text=Hi%20${process.env.NEXT_PUBLIC_BUSINESS_NAME},%20I%20want%20to%20place%20an%20order`}
            className="bg-green-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-600 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            Order on WhatsApp
          </Link>
        </div>
      </nav>
    </header>
  );
}
