'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { Bell, Package, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from './ToastContext';

interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'product' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  orderId?: string;
  productId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { showInfo, showSuccess } = useToast();

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Real-time listener for user notifications
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() } as Notification);
      });

      // Sort by date
      notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);

      // Show toast for new unread notifications
      const unreadNotifs = notifs.filter(n => !n.read);
      if (unreadNotifs.length > 0 && unreadNotifs.length <= 3) {
        unreadNotifs.forEach(notif => {
          if (notif.type === 'order') {
            showInfo(`Order Update: ${notif.message}`);
          } else if (notif.type === 'product') {
            showSuccess(`New Product: ${notif.message}`);
          }
        });
      }
    });

    return () => unsubscribe();
  }, [user, showInfo, showSuccess]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifs.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
      
      {/* Notification Bell Badge */}
      {user && (
        <NotificationBell 
          count={unreadCount} 
          notifications={notifications.slice(0, 5)} 
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />
      )}
    </NotificationContext.Provider>
  );
}

function NotificationBell({ 
  count, 
  notifications, 
  onMarkAsRead,
  onMarkAllAsRead 
}: { 
  count: number; 
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}) {
  const [show, setShow] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package size={18} className="text-blue-600" />;
      case 'product':
        return <CheckCircle size={18} className="text-green-600" />;
      default:
        return <Bell size={18} className="text-gray-600" />;
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50">
      <button
        onClick={() => setShow(!show)}
        className="relative bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <Bell size={24} className="text-gray-700" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {show && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <h3 className="font-bold text-lg">Notifications</h3>
            {count > 0 && (
              <button
                onClick={() => {
                  onMarkAllAsRead();
                  setShow(false);
                }}
                className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkAsRead(notif.id);
                    setShow(false);
                  }}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${
                    !notif.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1">{notif.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
