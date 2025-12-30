'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Package, Clock, CheckCircle, XCircle, Loader2, Truck, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Order {
  id: string;
  cakeName: string;
  cakeImage?: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryDate: string;
  customization?: string;
  createdAt: any;
  updatedAt?: any;
}

interface CustomRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  occasion: string;
  flavor: string;
  size: string;
  design: string;
  budget: string;
  deliveryDate: string;
  message?: string;
  referenceImages?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  createdAt: any;
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'custom'>('orders');

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      } as Order));

      setOrders(ordersData);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      if (error.code === 'permission-denied') {
        console.error('Permission denied - check Firestore rules');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchCustomRequests = useCallback(async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'customRequests'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      } as CustomRequest));

      setCustomRequests(requestsData);
    } catch (error: any) {
      console.error('Error fetching custom requests:', error);
      if (error.code === 'permission-denied') {
        console.error('Permission denied - Update Firestore rules!');
      }
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchCustomRequests();
    }
  }, [user, fetchOrders, fetchCustomRequests]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-600" size={20} />;
      case 'processing':
        return <Truck className="text-blue-600" size={20} />;
      case 'completed':
      case 'approved':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <Package className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Orders</h1>
          <p className="text-gray-600">Track your cake orders and custom requests</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Package className="inline mr-2" size={20} />
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'custom'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calendar className="inline mr-2" size={20} />
            Custom Requests ({customRequests.length})
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
                <Package className="mx-auto mb-4 text-gray-300" size={64} />
                <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">Start ordering delicious cakes today!</p>
                <Link
                  href="/cakes"
                  className="inline-block bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-full hover:from-pink-700 hover:to-purple-700 transition font-semibold"
                >
                  Browse Cakes
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                      {order.cakeImage && (
                        <div className="w-full md:w-32 h-32 flex-shrink-0 relative rounded-xl overflow-hidden">
                          <Image
                            src={order.cakeImage}
                            alt={order.cakeName}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold mb-2">{order.cakeName}</h3>
                            <p className="text-gray-600 text-sm mb-1">Order ID: {order.id.slice(0, 8)}</p>
                            <p className="text-gray-600 text-sm">
                              {order.createdAt.toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>

                          <div className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 font-semibold whitespace-nowrap text-sm ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-gray-500">Quantity</p>
                            <p className="font-semibold">{order.quantity} kg</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total</p>
                            <p className="font-semibold text-pink-600 text-lg">₹{order.totalPrice}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Delivery Date</p>
                            <p className="font-semibold">{new Date(order.deliveryDate).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Contact</p>
                            <p className="font-semibold">{order.customerPhone}</p>
                          </div>
                        </div>

                        {order.customization && (
                          <div className="bg-gray-50 rounded-lg p-3 text-sm mb-3">
                            <p className="text-gray-500 mb-1">Special Instructions:</p>
                            <p className="text-gray-700">{order.customization}</p>
                          </div>
                        )}

                        {order.deliveryAddress && (
                          <div className="text-sm">
                            <p className="text-gray-500">Delivery Address:</p>
                            <p className="text-gray-700">{order.deliveryAddress}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between text-xs">
                      <div className={`flex items-center gap-2 ${order.status !== 'cancelled' ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle size={16} />
                        <span className="hidden sm:inline">Placed</span>
                      </div>
                      <div className={`flex items-center gap-2 ${order.status === 'processing' || order.status === 'completed' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <Truck size={16} />
                        <span className="hidden sm:inline">Processing</span>
                      </div>
                      <div className={`flex items-center gap-2 ${order.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle size={16} />
                        <span className="hidden sm:inline">Delivered</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Custom Requests Tab */}
        {activeTab === 'custom' && (
          <div className="space-y-6">
            {customRequests.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
                <Calendar className="mx-auto mb-4 text-gray-300" size={64} />
                <h3 className="text-xl font-bold mb-2">No custom requests yet</h3>
                <p className="text-gray-600 mb-6">Design your dream cake with us!</p>
                <Link
                  href="/custom-cakes"
                  className="inline-block bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-full hover:from-pink-700 hover:to-purple-700 transition font-semibold"
                >
                  Request Custom Cake
                </Link>
              </div>
            ) : (
              customRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2">{request.occasion} Cake</h3>
                        <p className="text-gray-600 text-sm mb-1">Request ID: {request.id.slice(0, 8)}</p>
                        <p className="text-gray-600 text-sm">
                          {request.createdAt.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>

                      <div className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 font-semibold whitespace-nowrap text-sm ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">Flavor</p>
                        <p className="font-semibold">{request.flavor}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Size</p>
                        <p className="font-semibold">{request.size}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Budget</p>
                        <p className="font-semibold text-pink-600">₹{request.budget}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Delivery Date</p>
                        <p className="font-semibold">{new Date(request.deliveryDate).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-gray-500">Contact</p>
                        <p className="font-semibold">{request.phone}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 text-sm mb-4">
                      <p className="text-gray-500 mb-1 font-semibold">Design Details:</p>
                      <p className="text-gray-700">{request.design}</p>
                    </div>

                    {request.message && (
                      <div className="bg-blue-50 rounded-lg p-3 text-sm mb-4">
                        <p className="text-gray-500 mb-1 font-semibold">Additional Message:</p>
                        <p className="text-gray-700">{request.message}</p>
                      </div>
                    )}

                    {request.referenceImages && request.referenceImages.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2 font-semibold">Reference Images:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {request.referenceImages.map((url, idx) => (
                            <div key={idx} className="relative h-24 rounded-lg overflow-hidden">
                              <Image
                                src={url}
                                alt={`Reference ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="150px"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="bg-yellow-50 px-4 sm:px-6 py-3 text-sm text-yellow-800">
                      ⏳ Our team will contact you soon to discuss your custom cake design!
                    </div>
                  )}

                  {request.status === 'approved' && (
                    <div className="bg-green-50 px-4 sm:px-6 py-3 text-sm text-green-800">
                      ✓ Your custom cake request has been approved! We&apos;ll start working on it.
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
