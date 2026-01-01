"use client";

import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export default function RefundPolicyPage() {
  const { settings: rawSettings } = useSettings();
  const settings = (rawSettings || {}) as Record<string, any>;

  const lastUpdated =
    settings.refundPolicyLastUpdated || "December 30, 2025";
  const refundEmail = settings.refundEmail || "refunds@nestsweets.com";
  const supportPhone = settings.supportPhone || "+91 98765 43210";
  const supportHours =
    settings.supportHours ||
    "Mon-Sat: 9:00 AM - 9:00 PM, Sun: 10:00 AM - 6:00 PM";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <RefreshCw className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Refund &amp; Cancellation Policy
              </h1>
              <p className="text-gray-600">Last updated: {lastUpdated}</p>
            </div>
          </div>

          <div className="prose prose-pink max-w-none space-y-8">
            {/* Cancellation Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                <XCircle className="text-pink-600" size={24} />
                Cancellation Policy
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="text-green-600" size={24} />
                    <h3 className="font-bold text-lg">Standard Orders</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li>✅ Free cancellation up to 6 hours before delivery</li>
                    <li>✅ 100% refund if cancelled within allowed time</li>
                    <li>✅ Instant refund processing</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="text-orange-600" size={24} />
                    <h3 className="font-bold text-lg">Custom Orders</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li>⚠️ Require 24 hours advance notice</li>
                    <li>⚠️ 50% refund if cancelled 12-24 hours before</li>
                    <li>⚠️ No refund after preparation starts</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl">
                <h3 className="font-bold text-lg mb-3 text-red-800">
                  Non-Cancellable Orders
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Orders in &quot;Out for Delivery&quot; status</li>
                  <li>Orders after preparation has started</li>
                  <li>
                    Special occasion orders within 6 hours of delivery time
                  </li>
                  <li>Partially delivered orders</li>
                </ul>
              </div>
            </section>

            {/* Refund Process */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                <CreditCard className="text-pink-600" size={24} />
                Refund Process
              </h2>

              <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-xl mb-6">
                <h3 className="font-bold text-lg mb-4">Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">Cancellation Requested</p>
                      <p className="text-gray-700 text-sm">
                        Immediately processed in our system
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-semibold">Refund Initiated</p>
                      <p className="text-gray-700 text-sm">
                        Within 24 hours of cancellation approval
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-semibold">Amount Credited</p>
                      <p className="text-gray-700 text-sm">
                        5-7 business days (depends on your bank)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg">Refund Methods</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    Original payment method (Credit/Debit Card, UPI, Net
                    Banking)
                  </li>
                  <li>Bank transfer for cash on delivery orders</li>
                  <li>Store credit (instant, can be used for future orders)</li>
                </ul>
              </div>
            </section>

            {/* Eligible Scenarios */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                <CheckCircle className="text-pink-600" size={24} />
                Eligible Refund Scenarios
              </h2>

              <div className="space-y-4">
                <div className="bg-white border-2 border-pink-200 p-6 rounded-xl">
                  <h3 className="font-bold text-lg mb-3 text-pink-800">
                    Full Refund (100%)
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                      Order not delivered by promised time (delay &gt; 1 hour)
                    </li>
                    <li>Wrong product delivered</li>
                    <li>Product damaged or spoiled upon delivery</li>
                    <li>Product quality issues (taste, freshness)</li>
                    <li>Missing items from order</li>
                    <li>Order cancelled by NestSweets due to unavailability</li>
                  </ul>
                </div>

                <div className="bg-white border-2 border-orange-200 p-6 rounded-xl">
                  <h3 className="font-bold text-lg mb-3 text-orange-800">
                    Partial Refund (50%)
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                      Cancellation 12-24 hours before delivery (custom orders)
                    </li>
                    <li>Minor product defects reported within 2 hours</li>
                    <li>
                      Partially missing items (refund for missing portion only)
                    </li>
                  </ul>
                </div>

                <div className="bg-white border-2 border-red-200 p-6 rounded-xl">
                  <h3 className="font-bold text-lg mb-3 text-red-800">
                    No Refund
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Change of mind after order preparation</li>
                    <li>Incorrect address provided by customer</li>
                    <li>
                      Customer not available for delivery (after 3 attempts)
                    </li>
                    <li>Product consumed partially or fully</li>
                    <li>Complaints raised after 24 hours of delivery</li>
                    <li>Product stored improperly after delivery</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How to Request */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                <Clock className="text-pink-600" size={24} />
                How to Request a Refund
              </h2>

              <div className="bg-pink-50 p-6 rounded-xl space-y-4">
                <p className="text-gray-700 font-semibold">
                  To request a refund or report an issue:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                  <li>
                    <strong>Via Website:</strong> Go to &quot;My Orders&quot; →
                    Select order → Click &quot;Request Refund&quot;
                  </li>
                  <li>
                    <strong>Via Email:</strong> Send details to {refundEmail}{" "}
                    with order number and photos (if applicable)
                  </li>
                  <li>
                    <strong>Via Phone:</strong> Call {supportPhone} (
                    {supportHours})
                  </li>
                  <li>
                    <strong>Via WhatsApp:</strong> Message us at {supportPhone}{" "}
                    with order details
                  </li>
                </ol>
                <div className="bg-yellow-100 border-2 border-yellow-400 p-4 rounded-lg mt-4">
                  <p className="text-sm text-gray-800">
                    <strong>Important:</strong> Please report quality issues
                    within 2 hours of delivery with clear photos for faster
                    processing.
                  </p>
                </div>
              </div>
            </section>

            {/* Delivery failure refunds */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Delivery Failure Refunds
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Delivery failure due to our fault: 100% refund</li>
                <li>
                  Customer unavailable (after 3 attempts): No refund, 50%
                  rescheduling fee
                </li>
                <li>
                  Incorrect address: No refund, delivery charges applicable for
                  re-delivery
                </li>
                <li>
                  Weather/natural calamities: Full refund or free rescheduling
                </li>
              </ul>
            </section>

            {/* Exchange Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Exchange Policy
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Due to the perishable nature of our products, we do not offer
                exchanges. However, if you receive a wrong or damaged product,
                we will:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Replace it immediately (if available)</li>
                <li>Provide a full refund</li>
                <li>Offer store credit with 10% bonus for future orders</li>
              </ul>
            </section>

            {/* Help CTA */}
            <section className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
              <p className="mb-4 text-pink-100">
                Our customer support team is here to help with any refund or
                cancellation queries:
              </p>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> {refundEmail}
                </p>
                <p>
                  <strong>Phone:</strong> {supportPhone}
                </p>
                <p>
                  <strong>Hours:</strong> {supportHours}
                </p>
              </div>
              <div className="mt-6 bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <p className="text-sm">
                  💡 <strong>Pro Tip:</strong> Enable order notifications to
                  track your order in real-time and avoid delivery issues!
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
