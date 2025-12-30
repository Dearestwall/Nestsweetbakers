'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Edit, Trash2, Check, X, Star } from 'lucide-react';
import Image from 'next/image';

interface Testimonial {
  id?: string;
  customerName: string;
  customerImage?: string;
  rating: number;
  comment: string;
  cakeName?: string;
  approved: boolean;
  featured: boolean;
  createdAt: string;
}

export default function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Testimonial>({
    customerName: '',
    customerImage: '',
    rating: 5,
    comment: '',
    cakeName: '',
    approved: true,
    featured: false,
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    try {
      const testimonialsSnap = await getDocs(collection(db, 'testimonials'));
      const testimonialsData = testimonialsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Testimonial[];
      
      setTestimonials(testimonialsData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingId) {
       await updateDoc(doc(db, 'testimonials', editingId), {
  customerName: formData.customerName,
  customerImage: formData.customerImage,
  rating: formData.rating,
  comment: formData.comment,
  cakeName: formData.cakeName,
  approved: formData.approved,
  featured: formData.featured,
});
        setTestimonials(testimonials.map(t => 
          t.id === editingId ? { ...formData, id: editingId } : t
        ));
        alert('Testimonial updated!');
      } else {
        const docRef = await addDoc(collection(db, 'testimonials'), {
          ...formData,
          createdAt: new Date().toISOString(),
        });
        setTestimonials([{ ...formData, id: docRef.id, createdAt: new Date().toISOString() }, ...testimonials]);
        alert('Testimonial added!');
      }

      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save testimonial');
    }
  }

  async function deleteTestimonial(id: string) {
    if (!confirm('Delete this testimonial?')) return;

    try {
      await deleteDoc(doc(db, 'testimonials', id));
      setTestimonials(testimonials.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete testimonial');
    }
  }

  async function toggleApproval(id: string, currentStatus: boolean) {
    try {
      await updateDoc(doc(db, 'testimonials', id), { approved: !currentStatus });
      setTestimonials(testimonials.map(t => 
        t.id === id ? { ...t, approved: !currentStatus } : t
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function toggleFeatured(id: string, currentStatus: boolean) {
    try {
      await updateDoc(doc(db, 'testimonials', id), { featured: !currentStatus });
      setTestimonials(testimonials.map(t => 
        t.id === id ? { ...t, featured: !currentStatus } : t
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function editTestimonial(testimonial: Testimonial) {
    setFormData(testimonial);
    setEditingId(testimonial.id || null);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      customerName: '',
      customerImage: '',
      rating: 5,
      comment: '',
      cakeName: '',
      approved: true,
      featured: false,
      createdAt: new Date().toISOString(),
    });
    setEditingId(null);
    setShowForm(false);
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Testimonials Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Add Testimonial
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Customer Name"
                required
                value={formData.customerName}
                onChange={e => setFormData({...formData, customerName: e.target.value})}
                className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
              <input
                type="url"
                placeholder="Customer Image URL (optional)"
                value={formData.customerImage}
                onChange={e => setFormData({...formData, customerImage: e.target.value})}
                className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Cake Name (optional)"
                value={formData.cakeName}
                onChange={e => setFormData({...formData, cakeName: e.target.value})}
                className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
              <div>
                <label className="block text-sm font-semibold mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, rating: star})}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <textarea
              placeholder="Testimonial Comment"
              required
              value={formData.comment}
              onChange={e => setFormData({...formData, comment: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none resize-none"
            />

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.approved}
                  onChange={e => setFormData({...formData, approved: e.target.checked})}
                  className="w-5 h-5 text-pink-600"
                />
                <span className="font-medium">Approved</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={e => setFormData({...formData, featured: e.target.checked})}
                  className="w-5 h-5 text-pink-600"
                />
                <span className="font-medium">Featured</span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition font-semibold"
              >
                {editingId ? 'Update' : 'Add'} Testimonial
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {testimonial.customerImage ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.customerImage}
                      alt={testimonial.customerName}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.customerName.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold">{testimonial.customerName}</h3>
                  {testimonial.cakeName && (
                    <p className="text-xs text-gray-500">{testimonial.cakeName}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              &quot;{testimonial.comment}&quot;
            </p>

            <div className="flex items-center gap-2 mb-4">
              {testimonial.approved && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  Approved
                </span>
              )}
              {testimonial.featured && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                  ⭐ Featured
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                <button
                  onClick={() => toggleApproval(testimonial.id!, testimonial.approved)}
                  className={`p-2 rounded transition ${
                    testimonial.approved 
                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                  title={testimonial.approved ? 'Unapprove' : 'Approve'}
                >
                  {testimonial.approved ? <X size={16} /> : <Check size={16} />}
                </button>
                <button
                  onClick={() => toggleFeatured(testimonial.id!, testimonial.featured)}
                  className={`p-2 rounded transition ${
                    testimonial.featured 
                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={testimonial.featured ? 'Unfeature' : 'Feature'}
                >
                  <Star size={16} className={testimonial.featured ? 'fill-current' : ''} />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => editTestimonial(testimonial)}
                  className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => deleteTestimonial(testimonial.id!)}
                  className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
          No testimonials yet
        </div>
      )}
    </div>
  );
}
