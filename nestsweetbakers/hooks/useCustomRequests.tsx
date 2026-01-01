'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CustomRequest {
  id: string;
  userId: string;
  userName?: string;
  name: string;
  phone: string;
  email?: string;
  userEmail?: string;
  deliveryAddress?: string;
  
  occasion: string;
  flavor: string;
  size: string;
  servings?: string;
  tier?: string;
  eggless?: boolean;
  
  design: string;
  budget: string;
  deliveryDate: string;
  urgency?: string;
  message?: string;
  
  referenceImages?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  
  adminNotes?: string;
  quotedPrice?: number;
  
  createdAt: any;
  updatedAt?: any;
}

export function useCustomRequests(userId?: string) {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q = query(
      collection(db, 'customRequests'),
      orderBy('createdAt', 'desc')
    );

    if (userId) {
      q = query(
        collection(db, 'customRequests'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requestsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || null,
        } as CustomRequest));
        
        setRequests(requestsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching requests:', err);
        setError('Failed to load requests');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Update status
  const updateStatus = useCallback(async (requestId: string, status: CustomRequest['status'], adminNotes?: string, quotedPrice?: number) => {
    try {
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }

      if (quotedPrice) {
        updateData.quotedPrice = quotedPrice;
      }

      await updateDoc(doc(db, 'customRequests', requestId), updateData);
      return { success: true };
    } catch (error) {
      console.error('Error updating status:', error);
      return { success: false, error };
    }
  }, []);

  // Delete request
  const deleteRequest = useCallback(async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'customRequests', requestId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting request:', error);
      return { success: false, error };
    }
  }, []);

  // Get request by ID
  const getRequestById = useCallback((requestId: string) => {
    return requests.find(request => request.id === requestId);
  }, [requests]);

  // Get requests by status
  const getRequestsByStatus = useCallback((status: CustomRequest['status']) => {
    return requests.filter(request => request.status === status);
  }, [requests]);

  // Calculate stats
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    approved: requests.filter(r => r.status === 'approved').length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return {
    requests,
    loading,
    error,
    stats,
    updateStatus,
    deleteRequest,
    getRequestById,
    getRequestsByStatus,
  };
}
