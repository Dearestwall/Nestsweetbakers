'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDocs, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface OrderItem {
  cakeId: string;
  cakeName: string;
  cakeImage: string;
  quantity: number;
  weight: string;
  basePrice: number;
  totalPrice: number;
  customization?: string;
  category?: string;
  flavor?: string;
}

export interface Order {
  id: string;
  orderRef: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  
  items: OrderItem[];
  
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    pincode: string;
  };
  
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: string;
  
  isGift: boolean;
  occasionType?: string;
  giftMessage?: string;
  recipientName?: string;
  recipientPhone?: string;
  
  specialInstructions?: string;
  
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  tax: number;
  discount: number;
  total: number;
  
  paymentMethod: 'cod' | 'online' | 'razorpay' | 'stripe';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  orderStatus: string;
  
  trackingSteps?: {
    placed: boolean;
    confirmed: boolean;
    preparing: boolean;
    outForDelivery: boolean;
    delivered: boolean;
  };
  
  adminNotes?: string;
  cancelReason?: string;
  
  createdAt: any;
  updatedAt?: any;
  confirmedAt?: any;
  deliveredAt?: any;
  
  source?: string;
  customRequestId?: string;
}

export function useOrders(userId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders with real-time updates
  useEffect(() => {
    let q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    // Filter by userId if provided
    if (userId) {
      q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || null,
        } as Order));
        
        setOrders(ordersData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status'], adminNotes?: string) => {
    try {
      const updateData: any = {
        status,
        orderStatus: status,
        updatedAt: serverTimestamp(),
      };

      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }

      if (status === 'confirmed') {
        updateData.confirmedAt = serverTimestamp();
        updateData['trackingSteps.confirmed'] = true;
      } else if (status === 'preparing') {
        updateData['trackingSteps.preparing'] = true;
      } else if (status === 'out_for_delivery') {
        updateData['trackingSteps.outForDelivery'] = true;
      } else if (status === 'delivered') {
        updateData.deliveredAt = serverTimestamp();
        updateData['trackingSteps.delivered'] = true;
      }

      await updateDoc(doc(db, 'orders', orderId), updateData);
      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error };
    }
  }, []);

  // Update payment status
  const updatePaymentStatus = useCallback(async (orderId: string, paymentStatus: Order['paymentStatus'], transactionId?: string) => {
    try {
      const updateData: any = {
        paymentStatus,
        updatedAt: serverTimestamp(),
      };

      if (transactionId) {
        updateData.transactionId = transactionId;
      }

      await updateDoc(doc(db, 'orders', orderId), updateData);
      return { success: true };
    } catch (error) {
      console.error('Error updating payment status:', error);
      return { success: false, error };
    }
  }, []);

  // Cancel order
  const cancelOrder = useCallback(async (orderId: string, cancelReason: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        orderStatus: 'cancelled',
        cancelReason,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error cancelling order:', error);
      return { success: false, error };
    }
  }, []);

  // Delete order
  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting order:', error);
      return { success: false, error };
    }
  }, []);

  // Get order by ID
  const getOrderById = useCallback((orderId: string) => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  // Get orders by status
  const getOrdersByStatus = useCallback((status: Order['status']) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    outForDelivery: orders.filter(o => o.status === 'out_for_delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    
    totalRevenue: orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0),
    
    pendingPayments: orders
      .filter(o => o.paymentStatus === 'pending')
      .reduce((sum, o) => sum + o.total, 0),
  };

  return {
    orders,
    loading,
    error,
    stats,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    deleteOrder,
    getOrderById,
    getOrdersByStatus,
  };
}
