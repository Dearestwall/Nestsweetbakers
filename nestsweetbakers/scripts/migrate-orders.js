// Run this once to migrate existing orders
// node scripts/migrate-orders.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateOrders() {
  try {
    console.log('🔄 Starting migration...');
    
    const ordersSnapshot = await db.collection('orders').get();
    const batch = db.batch();
    let count = 0;

    ordersSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Extract email and phone from nested customerInfo
      const userEmail = data.customerInfo?.email || data.userEmail || null;
      const userPhone = data.customerInfo?.phone || data.userPhone || null;
      
      // Update document with root-level fields
      batch.update(doc.ref, {
        userEmail,
        userPhone,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      count++;
      
      // Firestore batch limit is 500
      if (count % 500 === 0) {
        console.log(`Processing ${count} orders...`);
      }
    });

    await batch.commit();
    console.log(`✅ Migrated ${count} orders successfully!`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrateOrders();
