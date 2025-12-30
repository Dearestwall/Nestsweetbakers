'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

export default function CartPage() {
  const { cart, cartCount, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    deliveryDate: '',
  });

  const handleWhatsAppOrder = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      alert('Please fill in your name and phone number');
      return;
    }

    const orderDetails = cart.map(item => 
      `${item.name} (${item.quantity}x) - ₹${item.basePrice * item.quantity}${item.customization ? `\nCustomization: ${item.customization}` : ''}`
    ).join('\n\n');

    const message = `🎂 *New Order from NestSweets*\n\n*Customer Details:*\nName: ${customerInfo.name}\nPhone: ${customerInfo.phone}\nEmail: ${customerInfo.email || 'N/A'}\nAddress: ${customerInfo.address}\nDelivery Date: ${customerInfo.deliveryDate}\n\n*Order Items:*\n${orderDetails}\n\n*Total: ₹${totalPrice}*`;

    const whatsappUrl = `https://wa.me/911234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (cartCount === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some delicious cakes to get started!</p>
        <Link href="/cakes" className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700">
          Browse Cakes
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart ({cartCount} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={`${item.id}-${item.customization}`} className="bg-white rounded-lg shadow p-4 flex gap-4">
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200'}
                  alt={item.name}
                  fill
                  className="object-cover rounded"
                  sizes="96px"
                />
              </div>

              <div className="flex-grow">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                {item.customization && (
                  <p className="text-sm text-gray-600 mt-1">Note: {item.customization}</p>
                )}
                <p className="text-pink-600 font-bold mt-2">₹{item.basePrice}</p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeFromCart(item.id!)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>

                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                  <button
                    onClick={() => updateQuantity(item.id!, item.quantity - 1)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-medium w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <p className="font-bold">₹{item.basePrice * item.quantity}</p>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Your Name *"
              required
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              required
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            />
            <textarea
              placeholder="Delivery Address *"
              required
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
            <input
              type="date"
              placeholder="Delivery Date"
              value={customerInfo.deliveryDate}
              onChange={(e) => setCustomerInfo({...customerInfo, deliveryDate: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Delivery</span>
              <span>₹50</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span className="text-pink-600">₹{totalPrice + 50}</span>
            </div>
          </div>

          <button
            onClick={handleWhatsAppOrder}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold mb-2"
          >
            Order via WhatsApp
          </button>

          <p className="text-xs text-gray-500 text-center">
            You Will be redirected to WhatsApp to complete your order
          </p>
        </div>
      </div>
    </div>
  );
}
