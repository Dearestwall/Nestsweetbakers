'use client';

import { JSX, useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle, Package, Clock, MapPin, Phone, Mail, Calendar,
  MessageCircle, Loader2, Download, Share2, Copy, Check,
  ArrowRight, Home, ShoppingBag, AlertCircle, Info, Truck,
  Gift, FileText, User, Star, Heart, Sparkles, ExternalLink,
  LogIn, Shield, Zap, CreditCard, DollarSign, Tag, Edit, RefreshCw
} from 'lucide-react';

interface OrderData {
  orderRef: string;
  status: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city?: string;
    pincode: string;
  };
  items: Array<{
    cakeName: string;
    cakeImage: string;
    quantity: number;
    weight: string;
    basePrice: number;
    totalPrice: number;
    customization?: string;
  }>;
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
  specialInstructions?: string;
  orderNote?: string;
  createdAt: any;
  isGuest?: boolean;
  userId?: string | null;
  trackingSteps?: {
    placed?: boolean;
    confirmed?: boolean;
    preparing?: boolean;
    outForDelivery?: boolean;
    delivered?: boolean;
  };
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { settings, currencySymbol } = useSettings();
  const { showSuccess, showError, showInfo } = useToast();

  const orderId = params.id as string;
  const orderRef = searchParams.get('ref');

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [canClaimOrder, setCanClaimOrder] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    // Check if guest user can claim this order
    if (!user && order && order.isGuest) {
      const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
      const hasGuestOrder = guestOrders.some((o: any) => o.orderRef === order.orderRef);
      setCanClaimOrder(hasGuestOrder);
    }
  }, [user, order]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderDoc = await getDoc(doc(db, 'orders', orderId));

      if (!orderDoc.exists()) {
        showError('Order not found');
        router.push('/');
        return;
      }

      const orderData = { id: orderDoc.id, ...orderDoc.data() } as unknown as OrderData;
      
      // Verify access for guest users
      if (!user && orderData.isGuest && orderRef !== orderData.orderRef) {
        showError('Invalid order reference');
        router.push('/');
        return;
      }

      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order:', error);
      showError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const copyOrderRef = () => {
    if (order?.orderRef) {
      navigator.clipboard.writeText(order.orderRef);
      setCopied(true);
      showSuccess('Order reference copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOrder = async () => {
    const shareData = {
      title: `Order ${order?.orderRef} - NestSweets`,
      text: `Track my order: ${order?.orderRef}`,
      url: `${window.location.origin}/track-order?ref=${order?.orderRef}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      copyOrderRef();
    }
  };

  const openWhatsApp = () => {
    const phone = settings.whatsapp?.replace(/[^0-9]/g, '') || '';
    const message = `Hi! I just placed an order.\n\nOrder ID: ${order?.orderRef}\nName: ${order?.customerInfo.name}\nTotal: ${currencySymbol}${order?.total.toFixed(2)}\n\nLooking forward to my delicious cakes! 🎂`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    setWhatsappSent(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      preparing: 'bg-purple-100 text-purple-800 border-purple-300',
      ready: 'bg-green-100 text-green-800 border-green-300',
      out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      pending: <Clock className="animate-pulse" size={20} />,
      confirmed: <CheckCircle size={20} />,
      preparing: <Package className="animate-bounce" size={20} />,
      ready: <Gift size={20} />,
      out_for_delivery: <Truck className="animate-pulse" size={20} />,
      delivered: <CheckCircle size={20} />,
      cancelled: <AlertCircle size={20} />,
    };
    return icons[status] || <Package size={20} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-lg">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn&apos;t find this order. Please check your order reference.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition shadow-lg"
          >
            <Home size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-6 md:py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Success Header */}
        <div className="text-center mb-6 md:mb-10 animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-scale-in shadow-2xl">
              <CheckCircle className="text-white" size={56} />
            </div>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full animate-ping opacity-30"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-pink-400 rounded-full animate-ping opacity-30 animation-delay-200"></div>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-gray-600 text-base md:text-lg mb-6 max-w-2xl mx-auto">
            Thank you for your order! We&apos;ve received your request and will start preparing your delicious treats.
          </p>

          {/* Order Reference Card */}
          <div className="inline-block bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 p-1 rounded-2xl shadow-2xl animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="bg-white rounded-xl px-6 md:px-10 py-4 md:py-6">
              <p className="text-xs md:text-sm text-gray-600 mb-2 font-semibold uppercase tracking-wide">Your Order Reference</p>
              <div className="flex items-center justify-center gap-3 md:gap-4">
                <p className="text-2xl md:text-4xl font-bold text-gray-800 font-mono tracking-wider">
                  {order.orderRef}
                </p>
                <button
                  onClick={copyOrderRef}
                  className="p-2 md:p-3 hover:bg-gray-100 rounded-lg transition-all transform hover:scale-110"
                  title="Copy reference"
                >
                  {copied ? (
                    <Check className="text-green-600" size={24} />
                  ) : (
                    <Copy className="text-gray-600" size={24} />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {order.isGuest ? '⚠️ Save this to track your order' : '✓ Saved to your account'}
              </p>
            </div>
          </div>
        </div>

        {/* ✅ Guest User - Sign In Banner */}
        {!user && order.isGuest && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-5 md:p-6 text-white shadow-xl mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-start gap-4">
              <Info className="flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="font-bold text-lg md:text-xl mb-2 flex items-center gap-2">
                  Want to track all your orders easily?
                </h3>
                <p className="text-sm md:text-base opacity-90 mb-4">
                  Create an account or sign in to view all your orders in one place, get automatic updates, and enjoy faster checkout next time!
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/login?redirect=/order-confirmation/${orderId}?ref=${order.orderRef}`}
                    className="inline-flex items-center justify-center gap-2 bg-white text-purple-600 px-5 py-2.5 rounded-lg hover:bg-gray-100 transition font-semibold text-sm shadow-md"
                  >
                    <LogIn size={18} />
                    Sign In to Claim This Order
                  </Link>
                  <Link
                    href="/track-order"
                    className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-5 py-2.5 rounded-lg hover:bg-white/10 transition font-semibold text-sm"
                  >
                    <Package size={18} />
                    Track as Guest
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Card */}
            <div className="bg-white rounded-2xl shadow-xl p-5 md:p-8 border border-gray-100 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Package className="text-pink-600" size={28} />
                  Order Status
                </h2>
                <button
                  onClick={fetchOrderDetails}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  title="Refresh status"
                >
                  <RefreshCw className="text-gray-600" size={20} />
                </button>
              </div>

              <div className={`inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-sm md:text-base border-2 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="capitalize">{order.status.replace('_', ' ')}</span>
              </div>

              {/* Tracking Steps */}
              {order.trackingSteps && (
                <div className="mt-8 space-y-4">
                  {[
                    { key: 'placed', label: 'Order Placed', icon: CheckCircle, color: 'green' },
                    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, color: 'blue' },
                    { key: 'preparing', label: 'Preparing', icon: Package, color: 'purple' },
                    { key: 'outForDelivery', label: 'Out for Delivery', icon: Truck, color: 'orange' },
                    { key: 'delivered', label: 'Delivered', icon: Gift, color: 'green' },
                  ].map((step, idx) => {
                    const isCompleted = order.trackingSteps?.[step.key as keyof typeof order.trackingSteps];
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-center gap-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? `bg-${step.color}-500 text-white shadow-lg` 
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold text-sm md:text-base ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          {isCompleted && idx === 0 && (
                            <p className="text-xs text-gray-500">
                              {order.createdAt?.toDate?.()?.toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                        {isCompleted && <Check className="text-green-600" size={24} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Items Card */}
            <div className="bg-white rounded-2xl shadow-xl p-5 md:p-8 border border-gray-100 animate-fade-in" style={{ animationDelay: '500ms' }}>
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <ShoppingBag className="text-pink-600" size={28} />
                Order Items ({order.items.length})
              </h2>

              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                      <Image
                        src={item.cakeImage || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300'}
                        alt={item.cakeName}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base md:text-lg mb-1 line-clamp-2">{item.cakeName}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.weight} • {currencySymbol}{item.basePrice}/kg
                      </p>
                      {item.customization && (
                        <div className="bg-purple-100 rounded-lg px-3 py-2 mb-2 border border-purple-200">
                          <p className="text-xs text-purple-800 flex items-start gap-1.5">
                            <Info size={12} className="flex-shrink-0 mt-0.5" />
                            <span className="font-medium line-clamp-2">{item.customization}</span>
                          </p>
                        </div>
                      )}
                      <p className="text-lg md:text-xl font-bold text-pink-600">
                        {currencySymbol}{item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-3 text-sm md:text-base">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{currencySymbol}{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  {order.deliveryFee === 0 ? (
                    <span className="font-semibold text-green-600 flex items-center gap-1">
                      <Gift size={14} />
                      FREE
                    </span>
                  ) : (
                    <span className="font-semibold">{currencySymbol}{order.deliveryFee.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Packaging Fee</span>
                  <span className="font-semibold">{currencySymbol}{order.packagingFee.toFixed(2)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">{currencySymbol}{order.tax.toFixed(2)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag size={14} />
                      Discount {order.promoCode && `(${order.promoCode})`}
                    </span>
                    <span className="font-semibold">-{currencySymbol}{order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg md:text-xl font-bold pt-3 border-t-2 border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-pink-600">{currencySymbol}{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Gift Info Card */}
            {order.isGift && (
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl shadow-xl p-5 md:p-8 border-2 border-pink-300 animate-fade-in" style={{ animationDelay: '600ms' }}>
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 flex items-center gap-3">
                  <Gift className="text-pink-600" size={28} />
                  Gift Details
                </h2>
                <div className="space-y-3 text-sm md:text-base">
                  <div>
                    <span className="text-gray-600 font-semibold">Recipient:</span>
                    <p className="text-gray-800 font-bold">{order.recipientName}</p>
                  </div>
                  {order.occasionType && (
                    <div>
                      <span className="text-gray-600 font-semibold">Occasion:</span>
                      <p className="text-gray-800 font-bold capitalize">{order.occasionType}</p>
                    </div>
                  )}
                  {order.giftMessage && (
                    <div>
                      <span className="text-gray-600 font-semibold">Gift Message:</span>
                      <p className="text-gray-800 italic bg-white rounded-lg p-3 mt-2 border border-pink-200">
                        &rdquo;{order.giftMessage}&quot;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            {(order.specialInstructions || order.orderNote) && (
              <div className="bg-white rounded-2xl shadow-xl p-5 md:p-8 border border-gray-100 animate-fade-in" style={{ animationDelay: '700ms' }}>
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 flex items-center gap-3">
                  <FileText className="text-pink-600" size={28} />
                  Special Notes
                </h2>
                {order.specialInstructions && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Special Instructions:</p>
                    <p className="text-gray-800 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                      {order.specialInstructions}
                    </p>
                  </div>
                )}
                {order.orderNote && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">Order Note:</p>
                    <p className="text-gray-800 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                      {order.orderNote}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Delivery & Actions */}
          <div className="space-y-6">
            {/* Delivery Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-5 md:p-6 border border-gray-100 animate-fade-in sticky top-4" style={{ animationDelay: '800ms' }}>
              <h2 className="text-lg md:text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">
                <Truck className="text-pink-600" size={24} />
                Delivery Details
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="text-gray-400 flex-shrink-0 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Delivery Date</p>
                    <p className="font-bold text-gray-800">
                      {new Date(order.deliveryDate).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="text-gray-400 flex-shrink-0 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Delivery Time</p>
                    <p className="font-bold text-gray-800">
                      {order.deliveryTime === 'morning' ? '9 AM - 12 PM' : 
                       order.deliveryTime === 'afternoon' ? '12 PM - 4 PM' : 
                       '4 PM - 8 PM'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="text-gray-400 flex-shrink-0 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Delivery Address</p>
                    <p className="font-semibold text-gray-800">{order.customerInfo.address}</p>
                    {order.customerInfo.city && (
                      <p className="text-xs text-gray-600 mt-1">
                        {order.customerInfo.city}, {order.customerInfo.pincode}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="text-gray-400 flex-shrink-0 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Contact Person</p>
                    <p className="font-bold text-gray-800">{order.customerInfo.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="text-gray-400 flex-shrink-0 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <a 
                      href={`tel:${order.customerInfo.phone}`}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      {order.customerInfo.phone}
                    </a>
                  </div>
                </div>

                {order.customerInfo.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="text-gray-400 flex-shrink-0 mt-1" size={18} />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <a 
                        href={`mailto:${order.customerInfo.email}`}
                        className="font-bold text-blue-600 hover:underline break-all"
                      >
                        {order.customerInfo.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Info */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-gray-400" />
                    <span className="font-bold text-gray-800 capitalize">{order.paymentMethod}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Card */}
            <div className="bg-white rounded-2xl shadow-xl p-5 md:p-6 border border-gray-100 space-y-3 animate-fade-in" style={{ animationDelay: '900ms' }}>
              <h3 className="font-bold text-lg mb-4 text-gray-800">Quick Actions</h3>
              
              <button
                onClick={openWhatsApp}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all shadow-md ${
                  whatsappSent
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                }`}
              >
                <MessageCircle size={20} />
                {whatsappSent ? 'WhatsApp Sent ✓' : 'Confirm on WhatsApp'}
                {!whatsappSent && <ExternalLink size={16} />}
              </button>

              <button
                onClick={shareOrder}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md"
              >
                <Share2 size={20} />
                Share Order
              </button>

              <Link
                href={user ? '/orders' : '/track-order'}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-md"
              >
                <Package size={20} />
                {user ? 'View All Orders' : 'Track Order'}
              </Link>

              <Link
                href="/cakes"
                className="w-full flex items-center justify-center gap-2 border-2 border-pink-300 text-pink-600 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-all"
              >
                <ShoppingBag size={20} />
                Order More Cakes
              </Link>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-xl p-5 md:p-6 text-white animate-fade-in" style={{ animationDelay: '1000ms' }}>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Info size={20} />
                Need Help?
              </h3>
              <div className="space-y-3 text-sm">
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <Phone size={16} />
                  Call: {settings.phone}
                </a>
                <a
                  href={`https://wa.me/${settings.whatsapp?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <MessageCircle size={16} />
                  WhatsApp Support
                </a>
                {settings.email && (
                  <a
                    href={`mailto:${settings.email}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <Mail size={16} />
                    {settings.email}
                  </a>
                )}
                <p className="flex items-center gap-2 text-xs opacity-90">
                  <Clock size={14} />
                  {settings.businessHours || '9 AM - 9 PM'}
                </p>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-fade-in" style={{ animationDelay: '1100ms' }}>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="text-green-600 flex-shrink-0" size={32} />
                <div>
                  <p className="font-bold text-gray-800">100% Secure</p>
                  <p className="text-xs text-gray-600">Your order is safe with us</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 animate-fade-in" style={{ animationDelay: '1200ms' }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center">What Happens Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle, title: 'Order Confirmed', desc: 'We\'ve received your order', color: 'green' },
              { icon: MessageCircle, title: 'We\'ll Contact You', desc: 'Via WhatsApp or phone', color: 'blue' },
              { icon: Package, title: 'We Start Baking', desc: 'Fresh on delivery day', color: 'purple' },
              { icon: Truck, title: 'On-Time Delivery', desc: 'To your doorstep', color: 'pink' },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className={`w-16 h-16 bg-${step.color}-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <step.icon className={`text-${step.color}-600`} size={32} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '1300ms' }}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold text-lg"
          >
            <Home size={20} />
            Back to Home
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </div>
  );
}
