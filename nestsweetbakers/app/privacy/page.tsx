"use client";

import { Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export default function PrivacyPolicyPage() {
  const { settings: rawSettings } = useSettings();
  const settings = (rawSettings || {}) as Record<string, any>;

  const lastUpdated =
    settings.privacyPolicyLastUpdated || "December 30, 2025";
  const privacyEmail = settings.privacyEmail || "privacy@nestsweets.com";
  const supportPhone = settings.supportPhone || "+91 98765 43210";
  const address =
    settings.legalAddress ||
    "123 Sweet Street, Narnaund, Haryana 126152, India";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Shield className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className="text-gray-600">Last updated: {lastUpdated}</p>
            </div>
          </div>

          <div className="prose prose-pink max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                <Lock className="text-pink-600" size={24} />
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                At NestSweets, we respect your privacy and are committed to
                protecting your personal data. This privacy policy will inform
                you about how we look after your personal data when you visit
                our website and tell you about your privacy rights and how the
                law protects you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                <Database className="text-pink-600" size={24} />
                Information We Collect
              </h2>
              <div className="space-y-4">
                <div className="bg-pink-50 p-6 rounded-xl">
                  <h3 className="font-bold text-lg mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                      Name and contact information (email, phone number, address)
                    </li>
                    <li>Account credentials (username, password)</li>
                    <li>Payment and billing information</li>
                    <li>Order history and preferences</li>
                    <li>Profile information and photos</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="font-bold text-lg mb-2">
                    Automatically Collected Information
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>IP address and browser type</li>
                    <li>Device information and operating system</li>
                    <li>Pages visited and time spent on our site</li>
                    <li>Referring website addresses</li>
                    <li>Cookies and tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                <Eye className="text-pink-600" size={24} />
                How We Use Your Information
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and account</li>
                <li>Send promotional emails and newsletters (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal obligations</li>
                <li>Personalize your shopping experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                <UserCheck className="text-pink-600" size={24} />
                Your Rights
              </h2>
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-xl space-y-3">
                <p className="font-semibold text-gray-800">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    <strong>Access:</strong> Request copies of your personal data
                  </li>
                  <li>
                    <strong>Rectification:</strong> Correct inaccurate or
                    incomplete data
                  </li>
                  <li>
                    <strong>Erasure:</strong> Request deletion of your personal
                    data
                  </li>
                  <li>
                    <strong>Restrict Processing:</strong> Limit how we use your
                    data
                  </li>
                  <li>
                    <strong>Data Portability:</strong> Transfer your data to
                    another service
                  </li>
                  <li>
                    <strong>Object:</strong> Object to processing of your
                    personal data
                  </li>
                  <li>
                    <strong>Withdraw Consent:</strong> Withdraw consent at any
                    time
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational measures to
                protect your personal data against unauthorized or unlawful
                processing, accidental loss, destruction, or damage. We use SSL
                encryption for all sensitive data transmission and secure servers
                to store your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Third-Party Services
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We may share your information with trusted third-party service
                providers who assist us in operating our website and serving you,
                including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Payment processors (Razorpay, Stripe, PayPal)</li>
                <li>Delivery and logistics partners</li>
                <li>Email service providers</li>
                <li>Analytics services (Google Analytics)</li>
                <li>Cloud storage providers (Firebase, AWS)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Cookies Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies to improve your browsing experience, analyze site
                traffic, and personalize content. You can control cookie
                preferences through your browser settings. For more details, see
                our Cookie Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Children&apos;s Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not directed to children under 13 years of age.
                We do not knowingly collect personal information from children
                under 13. If you are a parent or guardian and believe your child
                has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Changes to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the &quot;Last updated&quot; date. We encourage you
                to review this policy periodically.
              </p>
            </section>

            <section className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Mail size={28} />
                Contact Us
              </h2>
              <p className="mb-4 text-pink-100">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> {privacyEmail}
                </p>
                <p>
                  <strong>Phone:</strong> {supportPhone}
                </p>
                <p>
                  <strong>Address:</strong> {address}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
