import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import { decrementStock } from './useStockManager';

export async function createOrder(orderData: any) {
  try {
    const batch = writeBatch(db);

    // Create order
    const orderRef = doc(collection(db, 'orders'));
    batch.set(orderRef, {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Decrement stock for each item
    for (const item of orderData.items) {
      if (item.cakeId) {
        const stockResult = await decrementStock(item.cakeId, item.quantity);
        
        if (!stockResult.success) {
          throw new Error(`Failed to update stock for ${item.cakeName}`);
        }

        // Log stock warning if needed
        if (stockResult.warning === 'low_stock') {
          console.warn(`⚠️ Low stock alert for ${item.cakeName}: ${stockResult.remaining} remaining`);
        } else if (stockResult.warning === 'out_of_stock') {
          console.warn(`❌ Out of stock: ${item.cakeName}`);
        }
      }
    }

    await batch.commit();

    return { success: true, orderId: orderRef.id };
  } catch (error) {
    console.error('Order creation error:', error);
    return { success: false, error };
  }
}
