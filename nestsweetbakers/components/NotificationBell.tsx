'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Bell, Package, Gift, MessageSquare, X, Check } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'order' | 'custom_request' | 'review';
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: any;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Listen for new orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const orderNotifications: Notification[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'order',
          title: 'New Order',
          message: `Order from ${data.customerName}`,
          link: '/admin/orders',
          read: false,
          createdAt: data.createdAt,
        };
      });

      // eslint-disable-next-line react-hooks/immutability
      updateNotifications(orderNotifications);
    });

    // Listen for custom requests
    const requestsQuery = query(
      collection(db, 'customRequests'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requestNotifications: Notification[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'custom_request',
          title: 'New Custom Request',
          message: `Request from ${data.customerName}`,
          link: '/admin/custom-requests',
          read: false,
          createdAt: data.createdAt,
        };
      });

      updateNotifications(requestNotifications);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeRequests();
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateNotifications = (newNotifications: Notification[]) => {
    setNotifications(prev => {
      const merged = [...newNotifications, ...prev];
      const unique = merged.filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
      );
      const sorted = unique.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date();
        return timeB.getTime() - timeA.getTime();
      }).slice(0, 10);
      
      setUnreadCount(sorted.filter(n => !n.read).length);
      return sorted;
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package size={20} className="text-green-600" />;
      case 'custom_request':
        return <Gift size={20} className="text-pink-600" />;
      case 'review':
        return <MessageSquare size={20} className="text-blue-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell size={24} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border-2 border-gray-100 z-50 animate-scale-up">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50">
            <div>
              <h3 className="font-bold text-lg text-gray-800">Notifications</h3>
              <p className="text-sm text-gray-600">{unreadCount} unread</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-1"
              >
                <Check size={16} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 font-medium">No notifications</p>
                <p className="text-sm text-gray-400 mt-1">You&apos;re all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.link}
                    onClick={() => {
                      markAsRead(notification.id);
                      setShowDropdown(false);
                    }}
                    className={`block p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-pink-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        !notification.read ? 'bg-pink-100' : 'bg-gray-100'
                      }`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-semibold text-sm ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-pink-600 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(notification.createdAt)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <Link
              href="/admin/orders"
              onClick={() => setShowDropdown(false)}
              className="block text-center text-sm font-semibold text-pink-600 hover:text-pink-700 py-2"
            >
              View All Orders →
            </Link>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
