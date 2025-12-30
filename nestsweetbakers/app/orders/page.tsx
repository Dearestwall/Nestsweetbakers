'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  DollarSign, 
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Order {
  id: string;
  items: Array<{
    name: string;
    imageUrl?: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryDate: string;
  createdAt: string;
  notes?: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Order['status']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid)
      );

      const ordersSnap = await getDocs(q);
      const ordersData = ordersSnap.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ) as Order[];

      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchOrders();
  }, [user, router, fetchOrders]);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const statusConfig = {
    pending: { 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
      icon: Clock,
      bgGradient: 'from-yellow-500 to-orange-500'
    },
    processing: { 
      color: 'bg-blue-100 text-blue-800 border-blue-300', 
      icon: Package,
      bgGradient: 'from-blue-500 to-purple-500'
    },
    completed: { 
      color: 'bg-green-100 text-green-800 border-green-300', 
      icon: CheckCircle,
      bgGradient: 'from-green-500 to-emerald-500'
    },
    cancelled: { 
      color: 'bg-red-100 text-red-800 border-red-300', 
      icon: XCircle,
      bgGradient: 'from-red-500 to-pink-500'
    },
  };

  const getStatusCounts = () => ({
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-pink-200 rounded-full animate-ping"></div>
            <div className="relative w-24 h-24 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium animate-pulse">Loading your orders...</p>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-4 font-semibold group transition-all duration-300"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
            Back to Profile
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                My Orders
              </h1>
              <p className="text-gray-600">Track and manage your cake orders</p>
            </div>
            
            {/* Search */}
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={20} />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 animate-slide-up">
          {(['all', 'pending', 'processing', 'completed', 'cancelled'] as const).map((status, index) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`group relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                filter === status
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-xl'
                  : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 shadow-lg hover:shadow-xl'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="relative z-10 flex items-center gap-2">
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  filter === status
                    ? 'bg-white/20'
                    : 'bg-pink-100 text-pink-600'
                }`}>
                  {statusCounts[status]}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => {
              const StatusIcon = statusConfig[order.status].icon;
              const isExpanded = expandedOrder === order.id;
              
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 animate-slide-up border-2 border-transparent hover:border-pink-200"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Order Header */}
                  <div className={`bg-gradient-to-r ${statusConfig[order.status].bgGradient} p-6 text-white`}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium opacity-90">Order ID</span>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-mono font-bold backdrop-blur-sm">
                            {order.id.substring(0, 12)}...
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span className="font-medium">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package size={16} />
                            <span className="font-medium">{order.items.length} item(s)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`px-5 py-2.5 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center gap-2 shadow-lg ${statusConfig[order.status].color} border-2`}>
                          <StatusIcon size={18} />
                          <span className="font-bold capitalize">{order.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {order.items.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center gap-4 p-3 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl hover:shadow-lg transition-all duration-300 group"
                        >
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-xl transition-shadow">
                            <Image
                              src={item.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200'}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                              sizes="80px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-pink-600 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600">Qty: {item.quantity} kg</p>
                            <p className="font-bold text-pink-600 text-lg">₹{item.price * item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expandable Details */}
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl hover:from-pink-100 hover:to-purple-100 transition-all duration-300 font-semibold text-gray-700 hover:text-pink-600 group"
                    >
                      <span>{isExpanded ? 'Hide' : 'View'} Details</span>
                      <ChevronDown 
                        className={`transition-transform duration-300 group-hover:translate-y-1 ${
                          isExpanded ? 'rotate-180' : ''
                        }`} 
                        size={20} 
                      />
                    </button>

                    {/* Expanded Details */}
                    <div className={`overflow-hidden transition-all duration-500 ${
                      isExpanded ? 'max-h-[1000px] opacity-100 mt-6' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-pink-100">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="text-pink-500 flex-shrink-0 mt-1" size={20} />
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-1">Delivery Address</p>
                              <p className="font-medium text-gray-800">{order.deliveryAddress}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Calendar className="text-purple-500 flex-shrink-0 mt-1" size={20} />
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-1">Delivery Date</p>
                              <p className="font-medium text-gray-800">
                                {new Date(order.deliveryDate).toLocaleDateString('en-US', { 
                                  weekday: 'long',
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Phone className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-1">Contact Phone</p>
                              <a 
                                href={`tel:${order.customerPhone}`}
                                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                {order.customerPhone}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Mail className="text-green-500 flex-shrink-0 mt-1" size={20} />
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-1">Email</p>
                              <a 
                                href={`mailto:${order.customerEmail}`}
                                className="font-medium text-green-600 hover:text-green-700 hover:underline break-all"
                              >
                                {order.customerEmail}
                              </a>
                            </div>
                          </div>
                        </div>

                        {order.notes && (
                          <div className="md:col-span-2 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                            <p className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                              <span className="text-lg">📝</span>
                              Special Instructions:
                            </p>
                            <p className="text-yellow-700 leading-relaxed">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between pt-6 mt-6 border-t-2 border-dashed border-pink-200">
                      <span className="text-xl font-bold text-gray-700">Total Amount</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                        <DollarSign size={24} />
                        ₹{order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center animate-fade-in">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
              <Package size={64} className="text-pink-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              {searchTerm 
                ? 'No matching orders found' 
                : filter === 'all' 
                  ? 'No orders yet' 
                  : `No ${filter} orders`}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : "You haven't placed any orders yet. Start exploring our delicious cakes!"}
            </p>
            <Link
              href="/cakes"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-pink-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <span className="text-2xl">🍰</span>
              Browse Cakes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
