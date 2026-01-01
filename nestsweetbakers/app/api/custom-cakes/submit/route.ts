import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();

    // Validate required fields
    if (!requestData.name || !requestData.phone || !requestData.occasion || 
        !requestData.flavor || !requestData.size || !requestData.design || 
        !requestData.budget || !requestData.deliveryDate) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    // Save custom cake request to Firestore
    const docRef = await addDoc(collection(db, 'customCakeRequests'), {
      ...requestData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const requestId = docRef.id;

    // Create admin notification
    try {
      await addDoc(collection(db, 'adminNotifications'), {
        type: 'custom_cake_request',
        requestId,
        requestRef: requestData.requestRef,
        customerName: requestData.name,
        customerPhone: requestData.phone,
        occasion: requestData.occasion,
        budget: requestData.budget,
        deliveryDate: requestData.deliveryDate,
        isGuest: requestData.isGuest,
        status: 'unread',
        createdAt: serverTimestamp(),
      });
    } catch (notifError) {
      console.error('Failed to create admin notification:', notifError);
    }

    // Generate WhatsApp URL
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || process.env.NEXT_PUBLIC_ADMIN_PHONE || '';
    const whatsappUrl = generateWhatsAppUrl(adminPhone, requestData, requestId);

    // Send email notification (non-blocking)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    fetch(`${siteUrl}/api/notifications/email-custom-cake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, requestData: { ...requestData, requestId } }),
    }).catch(err => console.error('Email notification error:', err));

    return NextResponse.json({
      success: true,
      requestId,
      requestRef: requestData.requestRef,
      message: 'Custom cake request submitted successfully',
      whatsappUrl,
    });

  } catch (error: any) {
    console.error('Custom cake request error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to submit request' 
      },
      { status: 500 }
    );
  }
}

// Helper function to generate WhatsApp URL
function generateWhatsAppUrl(phone: string, requestData: any, requestId: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  
  const message = `🎨 *CUSTOM CAKE REQUEST - NestSweets*\n\n` +
    `*Request ID:* ${requestData.requestRef}\n` +
    `*Date:* ${new Date().toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })}\n\n` +
    `*👤 Customer:* ${requestData.name}\n` +
    `*📱 Phone:* ${requestData.phone}\n` +
    `${requestData.email ? `*📧 Email:* ${requestData.email}\n` : ''}` +
    `*📍 Address:* ${requestData.deliveryAddress}\n\n` +
    `*🎉 Occasion:* ${requestData.occasion}\n` +
    `*🍰 Flavor:* ${requestData.flavor}\n` +
    `*📏 Size:* ${requestData.size}\n` +
    `${requestData.servings ? `*👥 Servings:* ${requestData.servings}\n` : ''}` +
    `*🎂 Tiers:* ${requestData.tier}\n` +
    `*🥚 Type:* ${requestData.eggless ? 'Eggless' : 'Regular'}\n` +
    `*💰 Budget:* ₹${requestData.budget}\n\n` +
    `*📅 Delivery Date:* ${new Date(requestData.deliveryDate).toLocaleDateString('en-IN')}\n` +
    `*⚡ Urgency:* ${requestData.urgency === 'urgent' ? '🔴 URGENT' : '🟢 Normal'}\n\n` +
    `*🎨 Design Description:*\n${requestData.design}\n\n` +
    `${requestData.message ? `*📝 Additional Notes:*\n${requestData.message}\n\n` : ''}` +
    `${requestData.referenceImages && requestData.referenceImages.length > 0 ? 
      `*📷 Reference Images:* ${requestData.referenceImages.length} attached\n\n` : ''}` +
    `View request: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/custom-requests/${requestId}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
