import Link from 'next/link';
import Image from 'next/image';
import { Cake } from '@/lib/types';
import { Star } from 'lucide-react';

interface CakeCardProps {
  cake: Cake;
  showBadge?: boolean;
}

export default function CakeCard({ cake, showBadge = false }: CakeCardProps) {
  const imageUrl = cake.imageUrl && cake.imageUrl.trim() !== '' 
    ? cake.imageUrl 
    : 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600';

  return (
    <Link href={`/cakes/${cake.id}`} className="block group">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
        <div className="relative h-48 md:h-64">
          <Image
            src={imageUrl}
            alt={cake.name || 'Cake'}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3 bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            {cake.category}
          </div>
          {showBadge && (
            <div className="absolute top-3 left-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Star size={12} className="fill-current" />
              Recommended
            </div>
          )}
        </div>
        <div className="p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-pink-600 transition-colors">
            {cake.name}
          </h3>
          <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-2">{cake.description || 'Delicious cake'}</p>
          <div className="flex justify-between items-center">
            <span className="text-xl md:text-2xl font-bold text-pink-600">
              ₹{cake.basePrice}
            </span>
            <span className="text-pink-600 group-hover:translate-x-2 transition-transform text-sm md:text-base">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
