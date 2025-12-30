import Link from 'next/link';
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-pink-400">🍰 NestSweets</h3>
            <p className="text-gray-400">
              Crafting sweet memories with every bite. Fresh, custom-made cakes for all your celebrations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/cakes" className="text-gray-400 hover:text-pink-400">Our Cakes</Link></li>
              <li><Link href="/custom-cakes" className="text-gray-400 hover:text-pink-400">Custom Orders</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-pink-400">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-pink-400">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone size={18} />
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail size={18} />
                <span>hello@nestsweetbakers.com</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <MapPin size={18} />
                <span>Patti, Punjab, India</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/nestsweetbakers" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-pink-600 p-3 rounded-full hover:bg-pink-700 transition"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://facebook.com/nestsweetbakers" 
                target="_blank"
                rel="noopener noreferrer" 
                className="bg-pink-600 p-3 rounded-full hover:bg-pink-700 transition"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} NestSweets. All rights reserved.
          </p>
          <p className="text-gray-500 mt-2">
            Made with <span className="text-pink-500">❤️</span> by{' '}
            <a 
              href="https://instagram.com/thrillyverse" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 font-semibold"
            >
              @thrillyverse
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
