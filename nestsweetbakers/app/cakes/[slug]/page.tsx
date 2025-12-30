'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { Cake } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Star, ShoppingCart, Heart, Share2, TrendingUp, ChevronLeft } from 'lucide-react';

interface Review {
  id?: string;
  cakeId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  approved: boolean;
}

export default function CakeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { addToCart } = useCart();
  
  const [cake, setCake] = useState<Cake | null>(null);
  const [allCakes, setAllCakes] = useState<Cake[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      
      try {
        // Fetch cake
        const docRef = doc(db, 'products', slug);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const cakeData = { id: docSnap.id, ...docSnap.data() } as Cake;
          setCake(cakeData);

          // Fetch reviews
          const reviewsRef = collection(db, 'reviews');
          const reviewsSnap = await getDocs(reviewsRef);
          const cakeReviews = reviewsSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Review))
            .filter(r => r.cakeId === slug && r.approved);
          setReviews(cakeReviews);
        }

        // Fetch all cakes for recommendations
        const allCakesSnap = await getDocs(collection(db, 'products'));
        const cakesData = allCakesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cake));
        setAllCakes(cakesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [slug]);

  // Recommended cakes (same category or popular)
  const recommendedCakes = useMemo(() => {
    if (!cake || allCakes.length === 0) return [];
    
    return allCakes
      .filter(c => c.id !== cake.id && (c.category === cake.category || (c.orderCount || 0) > 5))
      .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
      .slice(0, 4);
  }, [cake, allCakes]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const handleAddToCart = () => {
    if (cake) {
      addToCart(cake, quantity, customization);
      const proceed = confirm('✓ Added to cart! Go to cart or continue shopping?');
      if (proceed) {
        router.push('/cart');
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, 'reviews'), {
        cakeId: slug,
        customerName: reviewForm.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        createdAt: new Date().toISOString(),
        approved: false, // Needs admin approval
      });

      alert('Thank you! Your review has been submitted and will appear after approval.');
      setShowReviewForm(false);
      setReviewForm({ name: '', rating: 5, comment: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-600"></div>
      </div>
    );
  }

  if (!cake) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Cake not found</h1>
        <Link href="/cakes" className="text-pink-600 hover:underline">
          ← Back to all cakes
        </Link>
      </div>
    );
  }

  const imageUrl = cake.imageUrl && cake.imageUrl.trim() !== '' 
    ? cake.imageUrl 
    : 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/cakes"
          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-6 font-semibold group"
        >
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
          Back to Cakes
        </Link>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 bg-white rounded-2xl shadow-2xl overflow-hidden mb-12">
          {/* Image Gallery */}
          <div className="relative group">
            <div className="relative h-96 md:h-[600px]">
              <Image
                src={imageUrl}
                alt={cake.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  {cake.category}
                </span>
                {cake.orderCount && cake.orderCount > 10 && (
                  <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <Star size={16} className="fill-current" />
                    Bestseller
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-3 rounded-full shadow-lg transition-all ${
                    isFavorite ? 'bg-pink-600 text-white' : 'bg-white text-gray-600 hover:bg-pink-100'
                  }`}
                >
                  <Heart className={isFavorite ? 'fill-current' : ''} size={20} />
                </button>
                <button className="p-3 bg-white text-gray-600 rounded-full shadow-lg hover:bg-pink-100 transition-all">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Product Details */}
          <div className="p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{cake.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">{cake.description}</p>
            
            {/* Price */}
            <div className="mb-8 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-pink-600">₹{cake.basePrice}</span>
                <span className="text-gray-500">per kg</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Minimum order: 0.5 kg</p>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Quantity (kg)</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                  className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition font-bold text-lg"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 0.5)}
                  className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Customization */}
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                value={customization}
                onChange={(e) => setCustomization(e.target.value)}
                placeholder="E.g., 'Happy Birthday John', flavor preferences, dietary requirements..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition resize-none"
                rows={3}
              />
            </div>
            
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all font-bold text-lg mb-4 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              <ShoppingCart size={24} />
              Add to Cart - ₹{(cake.basePrice * quantity).toFixed(2)}
            </button>

            <Link
              href="/custom-cakes"
              className="block w-full text-center bg-white text-pink-600 border-2 border-pink-600 py-4 px-6 rounded-xl hover:bg-pink-50 transition-all font-bold text-lg"
            >
              Want Custom Design? Click Here
            </Link>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Customer Reviews</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition font-semibold"
            >
              Write a Review
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-pink-50 rounded-xl">
              <h3 className="font-bold text-lg mb-4">Share Your Experience</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={reviewForm.name}
                  onChange={e => setReviewForm({...reviewForm, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none"
                />

                <div>
                  <label className="block text-sm font-semibold mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          className={star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  placeholder="Tell us about your experience..."
                  required
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none resize-none"
                />

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition font-semibold"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{review.customerName}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Star className="mx-auto mb-4 text-gray-300" size={48} />
              <p>No reviews yet. Be the first to review this cake!</p>
            </div>
          )}
        </div>

        {/* Recommended Products */}
        {recommendedCakes.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="text-pink-600" size={28} />
              <h2 className="text-2xl md:text-3xl font-bold">You May Also Like</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedCakes.map((recCake) => (
                <Link
                  key={recCake.id}
                  href={`/cakes/${recCake.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={recCake.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'}
                        alt={recCake.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold mb-2 group-hover:text-pink-600 transition-colors line-clamp-1">
                        {recCake.name}
                      </h3>
                      <p className="text-pink-600 font-bold text-lg">₹{recCake.basePrice}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
