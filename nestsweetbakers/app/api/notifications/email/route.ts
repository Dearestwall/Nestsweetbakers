import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { orderId, orderData } = await request.json();

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_EMAIL_APP_PASSWORD) {
      console.warn('Email credentials not configured');
      return NextResponse.json(
        { success: false, error: 'Email not configured' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_APP_PASSWORD,
      },
    });

    const itemsList = orderData.items
      .map((item: any) => `- ${item.cakeName} (${item.weight}) - ₹${item.totalPrice}`)
      .join('\n');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ec4899; text-align: center;">🎂 New Order Received!</h1>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2>Order #${orderData.orderRef}</h2>
          <p><strong>Order Date:</strong> ${new Date().toLocaleString('en-IN')}</p>
        </div>

        <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${orderData.customerInfo.name}</p>
          <p><strong>Phone:</strong> ${orderData.customerInfo.phone}</p>
          ${orderData.customerInfo.email ? `<p><strong>Email:</strong> ${orderData.customerInfo.email}</p>` : ''}
          <p><strong>Address:</strong> ${orderData.customerInfo.address}</p>
          <p><strong>Pincode:</strong> ${orderData.customerInfo.pincode}</p>
        </div>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>Delivery Details</h3>
          <p><strong>Date:</strong> ${new Date(orderData.deliveryDate).toLocaleDateString('en-IN')}</p>
          <p><strong>Time:</strong> ${orderData.deliveryTime}</p>
        </div>

        <div style="background: #eff6ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>Order Items</h3>
          <pre style="white-space: pre-wrap;">${itemsList}</pre>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>Order Summary</h3>
          <p><strong>Subtotal:</strong> ₹${orderData.subtotal.toFixed(2)}</p>
          <p><strong>Delivery Fee:</strong> ₹${orderData.deliveryFee.toFixed(2)}</p>
          <p><strong>Total:</strong> ₹${orderData.total.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${orderData.paymentMethod.toUpperCase()}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${orderId}" 
             style="background: #ec4899; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold;">
            View Order Details
          </a>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `🎂 New Order #${orderData.orderRef} - NestSweets`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
