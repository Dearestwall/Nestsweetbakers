'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CakeCard from '@/components/CakeCard';
import { Cake } from '@/lib/types';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['All', 'Birthday', 'Wedding', 'Anniversary', 'Custom'];
const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
];

export default function CakesPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchCakes() {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const cakesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Cake));
        
        setCakes(cakesData);
      } catch (error) {
        console.error('Error fetching cakes:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCakes();
  }, []);

  // Advanced filtering and sorting
  const filteredCakes = useMemo(() => {
    let result = [...cakes];

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(cake => cake.category === selectedCategory);
    }

    // Search filter (name, description, category)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(cake =>
        cake.name.toLowerCase().includes(query) ||
        cake.description.toLowerCase().includes(query) ||
        cake.category.toLowerCase().includes(query)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'popularity':
        result.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
        break;
      case 'price-low':
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-high':
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [cakes, selectedCategory, searchQuery, sortBy]);

  // Recommended cakes (popular ones)
  const recommendedCakes = useMemo(() => {
    return [...cakes]
      .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
      .slice(0, 3);
  }, [cakes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading cakes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Header with Search */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Our Delicious Cakes</h1>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search cakes by name, flavor, or occasion..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 md:py-4 border-2 border-gray-200 rounded-full focus:border-pink-500 focus:outline-none text-sm md:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Filters Toggle (Mobile) */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <p className="text-sm text-gray-600">{filteredCakes.length} cakes found</p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        {/* Filters */}
        <div className={`${showFilters ? 'block' : 'hidden md:block'} space-y-4`}>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 md:px-6 py-2 rounded-full font-medium transition-colors text-sm md:text-base ${
                  selectedCategory === category
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex justify-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none text-sm md:text-base"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recommended Section (if search is empty) */}
      {!searchQuery && recommendedCakes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {recommendedCakes.map((cake) => (
              <CakeCard key={cake.id} cake={cake} showBadge />
            ))}
          </div>
        </div>
      )}

      {/* Cakes Grid */}
      {filteredCakes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredCakes.map((cake) => (
            <CakeCard key={cake.id} cake={cake} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No cakes found matching &quot;{searchQuery}&quot;
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="bg-pink-600 text-white px-6 py-3 rounded-full hover:bg-pink-700 transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
