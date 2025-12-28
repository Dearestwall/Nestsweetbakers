import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CakeCard from '@/components/CakeCard';
import Link from 'next/link';
import { Cake } from '@/lib/types';

async function getBestSellers(): Promise<Cake[]> {
  const q = query(
    collection(db, 'products'),
    orderBy('orderCount', 'desc'),
    limit(6)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cake));
}

export default async function Home() {
  const bestSellers = await getBestSellers();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Fresh Custom Cakes in {process.env.NEXT_PUBLIC_CITY_NAME}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Order for any occasion. Home delivery & COD available.
        </p>
        <div className="space-x-4">
          <Link
            href="/cakes"
            className="bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition"
          >
            Browse Cakes
          </Link>
          <Link
            href="/custom-cake"
            className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition"
          >
            Custom Order
          </Link>
        </div>
      </section>

      {/* Best Sellers */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Best Sellers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestSellers.map((cake: Cake) => (
            <CakeCard key={cake.id} cake={cake} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
          <h3 className="font-bold text-lg mb-2">🚚 Free Delivery</h3>
          <p className="text-gray-600">Within {process.env.NEXT_PUBLIC_CITY_NAME}</p>
        </div>
        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
          <h3 className="font-bold text-lg mb-2">💰 COD Available</h3>
          <p className="text-gray-600">Pay when you receive</p>
        </div>
        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
          <h3 className="font-bold text-lg mb-2">🎂 Custom Designs</h3>
          <p className="text-gray-600">Share your idea, we&apos;ll make it</p>
        </div>
      </section>
    </div>
  );
}
