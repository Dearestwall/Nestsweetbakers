'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CakeCard from '@/components/CakeCard';
import CategoryFilter from '@/components/CategoryFilter';
import { Cake } from '@/lib/types';

export default function CakesPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchCakes = async () => {
      const snapshot = await getDocs(collection(db, 'products'));
      const cakeList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cake));
      setCakes(cakeList);
      
      const cats = ['All', ...new Set(cakeList.map(cake => cake.category))];
      setCategories(cats);
    };
    fetchCakes();
  }, []);

  // Use useMemo instead of useEffect to avoid cascading renders
  const filteredCakes = useMemo(() => {
    if (selectedCategory === 'All') {
      return cakes;
    }
    return cakes.filter(cake => cake.category === selectedCategory);
  }, [selectedCategory, cakes]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Our Cakes</h1>
      
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {filteredCakes.map((cake: Cake) => (
          <CakeCard key={cake.id} cake={cake} />
        ))}
      </div>
    </div>
  );
}
