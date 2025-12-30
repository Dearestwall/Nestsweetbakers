'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Star, 
  MessageSquare, 
  Image as ImageIcon, // ✅ RENAME THIS
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Home,
  Shield
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isSuperAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace('/');
    }
  }, [user, isAdmin, router]);

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-pink-200 rounded-full animate-ping"></div>
            <div className="relative w-24 h-24 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
    { icon: MessageSquare, label: 'Custom Requests', href: '/admin/custom-requests' },
    { icon: Star, label: 'Reviews', href: '/admin/reviews' },
    { icon: ImageIcon, label: 'Hero Slides', href: '/admin/hero-slides' }, // ✅ USE RENAMED ICON
    { icon: Users, label: 'Testimonials', href: '/admin/testimonials' },
    ...(isSuperAdmin ? [{ icon: Shield, label: 'User Management', href: '/admin/users' }] : []),
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b bg-gradient-to-r from-pink-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍰</span>
                <div>
                  <span className="font-bold text-xl block">Admin Panel</span>
                  {isSuperAdmin && (
                    <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">
                      Super Admin
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden hover:bg-white/10 p-1 rounded transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-all duration-200 group text-blue-600 border border-blue-200 mb-2"
            >
              <Home size={20} className="text-blue-600" />
              <span className="font-medium">Back to Website</span>
            </Link>

            <div className="border-t border-gray-200 my-2"></div>

            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'bg-pink-50 text-pink-600 shadow-sm' 
                      : 'hover:bg-pink-50 text-gray-700'
                  }`}
                >
                  <item.icon 
                    size={20} 
                    className={`transition-colors ${
                      isActive 
                        ? 'text-pink-600' 
                        : 'text-gray-600 group-hover:text-pink-600'
                    }`}
                  />
                  <span className={`font-medium ${
                    isActive 
                      ? 'text-pink-600' 
                      : 'group-hover:text-pink-600'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-white rounded-lg shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold relative overflow-hidden">
                {user.photoURL ? (
                  <Image 
                    src={user.photoURL} 
                    alt={user.displayName || 'Admin'} 
                    width={40}
                    height={40}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.displayName?.charAt(0) || 'A'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-gray-800">{user.displayName || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm p-4 lg:hidden sticky top-0 z-30 border-b">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-pink-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            <span className="font-semibold text-gray-800">Admin Panel</span>
            <div className="w-6"></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
