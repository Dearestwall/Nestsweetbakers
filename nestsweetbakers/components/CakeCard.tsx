'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Cake } from '@/lib/types';
import { Star, ShoppingCart, Heart, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CakeCardProps {
  cake: Cake;
  showBadge?: boolean;
}

export default function CakeCard({ cake, showBadge = false }: CakeCardProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showSuccess, showInfo, showError } = useToast();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if in wishlist on mount
  useState(() => {
    async function checkWishlist() {
      if (!user || !cake.id) return;
      
      try {
        const wishlistDoc = await getDoc(doc(db, 'wishlists', user.uid));
        if (wishlistDoc.exists()) {
          const items = wishlistDoc.data().items || [];
          setIsFavorite(items.includes(cake.id));
        }
      } catch (error) {
        console.error('Error checking wishlist:', error);
      }
    }
    checkWishlist();
  });

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showInfo('Please sign in to add to wishlist');
      router.push('/login');
      return;
    }

    if (!cake.id) return;

    setIsLoading(true);

    try {
      const wishlistRef = doc(db, 'wishlists', user.uid);
      const wishlistDoc = await getDoc(wishlistRef);
      
      let items = wishlistDoc.exists() ? wishlistDoc.data().items || [] : [];

      if (isFavorite) {
        items = items.filter((id: string) => id !== cake.id);
        showSuccess('Removed from wishlist');
      } else {
        items.push(cake.id);
        showSuccess('Added to wishlist ❤️');
      }

      await setDoc(wishlistRef, { 
        items, 
        updatedAt: serverTimestamp() 
      }, { merge: true });

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showError('Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(cake, 1, '');
    showSuccess('Added to cart!');
  };

  const imageUrl = cake.imageUrl && cake.imageUrl.trim() !== '' 
    ? cake.imageUrl 
    : 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600';

  return (
    <Link href={`/cakes/${cake.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-pink-600"></div>
            </div>
          )}
          <Image
            src={imageUrl}
            alt={cake.name}
            fill
            className={`object-cover group-hover:scale-110 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {cake.category && (
              <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                {cake.category}
              </span>
            )}
            {showBadge && cake.orderCount && cake.orderCount > 10 && (
              <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <TrendingUp size={14} />
                Popular
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            disabled={isLoading}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all transform hover:scale-110 ${
              isFavorite ? 'bg-pink-600 text-white' : 'bg-white text-gray-600 hover:bg-pink-50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={isFavorite ? 'fill-current' : ''} size={18} />
          </button>

          {/* Quick Add to Cart (appears on hover) */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg hover:from-pink-700 hover:to-purple-700 transition"
            >
              <ShoppingCart size={18} />
              Quick Add
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 group-hover:text-pink-600 transition-colors line-clamp-1">
            {cake.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {cake.description}
          </p>

          {/* Rating (if available) */}
          {cake.rating && (
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(cake.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
              <span className="text-xs text-gray-600 ml-1">
                ({cake.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price & Actions */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-pink-600">₹{cake.basePrice}</span>
              <span className="text-gray-500 text-sm ml-1">per kg</span>
            </div>
            
            {cake.orderCount && cake.orderCount > 5 && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                {cake.orderCount}+ orders
              </span>
            )}
          </div>

          {/* Min Order Info */}
          <p className="text-xs text-gray-500 mt-2">
            ✓ Min order: 0.5 kg • Fresh daily
          </p>
        </div>
      </div>
    </Link>
  );
}
