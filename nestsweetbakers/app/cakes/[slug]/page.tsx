'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp, setDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { Cake } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Star, ShoppingCart, Heart, Share2, TrendingUp, ChevronLeft,
  Copy, Facebook, Twitter, Mail, CheckCircle, Package, Clock,
  Truck, Award, Loader2, X, Plus, Minus, MessageSquare
} from 'lucide-react';

interface Review {
  id?: string;
  cakeId: string;
  userId?: string;
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
  const { user } = useAuth();
  
  const [cake, setCake] = useState<Cake | null>(null);
  const [allCakes, setAllCakes] = useState<Cake[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkingWishlist, setCheckingWishlist] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: 5,
    comment: '',
  });

  // Fetch cake data
  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      
      try {
        const docRef = doc(db, 'products', slug);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const cakeData = { id: docSnap.id, ...docSnap.data() } as Cake;
          setCake(cakeData);

          // Fetch approved reviews
          const reviewsRef = collection(db, 'reviews');
          const reviewsSnap = await getDocs(reviewsRef);
          const cakeReviews = reviewsSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Review))
            .filter(r => r.cakeId === slug && r.approved)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  // Check wishlist status
  useEffect(() => {
    async function checkWishlist() {
      if (!user || !slug) {
        setCheckingWishlist(false);
        return;
      }

      try {
        const wishlistDoc = await getDoc(doc(db, 'wishlists', user.uid));
        if (wishlistDoc.exists()) {
          const wishlist = wishlistDoc.data().items || [];
          setIsFavorite(wishlist.includes(slug));
        }
      } catch (error) {
        console.error('Error checking wishlist:', error);
      } finally {
        setCheckingWishlist(false);
      }
    }

    checkWishlist();
  }, [user, slug]);

  // Recommended cakes
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

  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach(r => dist[r.rating - 1]++);
    return dist.reverse();
  }, [reviews]);

  const handleAddToCart = async () => {
    if (!cake) return;
    
    setAddingToCart(true);
    
    try {
      await addToCart(cake, quantity, customization);
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-in-right';
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <div>
            <p class="font-bold">Added to cart!</p>
            <p class="text-sm">${cake.name} - ${quantity}kg</p>
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 3000);

      // Ask to go to cart
      setTimeout(() => {
        const proceed = confirm('Go to cart to checkout?');
        if (proceed) {
          router.push('/cart');
        }
      }, 500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      alert('Please sign in to add to wishlist');
      router.push('/login');
      return;
    }

    try {
      const wishlistRef = doc(db, 'wishlists', user.uid);
      const wishlistDoc = await getDoc(wishlistRef);
      
      let wishlist = wishlistDoc.exists() ? wishlistDoc.data().items || [] : [];

      if (isFavorite) {
        wishlist = wishlist.filter((id: string) => id !== slug);
      } else {
        wishlist.push(slug);
      }

      await setDoc(wishlistRef, { 
        items: wishlist, 
        updatedAt: serverTimestamp() 
      }, { merge: true });
      
      setIsFavorite(!isFavorite);

      // Show toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-pink-600 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-slide-in-right';
      toast.textContent = isFavorite ? 'Removed from wishlist' : 'Added to wishlist ❤️';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 2000);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Failed to update wishlist');
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `Check out this amazing ${cake?.name} cake!`;

    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard! 📋');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
        break;
    }

    setShowShareMenu(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to submit a review');
      router.push('/login');
      return;
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        cakeId: slug,
        userId: user.uid,
        customerName: reviewForm.name || user.displayName || 'Anonymous',
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        createdAt: new Date().toISOString(),
        approved: false,
      });

      // Show success
      alert('✓ Review submitted! It will appear after admin approval.');
      setShowReviewForm(false);
      setReviewForm({ name: '', rating: 5, comment: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading delicious cake...</p>
        </div>
      </div>
    );
  }

  if (!cake) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🎂</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Cake not found</h1>
          <Link 
            href="/cakes" 
            className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-full hover:bg-pink-700 transition font-semibold"
          >
            <ChevronLeft size={20} />
            Back to all cakes
          </Link>
        </div>
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
          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-6 font-semibold group transition-all"
        >
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
          Back to Cakes
        </Link>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 bg-white rounded-2xl shadow-2xl overflow-hidden mb-12 animate-fade-in">
          {/* Image Gallery */}
          <div className="relative group">
            <div className="relative h-96 md:h-[600px] bg-gray-100">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin h-12 w-12 text-pink-600" />
                </div>
              )}
              <Image
                src={imageUrl}
                alt={cake.name}
                fill
                className={`object-cover group-hover:scale-105 transition-transform duration-700 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 animate-slide-in-left">
                <span className="bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                  {cake.category}
                </span>
                {cake.orderCount && cake.orderCount > 10 && (
                  <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <Star size={16} className="fill-current" />
                    Bestseller
                  </span>
                )}
                {reviews.length > 5 && (
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <Award size={16} />
                    Popular
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 animate-slide-in-right">
                <button
                  onClick={toggleWishlist}
                  disabled={checkingWishlist}
                  className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${
                    isFavorite ? 'bg-pink-600 text-white' : 'bg-white text-gray-600 hover:bg-pink-100'
                  } ${checkingWishlist ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={isFavorite ? 'fill-current' : ''} size={20} />
                </button>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-3 bg-white text-gray-600 rounded-full shadow-lg hover:bg-pink-100 transition-all transform hover:scale-110"
                    title="Share"
                  >
                    <Share2 size={20} />
                  </button>

                  {/* Share Menu */}
                  {showShareMenu && (
                    <div className="absolute top-14 right-0 bg-white rounded-lg shadow-2xl p-2 z-10 min-w-[200px] animate-scale-in">
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        <Copy size={18} />
                        <span className="text-sm font-medium">Copy Link</span>
                      </button>
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        <span className="text-lg">💬</span>
                        <span className="text-sm font-medium">WhatsApp</span>
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        <Facebook size={18} />
                        <span className="text-sm font-medium">Facebook</span>
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        <Twitter size={18} />
                        <span className="text-sm font-medium">Twitter</span>
                      </button>
                      <button
                        onClick={() => handleShare('email')}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        <Mail size={18} />
                        <span className="text-sm font-medium">Email</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Details */}
          <div className="p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in">{cake.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={`transition-all ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400 scale-110' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-gray-600 font-medium">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
              {cake.description}
            </p>
            
            {/* Price */}
            <div className="mb-8 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-pink-600">₹{cake.basePrice}</span>
                <span className="text-gray-500">per kg</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle size={16} className="text-green-600" />
                  Min 0.5 kg
                </span>
                <span className="flex items-center gap-1">
                  <Package size={16} className="text-blue-600" />
                  Fresh ingredients
                </span>
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <label className="block text-sm font-semibold mb-3">Quantity (kg)</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                  disabled={quantity <= 0.5}
                  className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Minus size={20} />
                </button>
                <span className="text-2xl font-bold w-20 text-center bg-pink-50 py-2 rounded-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 0.5)}
                  className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition font-bold text-lg flex items-center justify-center"
                >
                  <Plus size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Total: ₹{(cake.basePrice * quantity).toFixed(2)}
              </p>
            </div>

            {/* Customization */}
            <div className="mb-8 animate-fade-in" style={{ animationDelay: '500ms' }}>
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
              disabled={addingToCart}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all font-bold text-lg mb-4 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none animate-fade-in"
              style={{ animationDelay: '600ms' }}
            >
              {addingToCart ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart size={24} />
                  Add to Cart - ₹{(cake.basePrice * quantity).toFixed(2)}
                </>
              )}
            </button>

            <Link
              href="/custom-cakes"
              className="block w-full text-center bg-white text-pink-600 border-2 border-pink-600 py-4 px-6 rounded-xl hover:bg-pink-50 transition-all font-bold text-lg animate-fade-in"
              style={{ animationDelay: '700ms' }}
            >
              Want Custom Design? Click Here
            </Link>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t animate-fade-in" style={{ animationDelay: '800ms' }}>
              <div className="text-center">
                <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
                <p className="text-xs font-semibold text-gray-700">Fresh Daily</p>
              </div>
              <div className="text-center">
                <Truck className="mx-auto mb-2 text-blue-600" size={24} />
                <p className="text-xs font-semibold text-gray-700">Safe Delivery</p>
              </div>
              <div className="text-center">
                <Clock className="mx-auto mb-2 text-purple-600" size={24} />
                <p className="text-xs font-semibold text-gray-700">On-Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 mb-12 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <MessageSquare className="text-pink-600" size={32} />
                Customer Reviews
              </h2>
              <p className="text-gray-600 mt-1">{reviews.length} verified reviews</p>
            </div>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition font-semibold flex items-center gap-2"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Write Review</span>
            </button>
          </div>

          {/* Rating Summary */}
          {reviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 p-6 bg-gray-50 rounded-xl">
              <div className="text-center">
                <div className="text-6xl font-bold text-pink-600 mb-2">{averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={24}
                      className={i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <p className="text-gray-600">{reviews.length} total reviews</p>
              </div>
              
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars, index) => {
                  const count = ratingDistribution[index];
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-12">{stars} star</span>
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-pink-50 rounded-xl animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Share Your Experience</h3>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="p-2 hover:bg-pink-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={reviewForm.name}
                  onChange={e => setReviewForm({...reviewForm, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
                />

                <div>
                  <label className="block text-sm font-semibold mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        className="transition-transform hover:scale-125"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none resize-none transition"
                />

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition font-semibold"
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
              {reviews.map((review, index) => (
                <div 
                  key={review.id} 
                  className="border-b border-gray-200 pb-6 last:border-0 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
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
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Star className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="text-lg font-medium mb-2">No reviews yet</p>
              <p className="text-sm">Be the first to review this cake!</p>
            </div>
          )}
        </div>

        {/* Recommended Products */}
        {recommendedCakes.length > 0 && (
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="text-pink-600" size={28} />
              <h2 className="text-2xl md:text-3xl font-bold">You May Also Like</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedCakes.map((recCake, index) => (
                <Link
                  key={recCake.id}
                  href={`/cakes/${recCake.id}`}
                  className="group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="relative h-48 overflow-hidden bg-gray-100">
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
                      <p className="text-pink-600 font-bold text-lg">₹{recCake.basePrice}/kg</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        
        .animate-fade-out {
          animation: fade-out 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
