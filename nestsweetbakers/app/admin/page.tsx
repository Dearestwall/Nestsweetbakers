import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function AdminDashboard() {
  // Get stats
  const productsSnapshot = await getDocs(collection(db, 'products'));
  const ordersSnapshot = await getDocs(collection(db, 'orders'));
  const customRequestsSnapshot = await getDocs(collection(db, 'custom-cake-requests'));

  const stats = {
    totalProducts: productsSnapshot.size,
    totalOrders: ordersSnapshot.size,
    pendingCustomRequests: customRequestsSnapshot.docs.filter(
      doc => doc.data().status === 'pending'
    ).length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Products</h3>
        <p className="text-3xl font-bold text-pink-600">{stats.totalProducts}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Orders</h3>
        <p className="text-3xl font-bold text-purple-600">{stats.totalOrders}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Custom Requests</h3>
        <p className="text-3xl font-bold text-orange-600">{stats.pendingCustomRequests}</p>
      </div>
    </div>
  );
}
