"use client";

import {
  FileText,
  AlertCircle,
  Shield,
  CreditCard,
  Truck,
  RefreshCw,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export default function TermsPage() {
  const { settings: rawSettings } = useSettings();
  const settings = (rawSettings || {}) as Record<string, any>;

  const lastUpdated =
    settings.termsLastUpdated || "December 30, 2025";
  const legalEmail = settings.legalEmail || "legal@nestsweets.com";
  const supportPhone = settings.supportPhone || "+91 98765 43210";
  const legalAddress =
    settings.legalAddress ||
    "123 Sweet Street, Narnaund, Haryana 126152, India";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <FileText className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Terms of Service
              </h1>
              <p className="text-gray-600">Last updated: {lastUpdated}</p>
            </div>
          </div>

          <div className="prose prose-pink max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                <AlertCircle className="text-pink-600" size={24} />
                Agreement to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using NestSweets website and services, you
                agree to be bound by these Terms of Service and all applicable
                laws and regulations. If you do not agree with any of these
                terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                User Accounts
              </h2>
              <div className="bg-pink-50 p-6 rounded-xl space-y-3">
                <p className="text-gray-700">
                  When creating an account with us, you must:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain the security of your password</li>
                  <li>
                    Be at least 18 years of age or have parental consent
                  </li>
                  <li>Not create multiple accounts</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>
                    Accept responsibility for all activities under your account
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                <CreditCard className="text-pink-600" size={24} />
                Orders and Payments
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">Placing Orders</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                      All orders are subject to availability and acceptance
                    </li>
                    <li>
                      We reserve the right to refuse or cancel any order
                    </li>
                    <li>Prices are subject to change without notice</li>
                    <li>
                      Custom cake orders require advance notice (minimum 24
                      hours)
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="font-bold text-lg mb-2">Payment Terms</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                      Payment is required at the time of order placement
                    </li>
                    <li>
                      We accept major credit cards, debit cards, UPI, and net
                      banking
                    </li>
                    <li>
                      All payments are processed securely through encrypted
                      channels
                    </li>
                    <li>
                      For custom orders over ₹5,000, a 50% advance payment is
                      required
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                <Truck className="text-pink-600" size={24} />
                Delivery Terms
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Delivery times are estimates and not guaranteed</li>
                <li>Delivery charges vary based on location and order value</li>
                <li>
                  Free delivery on orders above ₹1,000 within 10km radius
                </li>
                <li>
                  Same-day delivery available for orders placed before 12 PM
                </li>
                <li>Customer must be available to receive the order</li>
                <li>We are not responsible for delays due to incorrect addresses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                <RefreshCw className="text-pink-600" size={24} />
                Cancellations and Refunds
              </h2>
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-xl space-y-3">
                <p className="font-semibold text-gray-800">
                  Cancellation Policy:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Orders can be cancelled up to 6 hours before delivery</li>
                  <li>
                    Custom cake orders require 24 hours notice for cancellation
                  </li>
                  <li>No cancellation after order preparation has started</li>
                </ul>
                <p className="font-semibold text-gray-800 mt-4">
                  Refund Policy:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    Full refund for orders cancelled within allowed timeframe
                  </li>
                  <li>Refunds processed within 5-7 business days</li>
                  <li>
                    For damaged or incorrect orders, contact us within 2 hours
                    of delivery
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Product Quality and Safety
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>All products are made with fresh, quality ingredients</li>
                <li>We maintain strict hygiene and food safety standards</li>
                <li>Allergen information is provided for all products</li>
                <li>
                  Customers must inform us of any dietary restrictions or
                  allergies
                </li>
                <li>
                  Products should be refrigerated and consumed within
                  recommended time
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Intellectual Property
              </h2>
              <p className="text-gray-700 leading-relaxed">
                All content on this website, including text, graphics, logos,
                images, and software, is the property of NestSweets and
                protected by copyright and trademark laws. Unauthorized use of
                any materials may violate copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                NestSweets shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages resulting from your
                use of our services. Our total liability shall not exceed the
                amount paid by you for the specific product or service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Prohibited Activities
              </h2>
              <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl">
                <p className="font-semibold text-gray-800 mb-3">
                  You may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Use our services for any illegal purpose</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>
                    Interfere with the proper functioning of the website
                  </li>
                  <li>Use automated tools to access our services</li>
                  <li>Impersonate any person or entity</li>
                  <li>Harass, abuse, or harm others</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Modifications to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes
                will be effective immediately upon posting. Your continued use
                of our services constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These terms shall be governed by and construed in accordance
                with the laws of India. Any disputes shall be subject to the
                exclusive jurisdiction of the courts in Haryana, India.
              </p>
            </section>

            <section className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Shield size={28} />
                Contact Information
              </h2>
              <p className="mb-4 text-pink-100">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> {legalEmail}
                </p>
                <p>
                  <strong>Phone:</strong> {supportPhone}
                </p>
                <p>
                  <strong>Address:</strong> {legalAddress}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
