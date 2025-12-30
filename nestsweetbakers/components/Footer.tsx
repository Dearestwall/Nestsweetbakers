'use client';

import Link from 'next/link';
import { Instagram, Facebook, Phone, Mail, MapPin, Twitter, Youtube } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FooterContent {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  links: {
    company: Array<{ label: string; href: string }>;
    support: Array<{ label: string; href: string }>;
    legal: Array<{ label: string; href: string }>;
  };
  newsletter: {
    enabled: boolean;
    title: string;
    subtitle: string;
  };
}

export default function Footer() {
  const [content, setContent] = useState<FooterContent>({
    companyName: 'NestSweets',
    tagline: 'Crafting sweet memories with every bite. Fresh, custom-made cakes for all your celebrations.',
    phone: '+91 1234567890',
    email: 'hello@nestsweetbakers.com',
    address: 'Narnaund, Haryana, India',
    social: {
      instagram: 'https://instagram.com/nestsweetbakers',
      facebook: 'https://facebook.com/nestsweetbakers',
      twitter: 'https://twitter.com/nestsweetbakers',
      youtube: 'https://youtube.com/@nestsweetbakers',
    },
    links: {
      company: [
        { label: 'About Us', href: '/about' },
        { label: 'Our Cakes', href: '/cakes' },
        { label: 'Custom Orders', href: '/custom-cakes' },
        { label: 'Services', href: '/services' },
      ],
      support: [
        { label: 'Contact Us', href: '/contact' },
        { label: 'FAQs', href: '/faq' },
        { label: 'Delivery Info', href: '/delivery' },
        { label: 'Track Order', href: '/orders' },
      ],
      legal: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Refund Policy', href: '/refund' },
        { label: 'Cookie Policy', href: '/cookies' },
      ],
    },
    newsletter: {
      enabled: true,
      title: 'Stay Sweet with Us',
      subtitle: 'Get special offers and updates',
    },
  });

  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    async function fetchFooterContent() {
      try {
        const footerRef = collection(db, 'footerContent');
        const snapshot = await getDocs(footerRef);
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data() as FooterContent;
          setContent(data);
        }
      } catch (error) {
        console.error('Error fetching footer content:', error);
      }
    }
    fetchFooterContent();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    
    try {
      // Add newsletter subscription logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      alert('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        {/* Newsletter Section */}
        {content.newsletter.enabled && (
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 md:p-12 mb-12 shadow-2xl">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl md:text-4xl font-bold mb-3">
                {content.newsletter.title}
              </h3>
              <p className="text-pink-100 mb-6 text-lg">
                {content.newsletter.subtitle}
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/50"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="bg-white text-pink-600 px-8 py-4 rounded-full font-bold hover:bg-yellow-300 hover:text-gray-900 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-12">
          {/* About Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <span className="text-4xl group-hover:scale-110 transition-transform">🍰</span>
              <span className="text-2xl font-bold text-pink-400 group-hover:text-pink-300 transition-colors">
                {content.companyName}
              </span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {content.tagline}
            </p>
            <div className="flex space-x-3">
              {content.social.instagram && (
                <a
                  href={content.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-pink-600 p-3 rounded-full hover:bg-pink-700 transition-all transform hover:scale-110 shadow-lg hover:shadow-pink-500/50"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
              )}
              {content.social.facebook && (
                <a
                  href={content.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 p-3 rounded-full hover:bg-blue-700 transition-all transform hover:scale-110 shadow-lg hover:shadow-blue-500/50"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
              )}
              {content.social.twitter && (
                <a
                  href={content.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-sky-600 p-3 rounded-full hover:bg-sky-700 transition-all transform hover:scale-110 shadow-lg hover:shadow-sky-500/50"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
              )}
              {content.social.youtube && (
                <a
                  href={content.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 p-3 rounded-full hover:bg-red-700 transition-all transform hover:scale-110 shadow-lg hover:shadow-red-500/50"
                  aria-label="YouTube"
                >
                  <Youtube size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-pink-400">Company</h4>
            <ul className="space-y-3">
              {content.links.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-pink-400 transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-pink-400 mr-0 group-hover:mr-2 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-pink-400">Support</h4>
            <ul className="space-y-3">
              {content.links.support.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-pink-400 transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-pink-400 mr-0 group-hover:mr-2 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-pink-400">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-gray-400 group">
                <Phone size={20} className="text-pink-400 mt-0.5 group-hover:scale-110 transition-transform" />
                <a href={`tel:${content.phone}`} className="hover:text-pink-400 transition-colors">
                  {content.phone}
                </a>
              </li>
              <li className="flex items-start space-x-3 text-gray-400 group">
                <Mail size={20} className="text-pink-400 mt-0.5 group-hover:scale-110 transition-transform" />
                <a href={`mailto:${content.email}`} className="hover:text-pink-400 transition-colors break-all">
                  {content.email}
                </a>
              </li>
              <li className="flex items-start space-x-3 text-gray-400 group">
                <MapPin size={20} className="text-pink-400 mt-0.5 group-hover:scale-110 transition-transform" />
                <span>{content.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="flex flex-wrap justify-center gap-6">
            {content.links.legal.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-gray-400 hover:text-pink-400 transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400 mb-2">
            © {new Date().getFullYear()} {content.companyName}. All rights reserved.
          </p>
          <p className="text-gray-500">
            Made with <span className="text-pink-500 animate-pulse">❤️</span> by{' '}
            <a
              href="https://instagram.com/thrillyverse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 font-semibold transition-colors"
            >
              @thrillyverse
            </a>
          </p>
          <div className="mt-4 flex justify-center items-center gap-2 text-gray-500 text-sm">
            <span>🔒 Secure Payments</span>
            <span>•</span>
            <span>🚚 Fast Delivery</span>
            <span>•</span>
            <span>⭐ 4.9/5 Rating</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
