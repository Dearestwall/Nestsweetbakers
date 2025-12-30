import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'product' | 'system' | 'promo';
  isRead: boolean;
  createdAt: any;
  link?: string;
  metadata?: any;
}

class NotificationService {
  // Send a notification to a specific user
  async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'],
    link?: string,
    metadata?: any
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        isRead: false,
        createdAt: serverTimestamp(),
        link,
        metadata,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Send notification to all users (broadcast)
  async sendBroadcastNotification(
    title: string,
    message: string,
    type: Notification['type'],
    link?: string
  ): Promise<void> {
    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      const notificationPromises = usersSnapshot.docs.map(userDoc =>
        addDoc(collection(db, 'notifications'), {
          userId: userDoc.id,
          title,
          message,
          type,
          isRead: false,
          createdAt: serverTimestamp(),
          link,
        })
      );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error sending broadcast notification:', error);
      throw error;
    }
  }

  // Notify user about new product
  async notifyNewProduct(product: any): Promise<void> {
    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      const notificationPromises = usersSnapshot.docs.map(userDoc =>
        this.sendNotification(
          userDoc.id,
          '🎂 New Cake Available!',
          `Check out our new ${product.name} starting at ₹${product.basePrice}!`,
          'product',
          `/cakes/${product.id}`,
          { productId: product.id, productName: product.name }
        )
      );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error notifying new product:', error);
      // Don't throw error to prevent blocking product creation
    }
  }

  // Notify user about order status change
  async notifyOrderStatusChange(params: {
    orderId: string;
    userId: string;
    customerName: string;
    cakeName: string;
    oldStatus: string;
    newStatus: string;
  }): Promise<void> {
    try {
      let title = '';
      let message = '';

      switch (params.newStatus) {
        case 'processing':
          title = '🔄 Order Being Prepared';
          message = `Great news! We're now preparing your ${params.cakeName}.`;
          break;
        case 'completed':
          title = '✅ Order Completed';
          message = `Your order for ${params.cakeName} has been completed!`;
          break;
        case 'cancelled':
          title = '❌ Order Cancelled';
          message = `Your order for ${params.cakeName} has been cancelled.`;
          break;
        default:
          title = '📦 Order Status Updated';
          message = `Your order for ${params.cakeName} status: ${params.newStatus}`;
      }

      await this.sendNotification(
        params.userId,
        title,
        message,
        'order',
        `/orders/${params.orderId}`,
        { orderId: params.orderId, oldStatus: params.oldStatus, newStatus: params.newStatus }
      );
    } catch (error) {
      console.error('Error notifying order status change:', error);
      // Don't throw to prevent blocking order updates
    }
  }

  // Notify about order confirmation
  async notifyOrderConfirmation(params: {
    userId: string;
    orderId: string;
    cakeName: string;
    totalPrice: number;
    deliveryDate: string;
  }): Promise<void> {
    try {
      await this.sendNotification(
        params.userId,
        '🎉 Order Confirmed!',
        `Your order for ${params.cakeName} has been confirmed. Total: ₹${params.totalPrice}. Delivery: ${new Date(params.deliveryDate).toLocaleDateString()}`,
        'order',
        `/orders/${params.orderId}`,
        { orderId: params.orderId }
      );
    } catch (error) {
      console.error('Error notifying order confirmation:', error);
    }
  }

  // Notify about custom request status
  async notifyCustomRequestStatus(params: {
    userId: string;
    requestId: string;
    occasion: string;
    status: string;
  }): Promise<void> {
    try {
      let title = '';
      let message = '';

      switch (params.status) {
        case 'approved':
          title = '✅ Custom Request Approved';
          message = `Your custom ${params.occasion} cake request has been approved!`;
          break;
        case 'rejected':
          title = '❌ Custom Request Update';
          message = `Unfortunately, we cannot fulfill your ${params.occasion} cake request at this time.`;
          break;
        default:
          title = '📝 Custom Request Update';
          message = `Your ${params.occasion} cake request status: ${params.status}`;
      }

      await this.sendNotification(
        params.userId,
        title,
        message,
        'order',
        `/custom-requests/${params.requestId}`,
        { requestId: params.requestId, status: params.status }
      );
    } catch (error) {
      console.error('Error notifying custom request status:', error);
    }
  }

  // Get user notifications
  async getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Notification))
        .sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all user notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      
      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map(docSnap =>
        updateDoc(doc(db, 'notifications', docSnap.id), { isRead: true })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

export const notificationService = new NotificationService();
