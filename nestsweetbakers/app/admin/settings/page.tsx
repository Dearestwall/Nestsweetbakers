'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/context/ToastContext';
import { 
  Save, 
  MapPin, 
  Phone, 
  DollarSign, 
  ShoppingCart, 
  Settings as SettingsIcon,
  AlertCircle,
  CheckCircle,
  Info,
  Mail,
  MessageCircle,
  Clock,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Building,
  Package
} from 'lucide-react';

interface SiteSettings {
  // Business Info
  businessName: string;
  cityName: string;
  address: string;
  
  // Contact Info
  phone: string;
  whatsapp: string;
  email: string;
  supportEmail: string;
  supportPhone: string;
  
  // Delivery & Pricing
  allowedPincodes: string;
  deliveryFee: number;
  freeDeliveryAbove: number;
  minimumOrder: number;
  taxRate: number;
  currency: 'INR' | 'CAD';
  
  // Business Hours & Info
  businessHours: string;
  deliveryInfo: string;
  
  // Social Media
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    businessName: 'Nest Sweet Bakers',
    cityName: '',
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    supportEmail: '',
    supportPhone: '',
    allowedPincodes: '',
    deliveryFee: 50,
    freeDeliveryAbove: 500,
    minimumOrder: 500,
    taxRate: 0,
    currency: 'INR',
    businessHours: 'Mon-Sun: 9 AM - 9 PM',
    deliveryInfo: 'Same-day delivery available',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
    },
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'business' | 'contact' | 'delivery' | 'social'>('business');
  const { showSuccess, showError, showInfo } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      const docRef = doc(db, 'settings', 'site');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        setSettings({
          businessName: data.businessName || 'Nest Sweet Bakers',
          cityName: data.cityName || '',
          address: data.address || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          supportEmail: data.supportEmail || '',
          supportPhone: data.supportPhone || '',
          allowedPincodes: data.allowedPincodes || '',
          deliveryFee: data.deliveryFee || 50,
          freeDeliveryAbove: data.freeDeliveryAbove || 500,
          minimumOrder: data.minimumOrder || 500,
          taxRate: data.taxRate || 0,
          currency: data.currency || 'INR',
          businessHours: data.businessHours || 'Mon-Sun: 9 AM - 9 PM',
          deliveryInfo: data.deliveryInfo || 'Same-day delivery available',
          socialMedia: data.socialMedia || {},
        });
      } else {
        // Create default settings
        const defaultSettings: SiteSettings = {
          businessName: 'Nest Sweet Bakers',
          cityName: process.env.NEXT_PUBLIC_CITY_NAME || '',
          address: 'Narnaund, Haryana, India',
          phone: '+91 98765 43210',
          whatsapp: '+91 98765 43210',
          email: 'info@nestsweetbakers.com',
          supportEmail: 'support@nestsweetbakers.com',
          supportPhone: '+91 98765 43210',
          allowedPincodes: process.env.NEXT_PUBLIC_CITY_PINCODES || '',
          deliveryFee: 50,
          freeDeliveryAbove: 500,
          minimumOrder: 500,
          taxRate: 0,
          currency: 'INR',
          businessHours: 'Mon-Sun: 9 AM - 9 PM',
          deliveryInfo: 'Same-day delivery available',
          socialMedia: {},
        };
        await setDoc(docRef, defaultSettings);
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showError('❌ Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (field: keyof SiteSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSocialMediaChange = (platform: keyof SiteSettings['socialMedia'], value: string) => {
    setSettings(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      showInfo('ℹ️ No changes to save');
      return;
    }

    // Validation
    if (!settings.businessName || !settings.phone || !settings.email) {
      showError('❌ Please fill in all required fields');
      return;
    }

    setConfirmModal(true);
  };

  const confirmSave = async () => {
  setSaving(true);
  try {
    const docRef = doc(db, 'settings', 'site'); // Add this line
    await updateDoc(docRef, { ...settings });
    showSuccess('✅ Settings saved successfully!');
    setHasChanges(false);
    setConfirmModal(false);
  } catch (error) {
    console.error('Error saving settings:', error);
    // Try creating if update fails
    try {
      const docRef = doc(db, 'settings', 'site'); // Add this line
      await setDoc(docRef, { ...settings });
      showSuccess('✅ Settings saved successfully!');
      setHasChanges(false);
      setConfirmModal(false);
    } catch (setError) {
      showError('❌ Failed to save settings');
    }
  } finally {
    setSaving(false);
  }
};


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-pink-200 rounded-full animate-ping"></div>
            <div className="relative w-24 h-24 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-semibold text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  const currencySymbol = settings.currency === 'CAD' ? '$' : '₹';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-up">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Save className="text-blue-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
              Save Settings?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to save these changes? This will update your business settings across the entire website.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Site Settings
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <SettingsIcon size={16} />
            Configure your business information, contact details, and preferences
          </p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg border-2 border-yellow-200 animate-pulse">
            <AlertCircle size={18} />
            <span className="text-sm font-semibold">Unsaved Changes</span>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Info className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Important Information</h3>
            <p className="text-sm text-gray-600">
              These settings control core aspects of your website and business. Changes will be reflected across all pages including contact information, pricing, and delivery details.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('business')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'business'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building size={18} />
            Business Info
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'contact'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Phone size={18} />
            Contact Details
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'delivery'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package size={18} />
            Delivery & Pricing
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'social'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Globe size={18} />
            Social Media
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* Business Info Tab */}
        {activeTab === 'business' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Building className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Business Details</h2>
                  <p className="text-sm text-gray-600">Company information</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  placeholder="Nest Sweet Bakers"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  City Name *
                </label>
                <input
                  type="text"
                  value={settings.cityName}
                  onChange={(e) => handleChange('cityName', e.target.value)}
                  placeholder="Narnaund"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Address *
                </label>
                <textarea
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Street, City, State, Country"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Business Hours
                </label>
                <input
                  type="text"
                  value={settings.businessHours}
                  onChange={(e) => handleChange('businessHours', e.target.value)}
                  placeholder="Mon-Sun: 9 AM - 9 PM"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Currency & Tax</h2>
                  <p className="text-sm text-gray-600">Financial settings</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value as 'INR' | 'CAD')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.taxRate}
                  onChange={(e) => handleChange('taxRate', Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">GST/Sales Tax percentage</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Information
                </label>
                <input
                  type="text"
                  value={settings.deliveryInfo}
                  onChange={(e) => handleChange('deliveryInfo', e.target.value)}
                  placeholder="Same-day delivery available"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Short delivery message for customers</p>
              </div>

              {/* Preview Card */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border-2 border-pink-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Preview</p>
                <div className="space-y-2">
                  <p className="font-bold text-gray-800">{settings.businessName || 'Business Name'}</p>
                  <p className="text-sm text-gray-600">{settings.address || 'Address'}</p>
                  <p className="text-sm text-gray-600">{settings.businessHours}</p>
                  <p className="text-xs text-pink-600 font-semibold">{settings.deliveryInfo}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Details Tab */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Phone className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Primary Contact</h2>
                  <p className="text-sm text-gray-600">Main contact information</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone size={16} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Include country code</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MessageCircle size={16} />
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  value={settings.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">For WhatsApp integration</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Mail size={16} />
                  Business Email *
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="info@nestsweetbakers.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Mail className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Support Contact</h2>
                  <p className="text-sm text-gray-600">Customer support details</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  placeholder="support@nestsweetbakers.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Support Phone
                </label>
                <input
                  type="tel"
                  value={settings.supportPhone}
                  onChange={(e) => handleChange('supportPhone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Contact Preview */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                <p className="text-xs font-semibold text-gray-600 mb-4">Contact Preview</p>
                <div className="space-y-3">
                  <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-pink-600 transition">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Call Us</p>
                      <p className="font-semibold">{settings.phone || 'Not set'}</p>
                    </div>
                  </a>
                  <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <MessageCircle size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">WhatsApp</p>
                      <p className="font-semibold">{settings.whatsapp || 'Not set'}</p>
                    </div>
                  </a>
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-sm break-all">{settings.email || 'Not set'}</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery & Pricing Tab */}
        {activeTab === 'delivery' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <MapPin className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Delivery Settings</h2>
                  <p className="text-sm text-gray-600">Service area configuration</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Allowed Pincodes *
                  <span className="text-xs text-gray-500 ml-2">(comma-separated)</span>
                </label>
                <textarea
                  value={settings.allowedPincodes}
                  onChange={(e) => handleChange('allowedPincodes', e.target.value)}
                  placeholder="143416,143417,143418"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Orders will only be accepted from these pincodes
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Fee ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.deliveryFee}
                  onChange={(e) => handleChange('deliveryFee', Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Free Delivery Above ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.freeDeliveryAbove}
                  onChange={(e) => handleChange('freeDeliveryAbove', Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Orders above this amount get free delivery
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Order Settings</h2>
                  <p className="text-sm text-gray-600">Minimum order requirements</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Order Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.minimumOrder}
                  onChange={(e) => handleChange('minimumOrder', Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Pricing Summary */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="text-purple-600" size={20} />
                  Pricing Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Delivery Fee:</span>
                    <span className="font-bold text-gray-800">{currencySymbol}{settings.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Free Delivery Above:</span>
                    <span className="font-bold text-green-600">{currencySymbol}{settings.freeDeliveryAbove}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Minimum Order:</span>
                    <span className="font-bold text-gray-800">{currencySymbol}{settings.minimumOrder}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-purple-200">
                    <span className="text-sm text-gray-600">Tax Rate:</span>
                    <span className="font-bold text-gray-800">{settings.taxRate}%</span>
                  </div>
                </div>
              </div>

              {/* Example Calculation */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Example Order:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{currencySymbol}1000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery:</span>
                    <span className="line-through text-gray-400">{currencySymbol}{settings.deliveryFee}</span>
                    <span className="text-green-600 ml-1">FREE</span>
                  </div>
                  {settings.taxRate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax ({settings.taxRate}%):</span>
                      <span>{currencySymbol}{(1000 * settings.taxRate / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>{currencySymbol}{(1000 + (1000 * settings.taxRate / 100)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Globe className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Social Media Links</h2>
                  <p className="text-sm text-gray-600">Connect your social profiles</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Facebook size={16} className="text-blue-600" />
                    Facebook Page URL
                  </label>
                  <input
                    type="url"
                    value={settings.socialMedia.facebook || ''}
                    onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Instagram size={16} className="text-pink-600" />
                    Instagram Profile URL
                  </label>
                  <input
                    type="url"
                    value={settings.socialMedia.instagram || ''}
                    onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                    placeholder="https://instagram.com/yourprofile"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Twitter size={16} className="text-blue-400" />
                    Twitter Profile URL
                  </label>
                  <input
                    type="url"
                    value={settings.socialMedia.twitter || ''}
                    onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                    placeholder="https://twitter.com/yourhandle"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Youtube size={16} className="text-red-600" />
                    YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    value={settings.socialMedia.youtube || ''}
                    onChange={(e) => handleSocialMediaChange('youtube', e.target.value)}
                    placeholder="https://youtube.com/c/yourchannel"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Social Preview */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="font-bold text-gray-800 mb-4">Social Media Preview</h3>
                <div className="flex gap-3 flex-wrap">
                  {settings.socialMedia.facebook && (
                    <a
                      href={settings.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
                    >
                      <Facebook className="text-blue-600" size={24} />
                    </a>
                  )}
                  {settings.socialMedia.instagram && (
                    <a
                      href={settings.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-pink-100 rounded-lg hover:bg-pink-200 transition"
                    >
                      <Instagram className="text-pink-600" size={24} />
                    </a>
                  )}
                  {settings.socialMedia.twitter && (
                    <a
                      href={settings.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
                    >
                      <Twitter className="text-blue-500" size={24} />
                    </a>
                  )}
                  {settings.socialMedia.youtube && (
                    <a
                      href={settings.socialMedia.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-red-100 rounded-lg hover:bg-red-200 transition"
                    >
                      <Youtube className="text-red-600" size={24} />
                    </a>
                  )}
                  {!settings.socialMedia.facebook && !settings.socialMedia.instagram && 
                   !settings.socialMedia.twitter && !settings.socialMedia.youtube && (
                    <p className="text-gray-500 text-sm">No social media links added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end sticky bottom-4">
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transition-all transform ${
            hasChanges && !saving
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save size={24} />
          {saving ? 'Saving...' : hasChanges ? 'Save All Changes' : 'No Changes'}
        </button>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
