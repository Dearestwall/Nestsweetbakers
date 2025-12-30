'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    customRequests: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsSnap, ordersSnap, requestsSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'customRequests')),
        getDocs(collection(db, 'users')),
      ]);

      const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const pendingCount = orders.filter((o: any) => o.status === 'pending').length;
      const revenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

      // Get recent orders
      const recentOrdersQuery = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentOrdersSnap = await getDocs(recentOrdersQuery);
      const recent = recentOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setStats({
        totalProducts: productsSnap.size,
        totalOrders: ordersSnap.size,
        pendingOrders: pendingCount,
        totalRevenue: revenue,
        customRequests: requestsSnap.size,
        totalUsers: usersSnap.size,
      });

      setRecentOrders(recent);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      link: '/admin/products',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'from-green-500 to-green-600',
      link: '/admin/orders',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      link: '/admin/orders',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      link: '/admin/orders',
    },
    {
      title: 'Custom Requests',
      value: stats.customRequests,
      icon: TrendingUp,
      color: 'from-pink-500 to-pink-600',
      link: '/admin/custom-requests',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      link: '/admin/users',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.link}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="text-white" size={28} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
          <Link href="/admin/orders" className="text-pink-600 hover:text-pink-700 font-medium text-sm">
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent orders</p>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{order.customerName}</p>
                  <p className="text-sm text-gray-600">{order.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">₹{order.totalAmount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
