'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Star, Check, X, Trash2, Plus } from 'lucide-react';

interface Review {
  id?: string;
  cakeId: string;
  cakeName?: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  approved: boolean;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReview, setNewReview] = useState({
    cakeId: '',
    customerName: '',
    rating: 5,
    comment: '',
  });
  const [cakes, setCakes] = useState<Array<{id: string; name: string}>>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch reviews
      const reviewsSnap = await getDocs(collection(db, 'reviews'));
      const reviewsData = reviewsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Review));

      // Fetch cakes for names
      const cakesSnap = await getDocs(collection(db, 'products'));
      const cakesData = cakesSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      setCakes(cakesData);

      // Match cake names
      const reviewsWithNames = reviewsData.map(review => ({
        ...review,
        cakeName: cakesData.find(c => c.id === review.cakeId)?.name || 'Unknown Cake'
      }));

      setReviews(reviewsWithNames.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleApproval(reviewId: string, currentStatus: boolean) {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        approved: !currentStatus
      });
      setReviews(reviews.map(r => 
        r.id === reviewId ? { ...r, approved: !currentStatus } : r
      ));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update review');
    }
  }

  async function deleteReview(reviewId: string) {
    if (!confirm('Delete this review?')) return;

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete review');
    }
  }

  async function addReview(e: React.FormEvent) {
    e.preventDefault();

    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        ...newReview,
        createdAt: new Date().toISOString(),
        approved: true,
      });

      const cakeName = cakes.find(c => c.id === newReview.cakeId)?.name || 'Unknown';
      
      setReviews([{
        id: docRef.id,
        ...newReview,
        cakeName,
        createdAt: new Date().toISOString(),
        approved: true,
      }, ...reviews]);

      setNewReview({ cakeId: '', customerName: '', rating: 5, comment: '' });
      setShowAddForm(false);
      alert('Review added successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add review');
    }
  }

  if (loading) return <div className="p-8">Loading reviews...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Reviews Management</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Add Review
        </button>
      </div>

      {/* Add Review Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 animate-slide-up">
          <h2 className="text-xl font-bold mb-4">Add New Review</h2>
          <form onSubmit={addReview} className="space-y-4">
            <select
              required
              value={newReview.cakeId}
              onChange={e => setNewReview({...newReview, cakeId: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
            >
              <option value="">Select Cake</option>
              {cakes.map(cake => (
                <option key={cake.id} value={cake.id}>{cake.name}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Customer Name"
              required
              value={newReview.customerName}
              onChange={e => setNewReview({...newReview, customerName: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
            />

            <div>
              <label className="block text-sm font-semibold mb-2">Rating</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({...newReview, rating: star})}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              placeholder="Review Comment"
              required
              value={newReview.comment}
              onChange={e => setNewReview({...newReview, comment: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none resize-none"
            />

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition font-semibold"
              >
                Add Review
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cake</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{review.cakeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{review.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate">{review.comment}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      review.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {review.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleApproval(review.id!, review.approved)}
                        className={`p-2 rounded-lg transition ${
                          review.approved 
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        title={review.approved ? 'Unapprove' : 'Approve'}
                      >
                        {review.approved ? <X size={18} /> : <Check size={18} />}
                      </button>
                      <button
                        onClick={() => deleteReview(review.id!)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No reviews yet
          </div>
        )}
      </div>
    </div>
  );
}
