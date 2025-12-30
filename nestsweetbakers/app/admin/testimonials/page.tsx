'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/context/ToastContext';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Search, Star, Quote, Filter } from 'lucide-react';
import Image from 'next/image';

interface Testimonial {
  id?: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  imageUrl?: string;
  approved: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    id: string;
    action: 'delete' | 'toggle';
    name: string;
    currentStatus?: boolean;
  }>({ show: false, id: '', action: 'delete', name: '' });
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<Testimonial>({
    name: '',
    role: '',
    content: '',
    rating: 5,
    imageUrl: '',
    approved: false,
  });

  const fetchTestimonials = useCallback(async () => {
    try {
      const testimonialsSnap = await getDocs(collection(db, 'testimonials'));
      const testimonialsData = testimonialsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
      setTestimonials(testimonialsData.sort((a, b) => 
        new Date(b.createdAt?.toDate?.() || Date.now()).getTime() - 
        new Date(a.createdAt?.toDate?.() || Date.now()).getTime()
      ));
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      showError('❌ Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTestimonial?.id) {
        await updateDoc(doc(db, 'testimonials', editingTestimonial.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
        showSuccess('✅ Testimonial updated successfully');
      } else {
        await addDoc(collection(db, 'testimonials'), {
          ...formData,
          createdAt: serverTimestamp(),
        });
        showSuccess('✅ Testimonial created successfully');
      }
      
      resetForm();
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      showError('❌ Failed to save testimonial');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'testimonials', confirmModal.id));
      setTestimonials(testimonials.filter(t => t.id !== confirmModal.id));
      showSuccess('✅ Testimonial deleted successfully');
      setConfirmModal({ show: false, id: '', action: 'delete', name: '' });
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      showError('❌ Failed to delete testimonial');
    }
  };

  const toggleApproval = async () => {
    const { id, currentStatus } = confirmModal;
    try {
      await updateDoc(doc(db, 'testimonials', id), {
        approved: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      fetchTestimonials();
      showSuccess(`✅ Testimonial ${!currentStatus ? 'approved' : 'unapproved'}`);
      setConfirmModal({ show: false, id: '', action: 'toggle', name: '' });
    } catch (error) {
      console.error('Error toggling approval:', error);
      showError('❌ Failed to update approval status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      content: '',
      rating: 5,
      imageUrl: '',
      approved: false,
    });
    setEditingTestimonial(null);
    setShowForm(false);
  };

  const startEdit = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      role: testimonial.role || '',
      content: testimonial.content,
      rating: testimonial.rating,
      imageUrl: testimonial.imageUrl || '',
      approved: testimonial.approved,
    });
    setEditingTestimonial(testimonial);
    setShowForm(true);
  };

  const filteredTestimonials = testimonials
    .filter(testimonial => {
      const matchesSearch = testimonial.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.content?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || 
        (filterStatus === 'approved' && testimonial.approved) ||
        (filterStatus === 'pending' && !testimonial.approved);
      return matchesSearch && matchesFilter;
    });

  const stats = {
    total: testimonials.length,
    approved: testimonials.filter(t => t.approved).length,
    pending: testimonials.filter(t => !t.approved).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-pink-200 rounded-full animate-ping"></div>
            <div className="relative w-24 h-24 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-semibold text-lg">Loading testimonials...</p>
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
            <div className={`w-16 h-16 ${
              confirmModal.action === 'delete' ? 'bg-red-100' : 
              confirmModal.currentStatus ? 'bg-yellow-100' : 'bg-green-100'
            } rounded-full flex items-center justify-center mx-auto mb-4`}>
              {confirmModal.action === 'delete' ? (
                <Trash2 className="text-red-600" size={32} />
              ) : confirmModal.currentStatus ? (
                <XCircle className="text-yellow-600" size={32} />
              ) : (
                <CheckCircle className="text-green-600" size={32} />
              )}
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
              {confirmModal.action === 'delete' ? 'Delete Testimonial?' :
               confirmModal.currentStatus ? 'Unapprove Testimonial?' : 'Approve Testimonial?'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {confirmModal.action === 'delete' 
                ? `Are you sure you want to delete the testimonial from ${confirmModal.name}? This action cannot be undone.`
                : confirmModal.currentStatus
                ? `Remove approval from ${confirmModal.name}'s testimonial? It will no longer be visible to customers.`
                : `Approve ${confirmModal.name}'s testimonial? It will be visible to all customers.`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ show: false, id: '', action: 'delete', name: '' })}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.action === 'delete' ? handleDelete : toggleApproval}
                className={`flex-1 px-4 py-3 ${
                  confirmModal.action === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                  confirmModal.currentStatus ? 'bg-yellow-600 hover:bg-yellow-700' :
                  'bg-green-600 hover:bg-green-700'
                } text-white rounded-xl font-semibold transition-all`}
              >
                {confirmModal.action === 'delete' ? 'Delete' :
                 confirmModal.currentStatus ? 'Unapprove' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Testimonials
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Quote size={16} />
            Manage customer testimonials and reviews
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg font-semibold"
        >
          {showForm ? <XCircle size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'Add Testimonial'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
          <p className="text-sm font-semibold text-blue-700 mb-1">Total</p>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
          <p className="text-sm font-semibold text-green-700 mb-1">Approved</p>
          <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-200">
          <p className="text-sm font-semibold text-yellow-700 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search testimonials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all ${
              filterStatus === 'all' 
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all ${
              filterStatus === 'approved' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all ${
              filterStatus === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-scale-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            {editingTestimonial ? <Edit size={24} className="text-pink-600" /> : <Plus size={24} className="text-pink-600" />}
            {editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role/Title</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  placeholder="Customer, Baker, etc."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Content *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                placeholder="Write the testimonial content..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating *</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                >
                  {[5, 4, 3, 2, 1].map(num => (
                    <option key={num} value={num}>{'⭐'.repeat(num)} ({num} Stars)</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <input
                type="checkbox"
                id="approved"
                checked={formData.approved}
                onChange={(e) => setFormData({...formData, approved: e.target.checked})}
                className="w-5 h-5 rounded text-green-600 focus:ring-green-500"
              />
              <label htmlFor="approved" className="text-sm font-semibold text-gray-700">
                Approved for public display
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all font-semibold transform hover:scale-105"
              >
                {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Testimonials Grid */}
      {filteredTestimonials.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Quote className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 text-lg font-semibold">No testimonials found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or add a new testimonial</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTestimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Decorative Quote */}
              <Quote className="absolute top-4 right-4 text-pink-100" size={48} />
              
              <div className="relative z-10">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 flex-shrink-0 relative">
                    {testimonial.imageUrl ? (
                      <Image
                        src={testimonial.imageUrl}
                        alt={testimonial.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-full ring-4 ring-pink-100"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl ring-4 ring-pink-100">
                        {testimonial.name?.charAt(0) || 'T'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-800">{testimonial.name}</h3>
                    {testimonial.role && (
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    testimonial.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {testimonial.approved ? '✓ APPROVED' : '⏳ PENDING'}
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3 italic">
                  &quot;{testimonial.content}&quot;
                </p>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setConfirmModal({
                      show: true,
                      id: testimonial.id!,
                      action: 'toggle',
                      name: testimonial.name,
                      currentStatus: testimonial.approved
                    })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all font-semibold transform hover:scale-105 ${
                      testimonial.approved
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-2 border-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-200'
                    }`}
                  >
                    {testimonial.approved ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    <span>{testimonial.approved ? 'Unapprove' : 'Approve'}</span>
                  </button>
                  <button
                    onClick={() => startEdit(testimonial)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all font-semibold transform hover:scale-105 border-2 border-blue-200"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setConfirmModal({
                      show: true,
                      id: testimonial.id!,
                      action: 'delete',
                      name: testimonial.name
                    })}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all font-semibold transform hover:scale-105 border-2 border-red-200"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
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
