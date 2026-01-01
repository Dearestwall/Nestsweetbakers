'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Product {
  orderCount: number;

  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  
  images: string[];
  thumbnail: string;
  
  basePrice: number;
  weights: {
    weight: string;
    price: number;
    servings?: string;
  }[];
  
  flavors: string[];
  eggless: boolean;
  
  inStock: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isBestseller: boolean;
  
  tags?: string[];
  occasions?: string[];
  
  minimumOrder?: number;
  advanceBookingDays?: number;
  
  rating?: number;
  reviewCount?: number;
  
  customizable?: boolean;
  deliveryAvailable?: boolean;
  
  seo?: {
    title: string;
    description: string;
    keywords: string;
  };
  
  createdAt: any;
  updatedAt?: any;
}

export function useProducts(category?: string, featured?: boolean) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q = query(
      collection(db, 'cakes'),
      orderBy('createdAt', 'desc')
    );

    // Filter by category
    if (category) {
      q = query(
        collection(db, 'cakes'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
    }

    // Filter featured
    if (featured) {
      q = query(
        collection(db, 'cakes'),
        where('isFeatured', '==', true),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || null,
        } as Product));
        
        setProducts(productsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [category, featured]);

  // Update product
  const updateProduct = useCallback(async (productId: string, data: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'cakes', productId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, error };
    }
  }, []);

  // Toggle stock
  const toggleStock = useCallback(async (productId: string, inStock: boolean) => {
    try {
      await updateDoc(doc(db, 'cakes', productId), {
        inStock,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error toggling stock:', error);
      return { success: false, error };
    }
  }, []);

  // Toggle featured
  const toggleFeatured = useCallback(async (productId: string, isFeatured: boolean) => {
    try {
      await updateDoc(doc(db, 'cakes', productId), {
        isFeatured,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error toggling featured:', error);
      return { success: false, error };
    }
  }, []);

  // Delete product
  const deleteProduct = useCallback(async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'cakes', productId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error };
    }
  }, []);

  // Get product by ID
  const getProductById = useCallback((productId: string) => {
    return products.find(product => product.id === productId);
  }, [products]);

  // Get product by slug
  const getProductBySlug = useCallback((slug: string) => {
    return products.find(product => product.slug === slug);
  }, [products]);

  // Get products by category
  const getProductsByCategory = useCallback((cat: string) => {
    return products.filter(product => product.category === cat);
  }, [products]);

  // Get featured products
  const getFeaturedProducts = useCallback(() => {
    return products.filter(product => product.isFeatured);
  }, [products]);

  // Get in-stock products
  const getInStockProducts = useCallback(() => {
    return products.filter(product => product.inStock);
  }, [products]);

  // Calculate stats
  const stats = {
    total: products.length,
    inStock: products.filter(p => p.inStock).length,
    outOfStock: products.filter(p => !p.inStock).length,
    featured: products.filter(p => p.isFeatured).length,
    popular: products.filter(p => p.isPopular).length,
    bestseller: products.filter(p => p.isBestseller).length,
  };

  return {
    products,
    loading,
    error,
    stats,
    updateProduct,
    toggleStock,
    toggleFeatured,
    deleteProduct,
    getProductById,
    getProductBySlug,
    getProductsByCategory,
    getFeaturedProducts,
    getInStockProducts,
  };
}
