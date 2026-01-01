import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/twilioService';

export async function GET(request: NextRequest) {
  try {
    const result = await sendWhatsAppMessage({
      to: process.env.ADMIN_WHATSAPP!, // Your phone number
      body: '🎂 Test message from NestSweets!\n\nIf you receive this, Twilio WhatsApp is working! ✅',
    });

    return NextResponse.json({ 
      success: true,
      result,
      message: 'Test message sent! Check your WhatsApp.' 
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
