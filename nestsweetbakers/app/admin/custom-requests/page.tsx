'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/context/ToastContext';
import { 
  Trash2, Mail, Phone, Calendar, MessageSquare, CheckCircle, 
  Clock, XCircle, Image as ImageIcon, Search, Filter, Download,
  DollarSign, Cake, ChevronDown, ChevronUp, Eye, MapPin
} from 'lucide-react';
import Image from 'next/image';

interface CustomRequest {
  id: string;
  userId: string;
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
  updatedAt?: any;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  { value: 'completed', label: 'Completed', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: CheckCircle },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
];

export default function CustomRequestsPage() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const fetchRequests = useCallback(async () => {
    try {
      const q = query(collection(db, 'customRequests'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt || Date.now()),
      } as CustomRequest));
      
      setRequests(requestsData);
      setFilteredRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showError('Failed to load custom requests');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filter requests
  useEffect(() => {
    let result = [...requests];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(request => request.status === statusFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(request =>
        request.name?.toLowerCase().includes(search) ||
        request.phone?.includes(search) ||
        request.occasion?.toLowerCase().includes(search) ||
        request.id?.toLowerCase().includes(search)
      );
    }

    setFilteredRequests(result);
  }, [requests, statusFilter, searchTerm]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'customRequests', id), {
        status,
        updatedAt: serverTimestamp(),
      });

      setRequests(requests.map(request =>
        request.id === id ? { ...request, status: status as any } : request
      ));

      showSuccess(`Request status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, 'customRequests', id));
      setRequests(requests.filter(r => r.id !== id));
      showSuccess('Request deleted successfully');
    } catch (error) {
      console.error('Error deleting request:', error);
      showError('Failed to delete request');
    }
  };

  const exportToCSV = () => {
    const headers = ['Request ID', 'Name', 'Phone', 'Email', 'Occasion', 'Flavor', 'Size', 'Budget', 'Delivery Date', 'Status', 'Created At'];
    const rows = filteredRequests.map(request => [
      request.id,
      request.name,
      request.phone,
      request.email || '',
      request.occasion,
      request.flavor,
      request.size,
      request.budget,
      request.deliveryDate,
      request.status,
      request.createdAt?.toLocaleDateString() || '',
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `custom_requests_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    showSuccess('Requests exported successfully');
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const StatusIcon = STATUS_OPTIONS.find(s => s.value === status)?.icon || Clock;
    return <StatusIcon size={16} />;
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    approved: requests.filter(r => r.status === 'approved').length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Custom Cake Requests</h1>
          <p className="text-gray-600 mt-1">Manage customer custom cake designs</p>
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
          <p className="text-gray-500 text-sm font-medium">Total</p>
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
          <p className="text-green-700 text-sm font-medium">Approved</p>
          <p className="text-2xl font-bold text-green-800 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-purple-50 rounded-xl shadow-lg p-4 border-2 border-purple-200">
          <p className="text-purple-700 text-sm font-medium">Completed</p>
          <p className="text-2xl font-bold text-purple-800 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow-lg p-4 border-2 border-red-200">
          <p className="text-red-700 text-sm font-medium">Rejected</p>
          <p className="text-2xl font-bold text-red-800 mt-1">{stats.rejected}</p>
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
              placeholder="Search by name, phone, occasion..."
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
              <option value="all">All Status ({requests.length})</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label} ({requests.filter(r => r.status === status.value).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Cake className="mx-auto mb-4 text-gray-300" size={64} />
          <p className="text-gray-500 text-lg">No custom requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
              {/* Request Header */}
              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-bold text-lg text-gray-800">{request.occasion} Cake</h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <Cake size={14} className="flex-shrink-0" />
                        Request #{request.id.slice(0, 8)}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar size={14} className="flex-shrink-0" />
                        {request.createdAt?.toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="text-2xl font-bold text-pink-600">₹{request.budget}</p>
                    </div>
                    
                    <button
                      onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {expandedRequest === request.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedRequest === request.id && (
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
                            <p className="font-semibold text-gray-800">{request.phone}</p>
                            <a
                              href={`tel:${request.phone}`}
                              className="text-pink-600 hover:text-pink-700 text-xs"
                            >
                              Call Now
                            </a>
                          </div>
                        </div>

                        {request.email && (
                          <div className="flex items-start gap-3">
                            <Mail className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                            <div>
                              <p className="text-gray-500">Email</p>
                              <p className="font-semibold text-gray-800 break-all">{request.email}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <Calendar className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="text-gray-500">Delivery Date</p>
                            <p className="font-semibold text-gray-800">
                              {new Date(request.deliveryDate).toLocaleDateString('en-IN', {
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

                    {/* Cake Details */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-800 mb-3">Cake Requirements</h4>
                      
                      <div className="bg-white rounded-lg p-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Flavor</span>
                          <span className="font-semibold">{request.flavor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Size</span>
                          <span className="font-semibold">{request.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Budget</span>
                          <span className="font-semibold text-pink-600">₹{request.budget}</span>
                        </div>
                      </div>

                      {/* Design Description */}
                      <div>
                        <p className="text-gray-600 text-sm mb-2 font-semibold">Design Description:</p>
                        <div className="bg-white rounded-lg p-3 text-sm text-gray-700">
                          {request.design}
                        </div>
                      </div>

                      {request.message && (
                        <div>
                          <p className="text-gray-600 text-sm mb-2 font-semibold flex items-center gap-2">
                            <MessageSquare size={14} />
                            Additional Message:
                          </p>
                          <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-700">
                            {request.message}
                          </div>
                        </div>
                      )}

                      {/* Update Status */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Update Request Status
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={request.status}
                            onChange={(e) => updateStatus(request.id, e.target.value)}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-semibold"
                          >
                            {STATUS_OPTIONS.map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                          
                          <button
                            onClick={() => handleDelete(request.id)}
                            className="px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold flex items-center gap-2"
                            title="Delete Request"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reference Images */}
                  {request.referenceImages && request.referenceImages.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <ImageIcon size={18} />
                        Reference Images ({request.referenceImages.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {request.referenceImages.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative h-40 rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => setViewImage(url)}
                          >
                            <Image
                              src={url}
                              alt={`Reference ${idx + 1}`}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                              <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setViewImage(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <button
              onClick={() => setViewImage(null)}
              className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full hover:bg-gray-200 transition-colors z-10"
            >
              <XCircle size={24} />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={viewImage}
                alt="Full size reference"
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
