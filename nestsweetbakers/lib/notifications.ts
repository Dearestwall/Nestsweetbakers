import { 
  addDoc, 
  collection, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  orderBy,
  limit as limitQuery,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

interface NotificationData {
  userId: string;
  type: 'order' | 'product' | 'general' | 'custom_request' | 'review';
  title: string;
  message: string;
  orderId?: string;
  productId?: string;
  requestId?: string;
  imageUrl?: string;
}

// Send notification to user
export async function sendNotification(data: NotificationData) {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    });
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

// Send notification to all admins
export async function notifyAdmins(
  type: 'order' | 'custom_request' | 'review' | 'general',
  title: string,
  message: string,
  orderId?: string,
  requestId?: string
) {
  try {
    // Get all admins
    const adminsSnapshot = await getDocs(collection(db, 'admins'));
    const superAdminsSnapshot = await getDocs(collection(db, 'superAdmins'));
    
    const allAdmins = [
      ...adminsSnapshot.docs.map(doc => doc.id),
      ...superAdminsSnapshot.docs.map(doc => doc.id)
    ];

    if (allAdmins.length === 0) {
      console.log('No admins found to notify');
      return;
    }

    const notificationPromises = allAdmins.map((adminId) =>
      addDoc(collection(db, 'notifications'), {
        userId: adminId,
        type,
        title,
        message,
        orderId,
        requestId,
        read: false,
        createdAt: serverTimestamp(),
      })
    );

    await Promise.all(notificationPromises);
    console.log(`Notification sent to ${allAdmins.length} admins`);
  } catch (error) {
    console.error('Error notifying admins:', error);
    throw error;
  }
}

// Send notification to all users
export async function sendBroadcastNotification(
  type: 'product' | 'general',
  title: string,
  message: string,
  imageUrl?: string
) {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    const notificationPromises = usersSnapshot.docs.map((userDoc) =>
      addDoc(collection(db, 'notifications'), {
        userId: userDoc.id,
        type,
        title,
        message,
        imageUrl,
        read: false,
        createdAt: serverTimestamp(),
      })
    );

    await Promise.all(notificationPromises);
    console.log(`Broadcast notification sent to ${usersSnapshot.size} users`);
  } catch (error) {
    console.error('Error sending broadcast notification:', error);
    throw error;
  }
}

// Notify user about order status change
export async function notifyOrderStatusChange(
  userId: string,
  orderId: string,
  status: string,
  orderDetails: string
) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    pending: {
      title: '🕐 Order Received',
      message: `Your order ${orderDetails} has been received and is being processed.`,
    },
    processing: {
      title: '👨‍🍳 Order in Progress',
      message: `Your order ${orderDetails} is being prepared with care!`,
    },
    completed: {
      title: '✅ Order Delivered',
      message: `Your order ${orderDetails} has been delivered. Enjoy your cake! 🎂`,
    },
    cancelled: {
      title: '❌ Order Cancelled',
      message: `Your order ${orderDetails} has been cancelled. Contact us for refund.`,
    },
  };

  const notification = statusMessages[status] || {
    title: 'Order Update',
    message: `Your order status has been updated.`,
  };

  await sendNotification({
    userId,
    type: 'order',
    title: notification.title,
    message: notification.message,
    orderId,
  });
}

// Notify user when new product is added
export async function notifyNewProduct(
  productId: string,
  productName: string,
  productImage?: string
) {
  await sendBroadcastNotification(
    'product',
    '🎉 New Cake Added!',
    `Check out our new ${productName}! Fresh and delicious, available now.`,
    productImage
  );
}

// Notify user when custom request is approved
export async function notifyCustomRequestApproved(
  userId: string,
  requestId: string,
  requestDetails: string
) {
  await sendNotification({
    userId,
    type: 'custom_request',
    title: '✓ Custom Request Approved',
    message: `Your custom cake request for ${requestDetails} has been approved! We'll contact you soon.`,
    requestId,
  });
}

// Notify user when review is approved
export async function notifyReviewApproved(
  userId: string,
  productId: string,
  productName: string
) {
  await sendNotification({
    userId,
    type: 'review',
    title: '⭐ Review Published',
    message: `Your review for ${productName} has been published. Thank you for your feedback!`,
    productId,
  });
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(docSnapshot =>
      updateDoc(doc(db, 'notifications', docSnapshot.id), {
        read: true,
        readAt: serverTimestamp()
      })
    );

    await Promise.all(updatePromises);
    console.log(`Marked ${snapshot.size} notifications as read`);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

// Get notifications for a user
export async function getNotifications(userId: string, maxResults = 20) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limitQuery(maxResults)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnapshot => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    }));
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

// Delete notification
export async function deleteNotification(notificationId: string) {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    console.log('Notification deleted successfully');
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

// Delete all notifications for a user
export async function deleteAllNotifications(userId: string) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(docSnapshot =>
      deleteDoc(doc(db, 'notifications', docSnapshot.id))
    );

    await Promise.all(deletePromises);
    console.log(`Deleted ${snapshot.size} notifications`);
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
}
