'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Heart, Trash2, ShoppingCart, Loader2, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Cake } from '@/lib/types';
import { useCart } from '@/context/CartContext';

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [wishlistItems, setWishlistItems] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchWishlist() {
      if (!user) return;

      try {
        const wishlistDoc = await getDoc(doc(db, 'wishlists', user.uid));
        
        if (wishlistDoc.exists()) {
          const wishlistIds = wishlistDoc.data().items || [];
          
          // Fetch cake details for each ID
          const cakesPromises = wishlistIds.map(async (id: string) => {
            const cakeDoc = await getDoc(doc(db, 'products', id));
            if (cakeDoc.exists()) {
              return { id: cakeDoc.id, ...cakeDoc.data() } as Cake;
            }
            return null;
          });

          const cakes = await Promise.all(cakesPromises);
          setWishlistItems(cakes.filter((cake): cake is Cake => cake !== null));
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [user]);

  const removeFromWishlist = async (cakeId: string) => {
    if (!user) return;

    setRemovingId(cakeId);

    try {
      const updatedItems = wishlistItems.filter(item => item.id !== cakeId);
      const wishlistIds = updatedItems.map(item => item.id);

      await setDoc(doc(db, 'wishlists', user.uid), {
        items: wishlistIds,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setWishlistItems(updatedItems);

      // Show toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-slide-in-right';
      toast.textContent = 'Removed from wishlist';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 2000);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove from wishlist');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = (cake: Cake) => {
    addToCart(cake, 1, '');
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-in-right';
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <p class="font-bold">Added to cart!</p>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  };

  const clearWishlist = async () => {
    if (!user) return;
    if (!confirm('Clear all items from wishlist?')) return;

    try {
      await setDoc(doc(db, 'wishlists', user.uid), {
        items: [],
        updatedAt: serverTimestamp()
      }, { merge: true });

      setWishlistItems([]);
      alert('Wishlist cleared');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      alert('Failed to clear wishlist');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Heart className="text-pink-600 fill-current" size={36} />
              <h1 className="text-3xl md:text-4xl font-bold">My Wishlist</h1>
            </div>
            {wishlistItems.length > 0 && (
              <span className="bg-pink-600 text-white px-4 py-2 rounded-full font-bold">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <p className="text-gray-600">Your favorite cakes, saved for later</p>
        </div>

        {/* Clear All Button */}
        {wishlistItems.length > 0 && (
          <div className="flex justify-end mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <button
              onClick={clearWishlist}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold"
            >
              <Trash2 size={18} />
              Clear All
            </button>
          </div>
        )}

        {/* Wishlist Items */}
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((cake, index) => (
              <div 
                key={cake.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link href={`/cakes/${cake.id || ''}`} className="block relative h-56 overflow-hidden group">
                  <Image
                    src={cake.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'}
                    alt={cake.name || 'Cake'}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (cake.id) removeFromWishlist(cake.id);
                      }}
                      disabled={removingId === cake.id}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-all transform hover:scale-110 disabled:opacity-50"
                    >
                      {removingId === cake.id ? (
                        <Loader2 className="animate-spin text-red-600" size={20} />
                      ) : (
                        <Heart className="text-red-600 fill-current" size={20} />
                      )}
                    </button>
                  </div>
                  {cake.category && (
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {cake.category}
                      </span>
                    </div>
                  )}
                </Link>

                <div className="p-4">
                  <Link href={`/cakes/${cake.id || ''}`}>
                    <h3 className="font-bold text-lg mb-2 hover:text-pink-600 transition line-clamp-1">
                      {cake.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {cake.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-2xl font-bold text-pink-600">₹{cake.basePrice}</span>
                      <span className="text-gray-500 text-sm ml-1">per kg</span>
                    </div>
                    {cake.orderCount && cake.orderCount > 5 && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(cake)}
                      className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-pink-700 hover:to-purple-700 transition font-semibold flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => cake.id && removeFromWishlist(cake.id)}
                      disabled={removingId === cake.id}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                      title="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center animate-fade-in">
            <Heart className="mx-auto mb-4 text-gray-300" size={64} />
            <h3 className="text-2xl font-bold mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">
              Start adding your favorite cakes to your wishlist!
            </p>
            <Link
              href="/cakes"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-full hover:from-pink-700 hover:to-purple-700 transition font-semibold shadow-lg transform hover:scale-105"
            >
              <Package size={20} />
              Browse Cakes
            </Link>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
        
        .animate-fade-out {
          animation: fade-out 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
