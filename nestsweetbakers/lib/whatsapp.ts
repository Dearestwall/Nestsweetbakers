export function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
) {
  // Remove any non-digit characters and add country code if not present
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const formattedNumber = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
  
  // URL encode the message
  const encodedMessage = encodeURIComponent(message);
  
  // Open WhatsApp with pre-filled message
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}

export function generateOrderWhatsAppMessage(order: {
  cakeName: string;
  quantity: number;
  totalPrice: number;
  deliveryDate: string;
  customerName: string;
}) {
  return `🍰 *New Order from NestSweets!*

📦 *Order Details:*
- Cake: ${order.cakeName}
- Quantity: ${order.quantity} kg
- Total: ₹${order.totalPrice}
- Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString('en-IN')}
- Customer: ${order.customerName}

Thank you for your order! We'll contact you soon to confirm.

Visit: nestsweetbakers.com`;
}

export function generateCustomRequestWhatsAppMessage(request: {
  occasion: string;
  flavor: string;
  size: string;
  budget: string;
  deliveryDate: string;
  name: string;
}) {
  return `✨ *Custom Cake Request from NestSweets!*

🎂 *Request Details:*
- Occasion: ${request.occasion}
- Flavor: ${request.flavor}
- Size: ${request.size}
- Budget: ₹${request.budget}
- Delivery Date: ${new Date(request.deliveryDate).toLocaleDateString('en-IN')}
- Customer: ${request.name}

Our cake artists will contact you soon to discuss your dream design!

Visit: nestsweetbakers.com`;
}

// For admin - send to business WhatsApp
export function notifyAdminViaWhatsApp(message: string) {
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '919876543210';
  sendWhatsAppMessage(adminPhone, message);
}
