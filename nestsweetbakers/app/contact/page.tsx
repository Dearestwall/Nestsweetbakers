"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSettings } from "@/hooks/useSettings";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  // Admin‑managed settings (from Firestore) with safe fallbacks
  const { settings: rawSettings } = useSettings();
  const settings = (rawSettings || {}) as Record<string, any>;

  const businessName = settings.businessName || "NestSweets Bakery";
  const primaryPhone = settings.phone || "+91 98765 43210";
  const secondaryPhone = settings.altPhone || "+91 98765 43211";

  const infoEmail = settings.infoEmail || "info@nestsweets.com";
  const ordersEmail = settings.ordersEmail || "orders@nestsweets.com";

  const addressLine1 = settings.addressLine1 || "123 Sweet Street";
  const addressLine2 = settings.addressLine2 || "Narnaund, Haryana 126152";
  const addressCountry = settings.addressCountry || "India";

  const workingHoursWeekdays =
    settings.workingHoursWeekdays || "Mon - Sat: 9:00 AM - 9:00 PM";
  const workingHoursSunday =
    settings.workingHoursSunday || "Sunday: 10:00 AM - 6:00 PM";

  const facebookUrl = settings.facebookUrl || "https://facebook.com";
  const instagramUrl = settings.instagramUrl || "https://instagram.com";
  const twitterUrl = settings.twitterUrl || "https://twitter.com";
  const youtubeUrl = settings.youtubeUrl || "https://youtube.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation (still on client so UX stays nice)
    if (!formData.name.trim()) {
      showError("❌ Please enter your name");
      return;
    }
    if (!formData.email.trim()) {
      showError("❌ Please enter your email");
      return;
    }
    if (!formData.phone.trim()) {
      showError("❌ Please enter your phone number");
      return;
    }
    if (!formData.subject) {
      showError("❌ Please select a subject");
      return;
    }
    if (!formData.message.trim()) {
      showError("❌ Please enter your message");
      return;
    }

    setSubmitting(true);

    try {
      // Save to Firestore so admins can see in panel
      await addDoc(collection(db, "contactMessages"), {
        ...formData,
        status: "unread",
        createdAt: serverTimestamp(),
      });

      showSuccess(
        "✅ Message sent successfully! We'll get back to you within 24 hours."
      );
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      showError(
        "❌ Failed to send message. Please try again or call us directly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have questions about our cakes or services? We’d love to hear from
            you! Fill out the form below or reach us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Call Us */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-pink-200">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <Phone className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-xl mb-2">Call Us</h3>
              <p className="text-gray-600 mb-2">{workingHoursWeekdays}</p>
              <a
                href={`tel:${primaryPhone.replace(/\s+/g, "")}`}
                className="text-pink-600 font-semibold hover:text-pink-700 transition block"
              >
                {primaryPhone}
              </a>
              {secondaryPhone && (
                <a
                  href={`tel:${secondaryPhone.replace(/\s+/g, "")}`}
                  className="text-pink-600 font-semibold hover:text-pink-700 transition block"
                >
                  {secondaryPhone}
                </a>
              )}
            </div>

            {/* Email Us */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-pink-200">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <Mail className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-xl mb-2">Email Us</h3>
              <p className="text-gray-600 mb-2">
                We&apos;ll respond within 24 hours
              </p>
              <a
                href={`mailto:${infoEmail}`}
                className="text-pink-600 font-semibold hover:text-pink-700 transition block"
              >
                {infoEmail}
              </a>
              <a
                href={`mailto:${ordersEmail}`}
                className="text-pink-600 font-semibold hover:text-pink-700 transition block"
              >
                {ordersEmail}
              </a>
            </div>

            {/* Visit Us */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-pink-200">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <MapPin className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-xl mb-2">Visit Us</h3>
              <p className="text-gray-600 mb-1">{addressLine1}</p>
              <p className="text-gray-600 mb-1">{addressLine2}</p>
              <p className="text-gray-600">{addressCountry}</p>
            </div>

            {/* Working Hours */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-pink-200">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-xl mb-2">Working Hours</h3>
              <div className="space-y-1 text-gray-600">
                <p className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <strong>Mon - Sat:</strong>{" "}
                  {workingHoursWeekdays.replace("Mon - Sat:", "").trim()}
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <strong>Sunday:</strong>{" "}
                  {workingHoursSunday.replace("Sunday:", "").trim()}
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="font-bold text-xl mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook size={24} />
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram size={24} />
                </a>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition"
                  aria-label="Follow us on Twitter"
                >
                  <Twitter size={24} />
                </a>
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition"
                  aria-label="Subscribe to our YouTube channel"
                >
                  <Youtube size={24} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form + Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="text-pink-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Send us a Message</h2>
                  <p className="text-gray-600">
                    Fill out the form and we&apos;ll be in touch soon!
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Related</option>
                      <option value="custom">Custom Cake Request</option>
                      <option value="complaint">Complaint</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                    rows={6}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map */}
            <div className="mt-8 bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-96 bg-gray-200 relative">
                <iframe
                  src={
                    settings.googleMapEmbedUrl ||
                    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.424614956698!2d76.13821531506425!3d29.176935382189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDEwJzM3LjAiTiA3NsKwMDgnMjUuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                  }
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${businessName} Location - Narnaund, Haryana`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
