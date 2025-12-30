'use client';

import Link from 'next/link';
import Image from 'next/image'; // ✅ ADD THIS IMPORT
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, X, ChevronDown, Heart, Shield, LayoutDashboard } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { cartCount, isHydrated } = useCart();
  const { user, isAdmin, isSuperAdmin, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSearchOpen(false);
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/cakes', label: 'Cakes' },
    { href: '/custom-cakes', label: 'Custom Cakes' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setUserDropdownOpen(false);
    router.push('/');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-white/95 backdrop-blur-lg shadow-2xl py-3' : 'bg-white shadow-md py-4'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group relative z-10">
              <div className={`transition-all duration-500 ${scrolled ? 'text-4xl' : 'text-5xl'}`}>
                <span className="inline-block group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                  🍰
                </span>
              </div>
              <div className="overflow-hidden">
                <span className={`font-bold text-pink-600 group-hover:text-pink-700 transition-all duration-300 inline-block group-hover:translate-x-1 ${
                  scrolled ? 'text-2xl' : 'text-3xl'
                }`}>
                  NestSweets
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 font-medium text-gray-700 hover:text-pink-600 transition-all duration-300 group overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="relative z-10">{link.label}</span>
                  <span className="absolute inset-0 bg-pink-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></span>
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-full hover:bg-pink-50 transition-all duration-300 transform hover:scale-110 ${
                  searchOpen ? 'bg-pink-100 text-pink-600 rotate-90' : 'text-gray-700'
                }`}
                aria-label="Search"
              >
                <Search size={scrolled ? 20 : 22} className="transition-all duration-300" />
              </button>

              {/* Wishlist */}
              <button
                className="hidden md:flex p-2 rounded-full hover:bg-pink-50 transition-all duration-300 transform hover:scale-110 text-gray-700 hover:text-pink-600"
                aria-label="Wishlist"
              >
                <Heart size={scrolled ? 20 : 22} className="transition-all duration-300" />
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-full hover:bg-pink-50 transition-all duration-300 transform hover:scale-110 group"
              >
                <ShoppingCart 
                  size={scrolled ? 20 : 22} 
                  className="text-gray-700 group-hover:text-pink-600 transition-all duration-300"
                />
                {isHydrated && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse shadow-lg">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-pink-50 transition-all duration-300 transform hover:scale-105 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                      {user.photoURL ? (
                        <Image 
                          src={user.photoURL} 
                          alt={user.displayName || 'User'} 
                          width={32}
                          height={32}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.displayName?.charAt(0) || 'U'
                      )}
                      {isAdmin && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                          <Shield size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-pink-600 transition-colors max-w-[100px] truncate hidden xl:block">
                      {user.displayName?.split(' ')[0]}
                    </span>
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-2 z-50 animate-slide-up border border-gray-100">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-800 truncate">{user.displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          {isSuperAdmin && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full font-semibold">
                              Super Admin
                            </span>
                          )}
                          {isAdmin && !isSuperAdmin && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full font-semibold">
                              Admin
                            </span>
                          )}
                        </div>

                        {/* Admin Panel Access */}
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-all duration-200 group border-b border-gray-100"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <LayoutDashboard size={18} className="text-purple-600 group-hover:text-purple-700 transition-colors" />
                            <span className="text-purple-600 group-hover:text-purple-700 transition-colors font-semibold">
                              Admin Panel
                            </span>
                          </Link>
                        )}

                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition-all duration-200 group"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <User size={18} className="text-gray-600 group-hover:text-pink-600 transition-colors" />
                          <span className="text-gray-700 group-hover:text-pink-600 transition-colors">My Profile</span>
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition-all duration-200 group"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <ShoppingCart size={18} className="text-gray-600 group-hover:text-pink-600 transition-colors" />
                          <span className="text-gray-700 group-hover:text-pink-600 transition-colors">My Orders</span>
                        </Link>
                        <div className="border-t border-gray-100 mt-2">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-all duration-200 w-full text-left group"
                          >
                            <span className="text-red-600 font-medium">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex bg-gradient-to-r from-pink-600 to-purple-600 text-white px-5 py-2 rounded-full hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-pink-50 transition-all duration-300 transform hover:scale-110 relative"
                aria-label="Menu"
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute top-1 left-0 w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
                    mobileMenuOpen ? 'rotate-45 top-3' : ''
                  }`}></span>
                  <span className={`absolute top-3 left-0 w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
                    mobileMenuOpen ? 'opacity-0' : ''
                  }`}></span>
                  <span className={`absolute top-5 left-0 w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
                    mobileMenuOpen ? '-rotate-45 top-3' : ''
                  }`}></span>
                </div>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className={`overflow-hidden transition-all duration-500 ${
            searchOpen ? 'max-h-20 mt-4' : 'max-h-0'
          }`}>
            <div className="relative animate-slide-up">
              <input
                type="text"
                placeholder="Search for cakes..."
                className="w-full px-5 py-3 pl-12 border-2 border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 shadow-lg"
                autoFocus={searchOpen}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Keep all mobile menu code as is, just fix the image below */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className={`fixed top-0 right-0 bottom-0 w-80 bg-white z-50 lg:hidden transform transition-transform duration-500 ease-out shadow-2xl ${
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="p-6 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🍰</span>
                <span className="font-bold text-xl">Menu</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-300"
              >
                <X size={24} />
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-3 py-3 px-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-pink-600 font-bold text-lg relative overflow-hidden">
                  {user.photoURL ? (
                    <Image 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      width={48}
                      height={48}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user.displayName?.charAt(0) || 'U'
                  )}
                  {isAdmin && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                      <Shield size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{user.displayName}</p>
                  <p className="text-xs opacity-90 truncate">{user.email}</p>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-white text-pink-600 rounded-xl font-semibold hover:bg-pink-50 transition-all duration-300"
              >
                <User size={20} />
                Sign In
              </Link>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-all duration-300 group font-medium text-purple-700 border border-purple-200"
              >
                <LayoutDashboard size={20} className="text-purple-600" />
                Admin Panel
              </Link>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-pink-50 transition-all duration-300 group font-medium text-gray-700 hover:text-pink-600"
              >
                <span className="w-2 h-2 bg-pink-400 rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                {link.label}
              </Link>
            ))}

            {user && (
              <>
                <div className="border-t border-gray-200 my-4"></div>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-pink-50 transition-all duration-300 group font-medium text-gray-700 hover:text-pink-600"
                >
                  <User size={20} className="text-gray-400 group-hover:text-pink-600 transition-colors" />
                  My Profile
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-pink-50 transition-all duration-300 group font-medium text-gray-700 hover:text-pink-600"
                >
                  <ShoppingCart size={20} className="text-gray-400 group-hover:text-pink-600 transition-colors" />
                  My Orders
                </Link>
              </>
            )}
          </nav>

          <div className="p-4 border-t border-gray-200 space-y-2">
            {user && (
              <button
                onClick={handleSignOut}
                className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all duration-300"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
