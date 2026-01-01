import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { orderId, orderData } = await request.json();

    // Configure email transporter (Gmail SMTP)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL, // your-email@gmail.com
        pass: process.env.ADMIN_EMAIL_APP_PASSWORD, // App-specific password
      },
    });

    // Prepare email HTML
    const itemsList = orderData.items.map((item: any, idx: number) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${idx + 1}. ${item.cakeName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.weight}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.totalPrice}</td>
      </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .order-id { background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center; font-size: 20px; font-weight: bold; color: #92400e; margin: 20px 0; }
    .section { margin: 25px 0; }
    .section-title { font-size: 18px; font-weight: bold; color: #1f2937; border-bottom: 2px solid #ec4899; padding-bottom: 8px; margin-bottom: 15px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-label { color: #6b7280; font-weight: 500; }
    .info-value { color: #1f2937; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; }
    .total { background: #ecfdf5; padding: 20px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; color: #065f46; margin-top: 20px; }
    .button { display: inline-block; background: #ec4899; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍰 New Order Received!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">NestSweets Admin Notification</p>
    </div>
    
    <div class="content">
      <div class="order-id">
        Order ID: ${orderData.orderRef}
      </div>

      <div class="section">
        <div class="section-title">📋 Customer Details</div>
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span class="info-value">${orderData.customerInfo.name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="info-value">${orderData.customerInfo.phone}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${orderData.customerInfo.email || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Address:</span>
          <span class="info-value">${orderData.customerInfo.address}, ${orderData.customerInfo.city || ''} - ${orderData.customerInfo.pincode}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Delivery Date:</span>
          <span class="info-value">${new Date(orderData.deliveryDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Delivery Time:</span>
          <span class="info-value">${orderData.deliveryTime === 'morning' ? '9 AM - 12 PM' : orderData.deliveryTime === 'afternoon' ? '12 PM - 4 PM' : '4 PM - 8 PM'}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">🛒 Order Items (${orderData.items.length})</div>
        <table>
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 12px; text-align: left;">Item</th>
              <th style="padding: 12px; text-align: left;">Weight</th>
              <th style="padding: 12px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>
      </div>

      <div class="total">
        Total Amount: ₹${orderData.total.toFixed(2)}
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${orderId}" class="button">
          View Order in Admin Panel
        </a>
      </div>

      ${orderData.specialInstructions ? `
        <div class="section">
          <div class="section-title">📝 Special Instructions</div>
          <p style="padding: 15px; background: #fef3c7; border-radius: 8px; color: #92400e;">${orderData.specialInstructions}</p>
        </div>
      ` : ''}
    </div>

    <div class="footer">
      <p>This is an automated notification from NestSweets Order Management System</p>
      <p style="margin: 5px 0;">📧 ${process.env.ADMIN_EMAIL}</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"NestSweets Orders" <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🍰 New Order #${orderData.orderRef} - ${orderData.customerInfo.name}`,
      html,
    });

    return NextResponse.json({ success: true, message: 'Email sent' });

  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
