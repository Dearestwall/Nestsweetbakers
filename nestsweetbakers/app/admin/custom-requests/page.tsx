'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Eye, Trash2, CheckCircle, Clock, Mail, Phone, Calendar } from 'lucide-react';
import Image from 'next/image';

interface CustomRequest {
  id?: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  description: string;
  budget: string;
  referenceImages?: string[];
  status: 'pending' | 'contacted' | 'completed';
  createdAt: string;
}

export default function CustomRequestsManagement() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'contacted' | 'completed'>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const requestsSnap = await getDocs(collection(db, 'customRequests'));
      const requestsData = requestsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CustomRequest[];
      
      setRequests(requestsData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: CustomRequest['status']) {
    try {
      await updateDoc(doc(db, 'customRequests', id), { status });
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, status });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update status');
    }
  }

  async function deleteRequest(id: string) {
    if (!confirm('Delete this request?')) return;

    try {
      await deleteDoc(doc(db, 'customRequests', id));
      setRequests(requests.filter(r => r.id !== id));
      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete request');
    }
  }

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    contacted: requests.filter(r => r.status === 'contacted').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Custom Cake Requests</h1>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(['all', 'pending', 'contacted', 'completed'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              filter === status
                ? 'bg-pink-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 px-2 py-1 rounded-full text-xs bg-white bg-opacity-20">
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition hover:shadow-xl ${
                selectedRequest?.id === request.id ? 'ring-2 ring-pink-600' : ''
              }`}
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">{request.name}</h3>
                  <p className="text-sm text-gray-600">{request.eventType}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {request.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} />
                  {request.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} />
                  {request.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  {new Date(request.eventDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>

              <p className="text-sm text-gray-700 line-clamp-2 mb-4">{request.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-pink-600">
                  Budget: {request.budget}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRequest(request);
                    }}
                    className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRequest(request.id!);
                    }}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
              No {filter !== 'all' ? filter : ''} requests found
            </div>
          )}
        </div>

        {/* Request Details Panel */}
        <div className="lg:col-span-1">
          {selectedRequest ? (
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Request Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Customer Name</label>
                  <p className="font-medium">{selectedRequest.name}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Email</label>
                  <p className="font-medium">
                    <a href={`mailto:${selectedRequest.email}`} className="text-pink-600 hover:underline">
                      {selectedRequest.email}
                    </a>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Phone</label>
                  <p className="font-medium">
                    <a href={`tel:${selectedRequest.phone}`} className="text-pink-600 hover:underline">
                      {selectedRequest.phone}
                    </a>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Event Type</label>
                  <p className="font-medium">{selectedRequest.eventType}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Event Date</label>
                  <p className="font-medium">{new Date(selectedRequest.eventDate).toLocaleDateString()}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Budget</label>
                  <p className="font-medium text-pink-600">{selectedRequest.budget}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Description</label>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedRequest.description}</p>
                </div>

                {selectedRequest.referenceImages && selectedRequest.referenceImages.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Reference Images</label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedRequest.referenceImages.map((img, idx) => (
                        <div key={idx} className="relative h-24 rounded-lg overflow-hidden">
                          <Image
                            src={img}
                            alt={`Reference ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Update Status</label>
                  <div className="space-y-2">
                    {(['pending', 'contacted', 'completed'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedRequest.id!, status)}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                          selectedRequest.status === status
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status === 'pending' && <Clock className="inline mr-2" size={16} />}
                        {status === 'contacted' && <Mail className="inline mr-2" size={16} />}
                        {status === 'completed' && <CheckCircle className="inline mr-2" size={16} />}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => deleteRequest(selectedRequest.id!)}
                  className="w-full bg-red-100 text-red-600 px-4 py-3 rounded-lg hover:bg-red-200 transition font-medium"
                >
                  Delete Request
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center text-gray-500">
              <Eye size={48} className="mx-auto mb-4 opacity-30" />
              <p>Select a request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
