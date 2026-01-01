import { NextRequest, NextResponse } from 'next/server';
import { 
  getAdminWhatsAppUrl,
  getCustomerWhatsAppUrl,
  formatOrderWhatsAppMessage,
  formatCustomerConfirmationMessage
} from '@/lib/whatsappService';

export async function POST(request: NextRequest) {
  try {
    const { orderId, orderData, recipient } = await request.json();

    const sendTo = recipient || 'admin';
    const results: any = {};

    // Generate WhatsApp URLs
    if (sendTo === 'admin' || sendTo === 'both') {
      const adminUrl = getAdminWhatsAppUrl({ ...orderData, orderId });
      results.adminUrl = adminUrl;
      results.adminMessage = formatOrderWhatsAppMessage({ ...orderData, orderId });
    }

    if (sendTo === 'customer' || sendTo === 'both') {
      const customerUrl = getCustomerWhatsAppUrl({ ...orderData, orderId });
      results.customerUrl = customerUrl;
      results.customerMessage = formatCustomerConfirmationMessage({ ...orderData, orderId });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp URLs generated',
      results,
    });

  } catch (error: any) {
    console.error('❌ WhatsApp notification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate WhatsApp URLs' },
      { status: 500 }
    );
  }
}
