'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, updateDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/context/ToastContext';
import { Package, Search, Filter, Download, Phone, Mail, MapPin, Calendar, Loader2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

interface Order {
  id: string;
  userId: string;
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

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt || Date.now()),
      } as Order));
      
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders
  useEffect(() => {
    let result = [...orders];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(order =>
        order.customerName?.toLowerCase().includes(search) ||
        order.customerPhone?.includes(search) ||
        order.cakeName?.toLowerCase().includes(search) ||
        order.id?.toLowerCase().includes(search)
      );
    }

    setFilteredOrders(result);
  }, [orders, statusFilter, searchTerm]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ));

      showSuccess(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order:', error);
      showError('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Phone', 'Email', 'Cake', 'Quantity', 'Total', 'Status', 'Delivery Date', 'Created At'];
    const rows = filteredOrders.map(order => [
      order.id,
      order.customerName,
      order.customerPhone,
      order.customerEmail || '',
      order.cakeName,
      order.quantity,
      order.totalPrice,
      order.status,
      order.deliveryDate,
      order.createdAt?.toLocaleDateString() || '',
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    showSuccess('Orders exported successfully');
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalPrice, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin h-12 w-12 text-pink-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all font-semibold shadow-lg"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <p className="text-gray-500 text-sm font-medium">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow-lg p-4 border-2 border-yellow-200">
          <p className="text-yellow-700 text-sm font-medium">Pending</p>
          <p className="text-2xl font-bold text-yellow-800 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-lg p-4 border-2 border-blue-200">
          <p className="text-blue-700 text-sm font-medium">Processing</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">{stats.processing}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow-lg p-4 border-2 border-green-200">
          <p className="text-green-700 text-sm font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-800 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow-lg p-4 border-2 border-red-200">
          <p className="text-red-700 text-sm font-medium">Cancelled</p>
          <p className="text-2xl font-bold text-red-800 mt-1">{stats.cancelled}</p>
        </div>
        <div className="bg-purple-50 rounded-xl shadow-lg p-4 border-2 border-purple-200">
          <p className="text-purple-700 text-sm font-medium">Revenue</p>
          <p className="text-2xl font-bold text-purple-800 mt-1">₹{stats.totalRevenue}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by customer, phone, cake name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all appearance-none bg-white"
            >
              <option value="all">All Status ({orders.length})</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label} ({orders.filter(o => o.status === status.value).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Package className="mx-auto mb-4 text-gray-300" size={64} />
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
              {/* Order Header */}
              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {order.cakeImage && (
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={order.cakeImage}
                          alt={order.cakeName}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold text-lg text-gray-800">{order.cakeName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Package size={14} className="flex-shrink-0" />
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={14} className="flex-shrink-0" />
                          {order.createdAt?.toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-2xl font-bold text-pink-600">₹{order.totalPrice}</p>
                    </div>
                    
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="p-4 md:p-6 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Eye size={18} />
                        Customer Details
                      </h4>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <Phone className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="text-gray-500">Phone</p>
                            <p className="font-semibold text-gray-800">{order.customerPhone}</p>
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="text-pink-600 hover:text-pink-700 text-xs"
                            >
                              Call Now
                            </a>
                          </div>
                        </div>

                        {order.customerEmail && (
                          <div className="flex items-start gap-3">
                            <Mail className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                            <div>
                              <p className="text-gray-500">Email</p>
                              <p className="font-semibold text-gray-800 break-all">{order.customerEmail}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <MapPin className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="text-gray-500">Delivery Address</p>
                            <p className="font-semibold text-gray-800">{order.deliveryAddress}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Calendar className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="text-gray-500">Delivery Date</p>
                            <p className="font-semibold text-gray-800">
                              {new Date(order.deliveryDate).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-800 mb-3">Order Information</h4>
                      
                      <div className="bg-white rounded-lg p-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quantity</span>
                          <span className="font-semibold">{order.quantity} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        {order.customization && (
                          <div>
                            <p className="text-gray-600 mb-1">Special Instructions:</p>
                            <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{order.customization}</p>
                          </div>
                        )}
                      </div>

                      {/* Update Status */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Update Order Status
                        </label>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={updating === order.id}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        {updating === order.id && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                            <Loader2 className="animate-spin" size={12} />
                            Updating status...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
