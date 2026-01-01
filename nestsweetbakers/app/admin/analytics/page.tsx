'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import {
  BarChart3,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  PieChart,
} from 'lucide-react';

interface Order {
  id: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | string;
  paymentMethod: 'whatsapp' | 'online' | 'cod' | string;
  createdAt: Date;
}

export default function AdminAnalyticsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { showError } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) {
      router.replace('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        // You can increase the limit if needed, but keep in mind read costs
        const q = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(500)
        );
        const snapshot = await getDocs(q);

        const data: Order[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data() as any;
          return {
            id: docSnap.id,
            total: d.total || 0,
            status: d.status || 'pending',
            paymentMethod: d.paymentMethod || 'cod',
            createdAt: d.createdAt?.toDate?.() || new Date(),
          };
        });

        setOrders(data);
      } catch (err) {
        console.error('Error loading analytics orders', err);
        showError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isAdmin, router, showError]);

  const stats = useMemo(() => {
    if (!orders.length) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0,
        last7DaysOrders: 0,
        last7DaysRevenue: 0,
        paymentMethodCounts: {} as Record<string, number>,
      };
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let totalRevenue = 0;
    let pending = 0;
    let processing = 0;
    let completed = 0;
    let cancelled = 0;
    let last7DaysOrders = 0;
    let last7DaysRevenue = 0;

    const paymentMethodCounts: Record<string, number> = {};

    for (const order of orders) {
      totalRevenue += order.total;

      switch (order.status) {
        case 'pending':
          pending++;
          break;
        case 'processing':
          processing++;
          break;
        case 'completed':
          completed++;
          break;
        case 'cancelled':
          cancelled++;
          break;
        default:
          break;
      }

      if (order.createdAt >= sevenDaysAgo) {
        last7DaysOrders++;
        last7DaysRevenue += order.total;
      }

      const pm = order.paymentMethod || 'unknown';
      paymentMethodCounts[pm] = (paymentMethodCounts[pm] || 0) + 1;
    }

    return {
      totalOrders: orders.length,
      totalRevenue,
      pending,
      processing,
      completed,
      cancelled,
      last7DaysOrders,
      last7DaysRevenue,
      paymentMethodCounts,
    };
  }, [orders]);

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-600">Checking access...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin h-8 w-8 text-pink-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Overview of orders and revenue performance.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
          <PieChart size={16} />
          <span>Last {orders.length} orders</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
            <ShoppingCart className="text-pink-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total Orders
            </p>
            <p className="text-xl font-bold text-gray-800">
              {stats.totalOrders}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <DollarSign className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total Revenue
            </p>
            <p className="text-xl font-bold text-gray-800">
              ₹{stats.totalRevenue.toFixed(0)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Clock className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Last 7 Days Orders
            </p>
            <p className="text-xl font-bold text-gray-800">
              {stats.last7DaysOrders}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <BarChart3 className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Last 7 Days Revenue
            </p>
            <p className="text-xl font-bold text-gray-800">
              ₹{stats.last7DaysRevenue.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Status Breakdown & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <BarChart3 size={18} className="text-pink-600" />
            Order Status Breakdown
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-yellow-50">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-yellow-600" />
                <span>Pending</span>
              </div>
              <span className="font-semibold text-yellow-700">
                {stats.pending}
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                <span>Processing</span>
              </div>
              <span className="font-semibold text-blue-700">
                {stats.processing}
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-50">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Completed</span>
              </div>
              <span className="font-semibold text-green-700">
                {stats.completed}
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-50">
              <div className="flex items-center gap-2">
                <XCircle size={16} className="text-red-600" />
                <span>Cancelled</span>
              </div>
              <span className="font-semibold text-red-700">
                {stats.cancelled}
              </span>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <PieChart size={18} className="text-purple-600" />
            Payment Methods
          </h2>
          {Object.keys(stats.paymentMethodCounts).length === 0 ? (
            <p className="text-xs text-gray-500">No payment data yet.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {Object.entries(stats.paymentMethodCounts).map(
                ([method, count]) => (
                  <div
                    key={method}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50"
                  >
                    <span className="capitalize text-gray-700">
                      {method === 'cod'
                        ? 'Cash on Delivery'
                        : method === 'online'
                        ? 'Online'
                        : method === 'whatsapp'
                        ? 'WhatsApp'
                        : method}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
