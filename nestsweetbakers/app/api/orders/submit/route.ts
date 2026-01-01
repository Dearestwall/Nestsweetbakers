import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // Validate required fields
    if (!orderData.customerInfo?.name || !orderData.customerInfo?.phone) {
      return NextResponse.json(
        { error: 'Customer name and phone are required' },
        { status: 400 }
      );
    }

    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // ✅ Extract email and phone to root level for easier querying
    const customerEmail = orderData.customerInfo.email || orderData.userEmail || null;
    const customerPhone = orderData.customerInfo.phone || null;

    // Prepare order document
    const order = {
      ...orderData,
      // ✅ Store at root level for Firestore queries
       userEmail: orderData.customerInfo.email || orderData.userEmail || null,
  userPhone: orderData.customerInfo.phone || null,
  userId: orderData.userId || null,
  isGuest: orderData.isGuest || !orderData.userId,
  status: 'pending',
      orderStatus: 'pending',
      paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'pending',
      trackingSteps: {
        placed: true,
        confirmed: false,
        preparing: false,
        outForDelivery: false,
        delivered: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      source: 'website',
      notifications: {
        emailSent: false,
        whatsappSent: false,
      },
    };

    // Save order to Firestore
    const docRef = await addDoc(collection(db, 'orders'), order);
    const orderId = docRef.id;

    // Create admin notification
    try {
      await addDoc(collection(db, 'adminNotifications'), {
        type: 'new_order',
        orderId,
        orderRef: orderData.orderRef,
        customerName: orderData.customerInfo.name,
        customerPhone: orderData.customerInfo.phone,
        customerEmail: customerEmail,
        total: orderData.total,
        itemCount: orderData.items.length,
        isGuest: order.isGuest,
        status: 'unread',
        createdAt: serverTimestamp(),
      });
    } catch (notifError) {
      console.error('Failed to create admin notification:', notifError);
    }

    // Generate WhatsApp URL
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || process.env.NEXT_PUBLIC_ADMIN_PHONE || '';
    const whatsappUrl = generateWhatsAppUrl(adminPhone, orderData, orderId);

    // Send email notification (non-blocking)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    fetch(`${siteUrl}/api/notifications/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, orderData: { ...orderData, orderId } }),
    }).catch(err => console.error('Email notification error:', err));

    return NextResponse.json({
      success: true,
      orderId,
      orderRef: orderData.orderRef,
      message: 'Order placed successfully',
      whatsappUrl,
    });

  } catch (error: any) {
    console.error('Order submission error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to place order' 
      },
      { status: 500 }
    );
  }
}

// Helper function to generate WhatsApp URL
function generateWhatsAppUrl(phone: string, orderData: any, orderId: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  
  const itemsList = orderData.items.map((item: any, idx: number) => 
    `${idx + 1}. ${item.cakeName} (${item.weight}) - ₹${item.totalPrice}`
  ).join('\n');

  const message = `🎂 *NEW ORDER - NestSweets*\n\n` +
    `*Order ID:* ${orderData.orderRef}\n` +
    `*Date:* ${new Date().toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })}\n\n` +
    `*👤 Customer:* ${orderData.customerInfo.name}\n` +
    `*📱 Phone:* ${orderData.customerInfo.phone}\n` +
    `${orderData.customerInfo.email ? `*📧 Email:* ${orderData.customerInfo.email}\n` : ''}` +
    `*📍 Address:* ${orderData.customerInfo.address}\n` +
    `*📮 Pincode:* ${orderData.customerInfo.pincode}\n\n` +
    `*📅 Delivery:* ${new Date(orderData.deliveryDate).toLocaleDateString('en-IN')}\n` +
    `*⏰ Time:* ${
      orderData.deliveryTime === 'morning' ? '9 AM - 12 PM' : 
      orderData.deliveryTime === 'afternoon' ? '12 PM - 4 PM' : 
      '4 PM - 8 PM'
    }\n\n` +
    `*🎂 Items:*\n${itemsList}\n\n` +
    `*💰 Total:* ₹${orderData.total.toFixed(2)}\n` +
    `*💳 Payment:* ${orderData.paymentMethod.toUpperCase()}\n\n` +
    `View order: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${orderId}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
