'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, orderBy, query, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/context/ToastContext';
import { notificationService } from '@/lib/notificationService';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Loader2, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Trash2,
  CheckSquare,
  Square,
  Grid3x3,
  List,
  Printer,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  SortAsc,
  SortDesc
} from 'lucide-react';
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
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: RefreshCw },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    id: string | string[];
    type: 'delete' | 'status';
    status?: string;
    isBulk?: boolean;
  }>({ show: false, id: '', type: 'delete', isBulk: false });
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
      showError('❌ Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter and Sort orders
  useEffect(() => {
    let result = [...orders];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      result = result.filter(order => {
        const orderDate = order.createdAt;
        
        switch (dateFilter) {
          case 'today':
            return orderDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
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

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'amount':
          comparison = a.totalPrice - b.totalPrice;
          break;
        case 'name':
          comparison = a.customerName.localeCompare(b.customerName);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredOrders(result);
  }, [orders, statusFilter, dateFilter, searchTerm, sortBy, sortOrder]);

 const updateOrderStatus = async (orderId: string, newStatus: string, skipConfirm = false) => {
  if (!skipConfirm && (newStatus === 'cancelled' || newStatus === 'completed')) {
    setConfirmModal({
      show: true,
      id: orderId,
      type: 'status',
      status: newStatus,
      isBulk: false
    });
    return;
  }

  setUpdating(orderId);
  
  try {
    const updatedOrder = orders.find(o => o.id === orderId);
    const oldStatus = updatedOrder?.status;
    
    await updateDoc(doc(db, 'orders', orderId), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus as any } : order
    ));

       if (updatedOrder && oldStatus !== newStatus && updatedOrder.userId) {
      notificationService.notifyOrderStatusChange({
        orderId,
        userId: updatedOrder.userId,
        customerName: updatedOrder.customerName,
        cakeName: updatedOrder.cakeName,
        oldStatus: oldStatus!,
        newStatus
      }).catch(err => console.error('Failed to send notification:', err));
    }

    showSuccess(`✅ Order status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating order:', error);
    showError('❌ Failed to update order status');
  } finally {
    setUpdating(null);
  }
};

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.size === 0) {
      showError('❌ Please select orders first');
      return;
    }

    try {
      const batch = writeBatch(db);
      selectedOrders.forEach(orderId => {
        batch.update(doc(db, 'orders', orderId), {
          status: newStatus,
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();

      setOrders(orders.map(order =>
        selectedOrders.has(order.id) ? { ...order, status: newStatus as any } : order
      ));

      setSelectedOrders(new Set());
      setBulkActionMode(false);
      showSuccess(`✅ ${selectedOrders.size} orders updated to ${newStatus}`);
    } catch (error) {
      console.error('Error:', error);
      showError('❌ Failed to update orders');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const batch = writeBatch(db);
      Array.from(selectedOrders).forEach(orderId => {
        batch.delete(doc(db, 'orders', orderId));
      });
      await batch.commit();

      setOrders(orders.filter(o => !selectedOrders.has(o.id)));
      setSelectedOrders(new Set());
      setBulkActionMode(false);
      showSuccess(`✅ ${selectedOrders.size} orders deleted`);
      setConfirmModal({ show: false, id: '', type: 'delete', isBulk: false });
    } catch (error) {
      console.error('Error:', error);
      showError('❌ Failed to delete orders');
    }
  };

  const toggleSelectOrder = (id: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedOrders(newSelected);
  };

  const selectAllOrders = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const printInvoice = (order: Order) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - Order #${order.id.slice(0, 8)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin: 20px 0; }
          .row { display: flex; justify-content: space-between; margin: 10px 0; }
          .total { font-size: 24px; font-weight: bold; color: #e91e63; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>NestSweet Bakers</h1>
          <p>Invoice</p>
        </div>
        <div class="details">
          <h2>Order #${order.id.slice(0, 8)}</h2>
          <div class="row"><span>Customer:</span><span>${order.customerName}</span></div>
          <div class="row"><span>Phone:</span><span>${order.customerPhone}</span></div>
          <div class="row"><span>Cake:</span><span>${order.cakeName}</span></div>
          <div class="row"><span>Quantity:</span><span>${order.quantity} kg</span></div>
          <div class="row"><span>Delivery Date:</span><span>${new Date(order.deliveryDate).toLocaleDateString()}</span></div>
          <div class="row"><span>Address:</span><span>${order.deliveryAddress}</span></div>
          <hr>
          <div class="row total"><span>Total:</span><span>₹${order.totalPrice}</span></div>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow?.document.write(printContent);
    printWindow?.document.close();
    printWindow?.print();
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

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    showSuccess('✅ Orders exported successfully');
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const StatusIcon = STATUS_OPTIONS.find(s => s.value === status)?.icon || Clock;
    return <StatusIcon size={16} />;
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
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-pink-200 rounded-full animate-ping"></div>
            <div className="relative w-24 h-24 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-semibold text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-up">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-yellow-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
              {confirmModal.type === 'delete' ? 'Delete Orders?' : 'Update Order Status?'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {confirmModal.type === 'delete' 
                ? `Are you sure you want to delete ${confirmModal.isBulk ? `${selectedOrders.size} orders` : 'this order'}? This action cannot be undone.`
                : `Update order status to "${confirmModal.status}"?`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ show: false, id: '', type: 'delete', isBulk: false })}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === 'delete') {
                    handleBulkDelete();
                  } else if (confirmModal.type === 'status' && confirmModal.status) {
                    updateOrderStatus(confirmModal.id as string, confirmModal.status, true);
                    setConfirmModal({ show: false, id: '', type: 'delete', isBulk: false });
                  }
                }}
                className="flex-1 px-4 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Orders Management
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Package size={16} />
            Manage and track all customer orders
          </p>
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
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-4 border-2 border-gray-200">
          <p className="text-gray-600 text-sm font-medium">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-4 border-2 border-yellow-200">
          <p className="text-yellow-700 text-sm font-medium">Pending</p>
          <p className="text-2xl font-bold text-yellow-800 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-4 border-2 border-blue-200">
          <p className="text-blue-700 text-sm font-medium">Processing</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">{stats.processing}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-4 border-2 border-green-200">
          <p className="text-green-700 text-sm font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-800 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg p-4 border-2 border-red-200">
          <p className="text-red-700 text-sm font-medium">Cancelled</p>
          <p className="text-2xl font-bold text-red-800 mt-1">{stats.cancelled}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-4 border-2 border-purple-200">
          <p className="text-purple-700 text-sm font-medium">Revenue</p>
          <p className="text-2xl font-bold text-purple-800 mt-1">₹{stats.totalRevenue}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label} ({orders.filter(o => o.status === status.value).length})
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="name-asc">Customer (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBulkActionMode(!bulkActionMode);
                setSelectedOrders(new Set());
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                bulkActionMode 
                  ? 'bg-pink-100 text-pink-700 border-2 border-pink-200' 
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
              }`}
            >
              <CheckSquare size={18} />
              {bulkActionMode ? 'Cancel' : 'Bulk Actions'}
            </button>

            {bulkActionMode && (
              <>
                <button
                  onClick={selectAllOrders}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold border-2 border-blue-200"
                >
                  {selectedOrders.size === filteredOrders.length ? 'Deselect All' : 'Select All'}
                </button>
                {selectedOrders.size > 0 && (
                  <>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkStatusUpdate(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold"
                    >
                      <option value="">Update Status ({selectedOrders.size})</option>
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setConfirmModal({ show: true, id: Array.from(selectedOrders), type: 'delete', isBulk: true })}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                    >
                      <Trash2 size={18} />
                      Delete ({selectedOrders.size})
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-pink-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-pink-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid3x3 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Package className="mx-auto mb-4 text-gray-300" size={64} />
          <p className="text-gray-500 text-lg font-semibold">No orders found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all ${
                selectedOrders.has(order.id) ? 'ring-4 ring-pink-500' : ''
              }`}
            >
              {/* Order Header */}
              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {bulkActionMode && (
                      <button
                        onClick={() => toggleSelectOrder(order.id)}
                        className="flex-shrink-0 mt-1"
                      >
                        {selectedOrders.has(order.id) ? (
                          <CheckSquare className="text-pink-600" size={24} />
                        ) : (
                          <Square className="text-gray-400" size={24} />
                        )}
                      </button>
                    )}
                    
                    {order.cakeImage && viewMode === 'list' && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={order.cakeImage}
                          alt={order.cakeName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold text-lg text-gray-800 truncate">{order.cakeName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">{order.customerName}</p>
                      <p className="text-xs text-gray-500">Order #{order.id.slice(0, 8)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="text-2xl font-bold text-pink-600">₹{order.totalPrice}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => printInvoice(order)}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Print Invoice"
                      >
                        <Printer size={16} />
                      </button>
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
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
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
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

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
