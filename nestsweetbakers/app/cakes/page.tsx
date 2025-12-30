'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CakeCard from '@/components/CakeCard';
import { Cake } from '@/lib/types';
import { Search, X, SlidersHorizontal, Filter, Grid, List, Loader2, TrendingUp, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const CATEGORIES = ['All', 'Birthday', 'Wedding', 'Anniversary', 'Custom', 'Chocolate', 'Fruit', 'Vanilla'];
const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹1000', min: 500, max: 1000 },
  { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
  { label: 'Above ₹2000', min: 2000, max: Infinity },
];
const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function CakesPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    async function fetchCakes() {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const cakesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Cake));
        
        setCakes(cakesData);
        setTimeout(() => setAnimateCards(true), 100);
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

    // Price range filter
    result = result.filter(cake => 
      cake.basePrice >= priceRange.min && cake.basePrice <= priceRange.max
    );

    // Search filter (name, description, category) - with safety checks
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(cake =>
        (cake.name?.toLowerCase() || '').includes(query) ||
        (cake.description?.toLowerCase() || '').includes(query) ||
        (cake.category?.toLowerCase() || '').includes(query)
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
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return result;
  }, [cakes, selectedCategory, searchQuery, sortBy, priceRange]);

  // Recommended cakes (popular ones)
  const recommendedCakes = useMemo(() => {
    return [...cakes]
      .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
      .slice(0, 3);
  }, [cakes]);

  // Featured cake (highest order count)
  const featuredCake = useMemo(() => {
    if (cakes.length === 0) return null;
    return cakes.reduce((max, cake) => 
      (cake.orderCount || 0) > (max.orderCount || 0) ? cake : max
    , cakes[0]);
  }, [cakes]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceRange(PRICE_RANGES[0]);
    setSortBy('popularity');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading delicious cakes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-6 md:py-8">
      <div className="container mx-auto px-4">
        {/* Header with Search */}
        <div className="mb-6 md:mb-8">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Our Delicious Cakes
            </h1>
            <p className="text-gray-600 text-lg">Freshly baked with love, delivered with care 🎂</p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search cakes by name, flavor, or occasion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-full focus:border-pink-500 focus:outline-none text-base shadow-lg transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {/* Mobile Filter Toggle */}
            <div className="flex items-center justify-between md:hidden mb-4">
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold text-gray-600">
                  {filteredCakes.length} {filteredCakes.length === 1 ? 'cake' : 'cakes'} found
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-gray-400'}`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-400'}`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:bg-pink-700 transition"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
            </div>

            {/* Desktop Stats */}
            <div className="hidden md:flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-600">
                Showing {filteredCakes.length} of {cakes.length} cakes
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-gray-400'}`}
                  title="Grid View"
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-400'}`}
                  title="List View"
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className={`${showFilters ? 'block' : 'hidden md:block'} space-y-4`}>
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range</label>
                  <select
                    value={PRICE_RANGES.indexOf(priceRange)}
                    onChange={(e) => setPriceRange(PRICE_RANGES[parseInt(e.target.value)])}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
                  >
                    {PRICE_RANGES.map((range, index) => (
                      <option key={index} value={index}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none text-sm"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={handleClearFilters}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Cake Banner */}
        {!searchQuery && featuredCake && (
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-2xl overflow-hidden mb-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8">
              <div className="flex flex-col justify-center text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="text-yellow-300" size={24} />
                  <span className="text-yellow-300 font-bold text-sm">FEATURED CAKE</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3">{featuredCake.name}</h2>
                <p className="text-pink-100 mb-4 line-clamp-2">{featuredCake.description}</p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-bold">₹{featuredCake.basePrice}</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">per kg</span>
                </div>
                <Link
                  href={`/cakes/${featuredCake.id}`}
                  className="inline-flex items-center justify-center gap-2 bg-white text-pink-600 px-8 py-3 rounded-full font-bold hover:bg-pink-50 transition-all transform hover:scale-105 shadow-lg"
                >
                  View Details
                  <span>→</span>
                </Link>
              </div>
              <div className="relative h-64 md:h-auto rounded-xl overflow-hidden">
                <Image
                  src={featuredCake.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'}
                  alt={featuredCake.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        )}

        {/* Recommended Section */}
        {!searchQuery && recommendedCakes.length > 0 && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-pink-600" size={28} />
              <h2 className="text-2xl md:text-3xl font-bold">Recommended for You</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedCakes.map((cake, index) => (
                <div key={cake.id} className="animate-fade-in" style={{ animationDelay: `${500 + index * 100}ms` }}>
                  <CakeCard cake={cake} showBadge />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cakes Grid/List */}
        {filteredCakes.length > 0 ? (
          <div>
            {searchQuery && (
              <h2 className="text-xl md:text-2xl font-bold mb-6">
                Search Results for &quot;{searchQuery}&quot;
              </h2>
            )}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8' 
                : 'space-y-4'
            }>
              {filteredCakes.map((cake, index) => (
                <div 
                  key={cake.id} 
                  className={animateCards ? 'animate-fade-in' : 'opacity-0'}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CakeCard cake={cake} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No cakes found</h3>
            <p className="text-gray-500 text-lg mb-6">
              {searchQuery 
                ? `No cakes matching "${searchQuery}"`
                : 'Try adjusting your filters'
              }
            </p>
            <button
              onClick={handleClearFilters}
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-full hover:from-pink-700 hover:to-purple-700 transition font-semibold shadow-lg transform hover:scale-105"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Add animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
