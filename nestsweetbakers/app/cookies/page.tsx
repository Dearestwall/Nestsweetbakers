"use client";

import { Cookie, Settings, Eye, Shield, CheckSquare } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export default function CookiePolicyPage() {
  const { settings: rawSettings } = useSettings();
  const settings = (rawSettings || {}) as Record<string, any>;

  const lastUpdated =
    settings.cookiePolicyLastUpdated || "December 30, 2025";
  const privacyEmail = settings.privacyEmail || "privacy@nestsweets.com";
  const supportPhone = settings.supportPhone || "+91 98765 43210";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Cookie className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Cookie Policy
              </h1>
              <p className="text-gray-600">Last updated: {lastUpdated}</p>
            </div>
          </div>

          <div className="prose prose-pink max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                What Are Cookies?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies are small text files that are stored on your device when
                you visit our website. They help us provide you with a better
                experience by remembering your preferences, analyzing how you
                use our site, and improving our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                <Eye className="text-pink-600" size={24} />
                Types of Cookies We Use
              </h2>

              <div className="space-y-4">
                <div className="bg-pink-50 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckSquare className="text-pink-600" size={24} />
                    <h3 className="font-bold text-lg">Essential Cookies</h3>
                  </div>
                  <p className="text-gray-700 mb-3">
                    These cookies are necessary for the website to function
                    properly. They enable core functionality such as security,
                    network management, and accessibility.
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    Examples: Session management, shopping cart, authentication
                  </p>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Settings className="text-purple-600" size={24} />
                    <h3 className="font-bold text-lg">Functional Cookies</h3>
                  </div>
                  <p className="text-gray-700 mb-3">
                    These cookies enable enhanced functionality and
                    personalization, such as remembering your preferences and
                    choices.
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    Examples: Language preferences, display settings, saved
                    addresses
                  </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Eye className="text-blue-600" size={24} />
                    <h3 className="font-bold text-lg">Analytics Cookies</h3>
                  </div>
                  <p className="text-gray-700 mb-3">
                    These cookies help us understand how visitors interact with
                    our website by collecting and reporting information
                    anonymously.
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    Examples: Google Analytics, page views, bounce rate,
                    traffic sources
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="text-green-600" size={24} />
                    <h3 className="font-bold text-lg">Marketing Cookies</h3>
                  </div>
                  <p className="text-gray-700 mb-3">
                    These cookies track your browsing habits to deliver relevant
                    advertising and measure campaign effectiveness.
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    Examples: Targeted ads, social media integration,
                    remarketing
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Specific Cookies We Use
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead className="bg-pink-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Cookie Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Purpose
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                        session_id
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Maintains user session
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Session
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                        cart_items
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Stores shopping cart data
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        7 days
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                        user_preferences
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Saves user settings
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        1 year
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                        _ga
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Google Analytics tracking
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        2 years
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                        _fbp
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Facebook Pixel
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        3 months
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                <Settings className="text-pink-600" size={24} />
                Managing Cookies
              </h2>

              <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-xl space-y-4">
                <p className="text-gray-700 font-semibold">
                  You can control and manage cookies in several ways:
                </p>

                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="font-bold mb-2">Browser Settings</h3>
                    <p className="text-gray-700 text-sm">
                      Most browsers allow you to refuse or accept cookies.
                      Check your browser&apos;s help menu for instructions.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="font-bold mb-2">Cookie Preferences</h3>
                    <p className="text-gray-700 text-sm">
                      Click the &quot;Cookie Settings&quot; button at the
                      bottom of our website to customize your preferences.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="font-bold mb-2">Third-Party Opt-Out</h3>
                    <p className="text-gray-700 text-sm">
                      You can opt out of third-party advertising cookies
                      through industry opt-out programs.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-100 border-2 border-yellow-400 p-4 rounded-lg">
                  <p className="text-sm text-gray-800">
                    <strong>⚠️ Note:</strong> Disabling certain cookies may
                    affect website functionality and your user experience.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                How to Delete Cookies
              </h2>
              <div className="space-y-3">
                <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                  <p className="font-semibold mb-2">🌐 Chrome</p>
                  <p className="text-gray-700 text-sm">
                    Settings → Privacy and Security → Clear Browsing Data
                  </p>
                </div>
                <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                  <p className="font-semibold mb-2">🦊 Firefox</p>
                  <p className="text-gray-700 text-sm">
                    Options → Privacy &amp; Security → Clear Data
                  </p>
                </div>
                <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                  <p className="font-semibold mb-2">🧭 Safari</p>
                  <p className="text-gray-700 text-sm">
                    Preferences → Privacy → Manage Website Data
                  </p>
                </div>
                <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                  <p className="font-semibold mb-2">🔷 Edge</p>
                  <p className="text-gray-700 text-sm">
                    Settings → Privacy &amp; Services → Choose What to Clear
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Third-Party Cookies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use services from third-party companies that may set cookies
                on your device:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <strong>Google Analytics:</strong> Website analytics and
                  performance tracking
                </li>
                <li>
                  <strong>Facebook Pixel:</strong> Social media integration and
                  targeted advertising
                </li>
                <li>
                  <strong>Payment Gateways:</strong> Secure payment processing
                </li>
                <li>
                  <strong>Delivery Partners:</strong> Order tracking and
                  logistics
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Updates to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Cookie Policy from time to time. Any changes
                will be posted on this page with an updated &quot;Last
                updated&quot; date. We encourage you to review this policy
                periodically.
              </p>
            </section>

            <section className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4">Questions?</h2>
              <p className="mb-4 text-pink-100">
                If you have any questions about our use of cookies, please
                contact us:
              </p>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> {privacyEmail}
                </p>
                <p>
                  <strong>Phone:</strong> {supportPhone}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
