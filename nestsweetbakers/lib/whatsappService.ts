/**
 * FREE WhatsApp Integration - No API Required
 * Opens WhatsApp with pre-filled message
 */

interface OrderData {
  orderRef: string;
  orderId: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city?: string;
    pincode: string;
  };
  items: any[];
  deliveryDate: string;
  deliveryTime: string;
  isGift?: boolean;
  recipientName?: string;
  giftMessage?: string;
  occasionType?: string;
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  tax: number;
  discount: number;
  promoCode?: string;
  total: number;
  paymentMethod: string;
  specialInstructions?: string;
  orderNote?: string;
}

/**
 * Format order message for WhatsApp
 */
export function formatOrderWhatsAppMessage(orderData: OrderData) {
  const itemsList = orderData.items.map((item: any, idx: number) => 
    `${idx + 1}. *${item.cakeName}*\n` +
    `   Weight: ${item.weight}\n` +
    `   Price: ₹${item.totalPrice}` +
    `${item.customization ? `\n   Note: ${item.customization}` : ''}`
  ).join('\n\n');

  const message = `🎂 *NEW ORDER - NestSweets*\n\n` +
    `*Order ID:* ${orderData.orderRef}\n` +
    `*Order Date:* ${new Date().toLocaleDateString('en-IN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `*👤 CUSTOMER DETAILS*\n` +
    `Name: ${orderData.customerInfo.name}\n` +
    `Phone: ${orderData.customerInfo.phone}\n` +
    `Email: ${orderData.customerInfo.email || 'N/A'}\n\n` +
    `*📍 DELIVERY ADDRESS*\n` +
    `${orderData.customerInfo.address}\n` +
    `${orderData.customerInfo.city ? `City: ${orderData.customerInfo.city}\n` : ''}` +
    `Pincode: ${orderData.customerInfo.pincode}\n\n` +
    `*📅 DELIVERY DETAILS*\n` +
    `Date: ${new Date(orderData.deliveryDate).toLocaleDateString('en-IN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })}\n` +
    `Time: ${
      orderData.deliveryTime === 'morning' ? '9 AM - 12 PM' : 
      orderData.deliveryTime === 'afternoon' ? '12 PM - 4 PM' : 
      '4 PM - 8 PM'
    }\n\n` +
    `${orderData.isGift ? 
      `*🎁 GIFT ORDER*\n` +
      `Recipient: ${orderData.recipientName}\n` +
      `Occasion: ${orderData.occasionType}\n` +
      `${orderData.giftMessage ? `Message: ${orderData.giftMessage}\n` : ''}\n`
      : ''
    }` +
    `*🎂 ORDER ITEMS (${orderData.items.length})*\n${itemsList}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `*💰 PRICE BREAKDOWN*\n` +
    `Subtotal: ₹${orderData.subtotal.toFixed(2)}\n` +
    `Delivery: ${orderData.deliveryFee === 0 ? 'FREE ✅' : '₹' + orderData.deliveryFee}\n` +
    `Packaging: ₹${orderData.packagingFee}\n` +
    `${orderData.tax > 0 ? `Tax: ₹${orderData.tax.toFixed(2)}\n` : ''}` +
    `${orderData.discount > 0 ? `Discount (${orderData.promoCode}): -₹${orderData.discount.toFixed(2)}\n` : ''}` +
    `*TOTAL: ₹${orderData.total.toFixed(2)}*\n\n` +
    `*💳 PAYMENT METHOD:* ${orderData.paymentMethod.toUpperCase()}\n\n` +
    `${orderData.specialInstructions ? 
      `*📝 Special Instructions:*\n${orderData.specialInstructions}\n\n` 
      : ''
    }` +
    `${orderData.orderNote ? 
      `*📌 Order Note:*\n${orderData.orderNote}\n\n` 
      : ''
    }` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🔗 *View Order:*\n${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${orderData.orderId}\n\n` +
    `_Automated notification from NestSweets_`;

  return message;
}

/**
 * Generate WhatsApp URL for admin notification
 */
export function getAdminWhatsAppUrl(orderData: OrderData): string {
  const message = formatOrderWhatsAppMessage(orderData);
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || process.env.NEXT_PUBLIC_ADMIN_PHONE || '';
  const cleanPhone = adminPhone.replace(/[^0-9]/g, '');
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Format customer confirmation message
 */
export function formatCustomerConfirmationMessage(orderData: OrderData): string {
  const itemsList = orderData.items
    .map((item: any, idx: number) => `${idx + 1}. ${item.cakeName} (${item.weight}) - ₹${item.totalPrice}`)
    .join('\n');

  const message = `🍰 *Order Confirmation - NestSweets*\n\n` +
    `Hi ${orderData.customerInfo.name}! 🎉\n\n` +
    `Your order has been received successfully!\n\n` +
    `*Order ID:* ${orderData.orderRef}\n` +
    `*Total Amount:* ₹${orderData.total.toFixed(2)}\n\n` +
    `*Items:*\n${itemsList}\n\n` +
    `*Delivery Details:*\n` +
    `📅 Date: ${new Date(orderData.deliveryDate).toLocaleDateString('en-IN')}\n` +
    `⏰ Time: ${
      orderData.deliveryTime === 'morning' ? '9 AM - 12 PM' : 
      orderData.deliveryTime === 'afternoon' ? '12 PM - 4 PM' : 
      '4 PM - 8 PM'
    }\n` +
    `📍 Address: ${orderData.customerInfo.address}\n\n` +
    `We'll contact you shortly to confirm your order! 📱\n\n` +
    `Track your order:\n${process.env.NEXT_PUBLIC_SITE_URL}/track-order?ref=${orderData.orderRef}\n\n` +
    `For any queries, WhatsApp us:\n${process.env.NEXT_PUBLIC_SITE_URL}\n\n` +
    `Thank you for choosing NestSweets! 💖`;

  return message;
}

/**
 * Generate WhatsApp URL for customer confirmation
 */
export function getCustomerWhatsAppUrl(orderData: OrderData): string {
  const message = formatCustomerConfirmationMessage(orderData);
  const customerPhone = orderData.customerInfo.phone.replace(/[^0-9]/g, '');
  
  return `https://wa.me/${customerPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Format status update message
 */
export function formatStatusUpdateMessage(
  customerName: string,
  orderRef: string,
  status: string
): string {
  const statusMessages: Record<string, string> = {
    confirmed: `✅ Great news ${customerName}!\n\nYour order *${orderRef}* has been confirmed! 🎉\n\nWe're preparing your delicious treats with love.\n\nYou'll receive updates as we progress.`,
    preparing: `👨‍🍳 Hello ${customerName}!\n\nYour order *${orderRef}* is being prepared right now!\n\nOur bakers are working their magic to make your cake perfect. 🎂✨`,
    ready: `🎂 Exciting news ${customerName}!\n\nYour order *${orderRef}* is ready!\n\nWe're preparing it for delivery. You'll receive it soon! 🚚`,
    out_for_delivery: `🚗 On the way ${customerName}!\n\nYour order *${orderRef}* is out for delivery!\n\nExpect it within the scheduled time. Our delivery partner will contact you shortly. 📞`,
    delivered: `🎉 Delivered successfully ${customerName}!\n\nYour order *${orderRef}* has been delivered!\n\nWe hope you enjoy your delicious treats! 🍰\n\nPlease share your feedback with us. Thank you for choosing NestSweets! 💖`,
    cancelled: `❌ Order Cancelled\n\nHello ${customerName}, your order *${orderRef}* has been cancelled.\n\nIf you have any questions, please contact us.\n\nWe're sorry for any inconvenience.`
  };

  const message = statusMessages[status] || 
    `📦 Order Update\n\nHello ${customerName}, your order *${orderRef}* status has been updated to: *${status.toUpperCase()}*`;

  const trackingUrl = `\n\n🔗 Track your order:\n${process.env.NEXT_PUBLIC_SITE_URL}/track-order?ref=${orderRef}`;

  return message + trackingUrl;
}

/**
 * Get WhatsApp URL for status update
 */
export function getStatusUpdateWhatsAppUrl(
  customerPhone: string,
  customerName: string,
  orderRef: string,
  status: string
): string {
  const message = formatStatusUpdateMessage(customerName, orderRef, status);
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
