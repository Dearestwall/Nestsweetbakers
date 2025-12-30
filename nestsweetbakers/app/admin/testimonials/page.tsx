'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/context/ToastContext';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Search, Star } from 'lucide-react';
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
      showError('Failed to load testimonials');
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
        showSuccess('Testimonial updated successfully');
      } else {
        await addDoc(collection(db, 'testimonials'), {
          ...formData,
          createdAt: serverTimestamp(),
        });
        showSuccess('Testimonial created successfully');
      }
      
      resetForm();
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      showError('Failed to save testimonial');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await deleteDoc(doc(db, 'testimonials', id));
      setTestimonials(testimonials.filter(t => t.id !== id));
      showSuccess('Testimonial deleted successfully');
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      showError('Failed to delete testimonial');
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'testimonials', id), {
        approved: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      fetchTestimonials();
      showSuccess(`Testimonial ${!currentStatus ? 'approved' : 'unapproved'}`);
    } catch (error) {
      console.error('Error toggling approval:', error);
      showError('Failed to update approval status');
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

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Testimonials</h1>
          <p className="text-gray-600 mt-1">Manage customer testimonials</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
        >
          <Plus size={20} />
          {showForm ? 'Cancel' : 'Add Testimonial'}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search testimonials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role/Title</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  placeholder="Customer, Baker, etc."
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required
                rows={4}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                >
                  {[5, 4, 3, 2, 1].map(num => (
                    <option key={num} value={num}>{'⭐'.repeat(num)} ({num} Stars)</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="approved"
                checked={formData.approved}
                onChange={(e) => setFormData({...formData, approved: e.target.checked})}
                className="rounded text-pink-600 focus:ring-pink-500"
              />
              <label htmlFor="approved" className="text-sm font-medium text-gray-700">
                Approved for display
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all font-semibold"
              >
                {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Testimonials List */}
      {filteredTestimonials.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No testimonials yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 overflow-hidden">
                  {testimonial.imageUrl ? (
                    <Image
                      src={testimonial.imageUrl}
                      alt={testimonial.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    testimonial.name?.charAt(0) || 'T'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-800 truncate">{testimonial.name}</h3>
                  {testimonial.role && (
                    <p className="text-sm text-gray-600 truncate">{testimonial.role}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  testimonial.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {testimonial.approved ? 'Approved' : 'Pending'}
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed line-clamp-3">{testimonial.content}</p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleApproval(testimonial.id!, testimonial.approved)}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition font-semibold text-sm ${
                    testimonial.approved
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {testimonial.approved ? <XCircle size={16} /> : <CheckCircle size={16} />}
                  <span className="hidden sm:inline">{testimonial.approved ? 'Unapprove' : 'Approve'}</span>
                </button>
                <button
                  onClick={() => startEdit(testimonial)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold text-sm"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id!)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold text-sm"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
