'use client';

export const dynamic = 'force-dynamic';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';

interface Stats {
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [ordersSnap, productsSnap] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'products'))
        ]);
        
        const orders = ordersSnap.docs.map(doc => doc.data());
        
        setStats({
          totalOrders: ordersSnap.size,
          totalProducts: productsSnap.size,
          pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
          completedOrders: orders.filter((o: any) => o.status === 'completed').length,
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Pending Orders</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">{stats.pendingOrders}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Completed Orders</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{stats.completedOrders}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
        </div>
      </div>
    </div>
  );
}
