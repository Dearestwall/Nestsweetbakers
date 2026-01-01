import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function decrementStock(productId: string, quantity: number = 1) {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      throw new Error('Product not found');
    }

    const currentStock = productSnap.data().stock;
    
    // Only decrement if stock tracking is enabled (stock is not undefined)
    if (currentStock !== undefined) {
      const newStock = Math.max(0, currentStock - quantity);
      
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: new Date()
      });

      // Return low stock warning
      if (newStock <= 10 && newStock > 0) {
        return { success: true, warning: 'low_stock', remaining: newStock };
      } else if (newStock === 0) {
        return { success: true, warning: 'out_of_stock', remaining: 0 };
      }
    }

    return { success: true, warning: null };
  } catch (error) {
    console.error('Error decrementing stock:', error);
    return { success: false, error };
  }
}

export async function incrementStock(productId: string, quantity: number = 1) {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      stock: increment(quantity),
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error incrementing stock:', error);
    return { success: false, error };
  }
}

export async function checkStockAvailability(productId: string, quantity: number = 1): Promise<boolean> {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) return false;

    const currentStock = productSnap.data().stock;
    
    // If stock is undefined, product has unlimited stock
    if (currentStock === undefined) return true;
    
    return currentStock >= quantity;
  } catch (error) {
    console.error('Error checking stock:', error);
    return false;
  }
}
