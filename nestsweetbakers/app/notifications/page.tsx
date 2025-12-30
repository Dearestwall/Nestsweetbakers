'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Bell, Package, Cake, CheckCircle, XCircle, Clock, 
  Trash2, Check, Filter, Loader2, ShoppingBag, Gift 
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'product' | 'general' | 'custom_request' | 'review';
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
  orderId?: string;
  productId?: string;
  requestId?: string;
  imageUrl?: string;
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      } as Notification));

      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user, showError]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
      });

      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      
      await Promise.all(
        unreadNotifications.map(notif =>
          updateDoc(doc(db, 'notifications', notif.id), { read: true })
        )
      );

      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      showSuccess('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      showError('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      setNotifications(notifications.filter(n => n.id !== notificationId));
      showSuccess('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showError('Failed to delete notification');
    }
  };

  const deleteAllRead = async () => {
    if (!confirm('Delete all read notifications?')) return;

    try {
      const readNotifications = notifications.filter(n => n.read);
      
      await Promise.all(
        readNotifications.map(notif =>
          deleteDoc(doc(db, 'notifications', notif.id))
        )
      );

      setNotifications(notifications.filter(n => !n.read));
      showSuccess('Read notifications deleted');
    } catch (error) {
      console.error('Error deleting notifications:', error);
      showError('Failed to delete notifications');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="text-blue-600" size={24} />;
      case 'product':
        return <Cake className="text-pink-600" size={24} />;
      case 'custom_request':
        return <Gift className="text-purple-600" size={24} />;
      case 'review':
        return <CheckCircle className="text-green-600" size={24} />;
      default:
        return <Bell className="text-gray-600" size={24} />;
    }
  };

  const getNotificationLink = (notif: Notification) => {
    if (notif.orderId) return `/orders`;
    if (notif.productId) return `/cakes/${notif.productId}`;
    if (notif.requestId) return `/orders`;
    return null;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-pink-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Bell className="text-pink-600" size={32} />
              <h1 className="text-3xl md:text-4xl font-bold">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-gray-600">Stay updated with your orders and new products</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  filter === 'all'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  filter === 'unread'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  filter === 'read'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Read ({notifications.length - unreadCount})
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-semibold text-sm"
                >
                  <Check size={16} />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              {notifications.filter(n => n.read).length > 0 && (
                <button
                  onClick={deleteAllRead}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-semibold text-sm"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Delete read</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Bell className="mx-auto mb-4 text-gray-300" size={64} />
            <h3 className="text-xl font-bold mb-2">No notifications</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'unread' 
                ? "You're all caught up!" 
                : "You don't have any notifications yet"}
            </p>
            <Link
              href="/cakes"
              className="inline-block bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-full hover:from-pink-700 hover:to-purple-700 transition font-semibold"
            >
              Browse Cakes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notif) => {
              const link = getNotificationLink(notif);
              
              const NotificationContent = (
                <div
                  className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer ${
                    !notif.read ? 'border-l-4 border-pink-600' : ''
                  }`}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                >
                  <div className="p-4 md:p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-full flex-shrink-0 ${
                        !notif.read ? 'bg-pink-100' : 'bg-gray-100'
                      }`}>
                        {getNotificationIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-bold text-lg">{notif.title}</h3>
                          {!notif.read && (
                            <span className="w-3 h-3 bg-pink-600 rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-3">{notif.message}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {notif.createdAt.toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {link && (
                    <div className="bg-gray-50 px-6 py-3 text-center">
                      <span className="text-pink-600 font-semibold text-sm">
                        Click to view details →
                      </span>
                    </div>
                  )}
                </div>
              );

              return link ? (
                <Link key={notif.id} href={link}>
                  {NotificationContent}
                </Link>
              ) : (
                <div key={notif.id}>{NotificationContent}</div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
