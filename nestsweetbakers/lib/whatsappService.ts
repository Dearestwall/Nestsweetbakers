import { SiteSettings } from '@/hooks/useSettings';

interface CustomCakeRequest {
  name: string;
  phone: string;
  email: string;
  occasion: string;
  flavor: string;
  size: string;
  design: string;
  budget: string;
  deliveryDate: string;
  message: string;
  servings?: string;
  tier?: string;
  eggless?: boolean;
  deliveryAddress?: string;
  urgency?: string;
  referenceImages?: string[];
  requestId?: string;
}

export function generateWhatsAppMessage(
  request: CustomCakeRequest,
  settings: SiteSettings
): string {
  const urgencyEmoji = request.urgency === 'urgent' ? '🔴 *URGENT* ' : '';
  
  let message = `${urgencyEmoji}🎂 *NEW CUSTOM CAKE REQUEST*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📋 Request ID: #${request.requestId || 'PENDING'}\n\n`;
  
  message += `👤 *CUSTOMER DETAILS*\n`;
  message += `Name: ${request.name}\n`;
  message += `Phone: ${request.phone}\n`;
  message += `Email: ${request.email}\n`;
  if (request.deliveryAddress) {
    message += `Address: ${request.deliveryAddress}\n`;
  }
  message += `\n`;
  
  message += `🎂 *CAKE DETAILS*\n`;
  message += `Occasion: ${request.occasion}\n`;
  message += `Flavor: ${request.flavor}\n`;
  message += `Size: ${request.size}\n`;
  if (request.servings) {
    message += `Servings: ${request.servings} people\n`;
  }
  if (request.tier) {
    message += `Tiers: ${request.tier}\n`;
  }
  if (request.eggless) {
    message += `Type: 🥚 Eggless\n`;
  }
  message += `Budget: ₹${request.budget}\n`;
  message += `Delivery: ${new Date(request.deliveryDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}\n`;
  message += `\n`;
  
  message += `🎨 *DESIGN DESCRIPTION*\n`;
  message += `${request.design}\n`;
  message += `\n`;
  
  if (request.message) {
    message += `💬 *ADDITIONAL NOTES*\n`;
    message += `${request.message}\n`;
    message += `\n`;
  }
  
  if (request.referenceImages && request.referenceImages.length > 0) {
    message += `📸 *REFERENCE IMAGES*\n`;
    message += `${request.referenceImages.length} image(s) uploaded\n`;
    request.referenceImages.forEach((img, idx) => {
      message += `Image ${idx + 1}: ${img}\n`;
    });
    message += `\n`;
  }
  
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🔗 *View Full Details:*\n`;
  message += `${process.env.NEXT_PUBLIC_SITE_URL}/admin/custom-requests\n\n`;
  
  message += `📞 *Reply to Customer:*\n`;
  message += `https://wa.me/${request.phone.replace(/[^0-9]/g, '')}\n\n`;
  
  message += `_Automated notification from ${settings.businessName}_`;
  
  return message;
}

export function sendWhatsAppNotification(
  request: CustomCakeRequest,
  settings: SiteSettings
): void {
  const message = generateWhatsAppMessage(request, settings);
  const whatsappNumber = settings.whatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  
  // Open WhatsApp in new tab
  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank');
  }
}

// Alternative: Use WhatsApp Business API (requires setup and costs)
export async function sendWhatsAppBusinessAPI(
  request: CustomCakeRequest,
  settings: SiteSettings
): Promise<void> {
  // This requires WhatsApp Business API setup
  // Free alternative: Use the web URL method above
  console.log('WhatsApp Business API not configured. Using web URL method.');
}
