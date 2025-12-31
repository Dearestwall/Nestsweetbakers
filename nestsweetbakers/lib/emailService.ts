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

export function generateEmailBody(request: CustomCakeRequest, settings: SiteSettings): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #ec4899; }
    .label { font-weight: bold; color: #ec4899; }
    .value { color: #333; margin-left: 10px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .urgent { background: #fee2e2; border-left-color: #ef4444; }
    .image-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 10px; }
    .image-grid img { width: 100%; height: 150px; object-fit: cover; border-radius: 8px; }
    .button { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎂 New Custom Cake Request</h1>
      <p>Request ID: #${request.requestId || 'PENDING'}</p>
    </div>
    
    <div class="content">
      <div class="section ${request.urgency === 'urgent' ? 'urgent' : ''}">
        <h2>📋 Customer Information</h2>
        <p><span class="label">Name:</span><span class="value">${request.name}</span></p>
        <p><span class="label">Phone:</span><span class="value"><a href="tel:${request.phone}">${request.phone}</a></span></p>
        <p><span class="label">Email:</span><span class="value"><a href="mailto:${request.email}">${request.email}</a></span></p>
        ${request.deliveryAddress ? `<p><span class="label">Delivery Address:</span><span class="value">${request.deliveryAddress}</span></p>` : ''}
      </div>
      
      <div class="section">
        <h2>🎂 Cake Details</h2>
        <p><span class="label">Occasion:</span><span class="value">${request.occasion}</span></p>
        <p><span class="label">Flavor:</span><span class="value">${request.flavor}</span></p>
        <p><span class="label">Size/Weight:</span><span class="value">${request.size}</span></p>
        ${request.servings ? `<p><span class="label">Servings:</span><span class="value">${request.servings} people</span></p>` : ''}
        ${request.tier ? `<p><span class="label">Tiers:</span><span class="value">${request.tier}</span></p>` : ''}
        ${request.eggless ? `<p><span class="label">Type:</span><span class="value">🥚 Eggless</span></p>` : ''}
        <p><span class="label">Budget:</span><span class="value">₹${request.budget}</span></p>
        <p><span class="label">Delivery Date:</span><span class="value">${new Date(request.deliveryDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
        ${request.urgency ? `<p><span class="label">Urgency:</span><span class="value">${request.urgency === 'urgent' ? '🔴 URGENT' : '🟢 Normal'}</span></p>` : ''}
      </div>
      
      <div class="section">
        <h2>🎨 Design Description</h2>
        <p>${request.design.replace(/\n/g, '<br>')}</p>
      </div>
      
      ${request.message ? `
      <div class="section">
        <h2>💬 Additional Notes</h2>
        <p>${request.message.replace(/\n/g, '<br>')}</p>
      </div>
      ` : ''}
      
      ${request.referenceImages && request.referenceImages.length > 0 ? `
      <div class="section">
        <h2>📸 Reference Images (${request.referenceImages.length})</h2>
        <div class="image-grid">
          ${request.referenceImages.map(img => `<img src="${img}" alt="Reference" />`).join('')}
        </div>
      </div>
      ` : ''}
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/custom-requests" class="button">
          View in Admin Panel
        </a>
        <br><br>
        <a href="https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=Hi, regarding Custom Cake Request %23${request.requestId}" class="button" style="background: #25D366;">
          Reply via WhatsApp
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>${settings.businessName}</strong></p>
      <p>${settings.address}</p>
      <p>📞 ${settings.phone} | 📧 ${settings.email}</p>
      <p style="margin-top: 10px; color: #999;">This is an automated notification from your custom cake request system.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function sendEmailNotification(
  request: CustomCakeRequest,
  settings: SiteSettings
): Promise<void> {
  const subject = `🎂 New Custom Cake Request - ${request.occasion} - ₹${request.budget}`;
  const body = generateEmailBody(request, settings);
  
  // Method 1: Use EmailJS (free tier available)
  // You'll need to sign up at emailjs.com and get your credentials
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: settings.email,
          subject: subject,
          html_body: body,
          from_name: request.name,
          reply_to: request.email,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('EmailJS failed');
    }
  } catch (error) {
    console.error('Email notification failed:', error);
    // Fallback: Open mailto link (manual)
    const mailtoLink = `mailto:${settings.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`
New Custom Cake Request

Customer: ${request.name}
Phone: ${request.phone}
Email: ${request.email}

Occasion: ${request.occasion}
Flavor: ${request.flavor}
Size: ${request.size}
Budget: ₹${request.budget}
Delivery Date: ${request.deliveryDate}

Design:
${request.design}

${request.message ? `Notes: ${request.message}` : ''}

View full details in admin panel: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/custom-requests
    `)}`;
    
    // This will open the user's default email client
    if (typeof window !== 'undefined') {
      window.open(mailtoLink, '_blank');
    }
  }
}
