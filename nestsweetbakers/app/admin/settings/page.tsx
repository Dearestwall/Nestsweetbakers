'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';

import { 
  Save, MapPin, Phone, DollarSign, ShoppingCart, Settings as SettingsIcon,
  AlertCircle, CheckCircle, Info, Mail, MessageCircle, Clock, Globe,
  Facebook, Instagram, Twitter, Youtube, Building, Package, Upload,
  Image as ImageIcon, Palette, Bell, CreditCard, Eye, Zap, Shield,
  Loader2, Search, Linkedin, Monitor, Smartphone, X, Check,
  TrendingUp, Users, Award, Store, Tag, Percent, Truck, Home,
  Star, Heart  // ADD THESE TWO
} from 'lucide-react';


interface SiteSettings {
  // Business Info
  businessName: string;
  tagline: string;
  logo: string;
  favicon: string;
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
    linkedin?: string;
    pinterest?: string;
  };
  
  // SEO Settings
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
  
  // Features Toggle
  features: {
    enableWhatsAppOrders: boolean;
    enableCOD: boolean;
    enableOnlinePayment: boolean;
    enableGuestCheckout: boolean;
    enableReviews: boolean;
    enableWishlist: boolean;
    enableNewsletter: boolean;
  };
  
  // Colors & Branding
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  
  // Payment Methods
  paymentMethods: {
    razorpay: boolean;
    stripe: boolean;
    paypal: boolean;
    cod: boolean;
  };
  
  // Notifications
  notifications: {
    orderEmail: string;
    enableSMS: boolean;
    enableEmailNotifications: boolean;
  };
}

export default function AdminSettings() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useToast();

  const [settings, setSettings] = useState<SiteSettings>({
    businessName: 'NestSweets',
    tagline: 'Crafting Sweet Memories',
    logo: '/logo.png',
    favicon: '/favicon.ico',
    cityName: 'Narnaund',
    address: 'Narnaund, Haryana, India',
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    email: 'info@nestsweetbakers.com',
    supportEmail: 'support@nestsweetbakers.com',
    supportPhone: '+91 98765 43210',
    allowedPincodes: '',
    deliveryFee: 50,
    freeDeliveryAbove: 500,
    minimumOrder: 500,
    taxRate: 0,
    currency: 'INR',
    businessHours: 'Mon-Sun: 9 AM - 9 PM',
    deliveryInfo: 'Same-day delivery available',
    socialMedia: {},
    seo: {
      title: 'NestSweets - Premium Cakes & Bakery',
      description: 'Order delicious custom cakes online with same-day delivery',
      keywords: 'cakes, bakery, custom cakes, birthday cakes, wedding cakes',
      ogImage: ''
    },
    features: {
      enableWhatsAppOrders: true,
      enableCOD: true,
      enableOnlinePayment: true,
      enableGuestCheckout: false,
      enableReviews: true,
      enableWishlist: true,
      enableNewsletter: true
    },
    branding: {
      primaryColor: '#ec4899',
      secondaryColor: '#9333ea',
      accentColor: '#f59e0b'
    },
    paymentMethods: {
      razorpay: true,
      stripe: false,
      paypal: false,
      cod: true
    },
    notifications: {
      orderEmail: 'orders@nestsweetbakers.com',
      enableSMS: false,
      enableEmailNotifications: true
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('business');
  const [confirmModal, setConfirmModal] = useState(false);

  // Auth check
  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, router]);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'settings', 'site');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        setSettings(prev => ({
          ...prev,
          ...data,
          socialMedia: { ...prev.socialMedia, ...data.socialMedia },
          seo: { ...prev.seo, ...data.seo },
          features: { ...prev.features, ...data.features },
          branding: { ...prev.branding, ...data.branding },
          paymentMethods: { ...prev.paymentMethods, ...data.paymentMethods },
          notifications: { ...prev.notifications, ...data.notifications }
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Handle image upload to Cloudinary
const handleImageUpload = async (file: File, field: 'logo' | 'favicon' | 'ogImage') => {
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showError('Please upload an image file');
    return;
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showError('Image size should be less than 2MB');
    return;
  }
  
  setUploading(true);
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your_upload_preset');
    formData.append('folder', 'settings');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    const url = data.secure_url;
    
    if (field === 'ogImage') {
      setSettings(prev => ({ ...prev, seo: { ...prev.seo, ogImage: url } }));
    } else {
      setSettings(prev => ({ ...prev, [field]: url }));
    }
    
    setHasChanges(true);
    showSuccess(`${field} uploaded successfully!`);
  } catch (error) {
    console.error('Upload error:', error);
    showError('Failed to upload image');
  } finally {
    setUploading(false);
  }
};


  // Handle change
  const handleChange = (field: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Handle nested change
  const handleNestedChange = (parent: keyof SiteSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: { ...(prev[parent] as any), [field]: value }
    }));
    setHasChanges(true);
  };

  // Handle save
  const handleSave = async () => {
    if (!hasChanges) {
      showInfo('ℹ️ No changes to save');
      return;
    }

    // Validation
    if (!settings.businessName || !settings.phone || !settings.email) {
      showError('❌ Please fill in all required fields (Business Name, Phone, Email)');
      return;
    }

    setConfirmModal(true);
  };

  const confirmSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'settings', 'site');
      await updateDoc(docRef, { ...settings });
      showSuccess('✅ Settings saved successfully!');
      setHasChanges(false);
      setConfirmModal(false);
    } catch (error) {
      console.error('Save error:', error);
      try {
        await setDoc(doc(db, 'settings', 'site'), { ...settings });
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Building, color: 'from-pink-500 to-pink-600' },
    { id: 'contact', label: 'Contact', icon: Phone, color: 'from-green-500 to-green-600' },
    { id: 'delivery', label: 'Delivery & Pricing', icon: Truck, color: 'from-orange-500 to-orange-600' },
    { id: 'branding', label: 'Branding & Logo', icon: Palette, color: 'from-purple-500 to-purple-600' },
    { id: 'social', label: 'Social Media', icon: Globe, color: 'from-blue-500 to-blue-600' },
    { id: 'seo', label: 'SEO', icon: Search, color: 'from-indigo-500 to-indigo-600' },
    { id: 'features', label: 'Features', icon: Zap, color: 'from-yellow-500 to-yellow-600' },
    { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-teal-500 to-teal-600' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-red-500 to-red-600' },
  ];

  const currencySymbol = settings.currency === 'CAD' ? '$' : '₹';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Confirmation Modal */}
        {confirmModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-up">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={confirmSave}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Confirm & Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Site Settings
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Important Information</h3>
              <p className="text-sm text-gray-600">
                These settings control core aspects of your website and business. Changes will be reflected across all pages including contact information, pricing, and delivery details. Make sure to save after making changes.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="flex gap-2 p-2 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6 animate-fade-in">
          {/* ========== BUSINESS INFO TAB ========== */}
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
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    placeholder="NestSweets"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    placeholder="Crafting Sweet Memories"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} />
                    City Name
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
                    Full Address <span className="text-red-500">*</span>
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Currency
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
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Eye className="text-pink-600" size={20} />
                  Business Preview
                </h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="font-bold text-2xl text-gray-800 mb-1">{settings.businessName || 'Business Name'}</p>
                    <p className="text-gray-600 italic">{settings.tagline || 'Your tagline here'}</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin size={16} className="text-pink-600 mt-1" />
                      <p className="text-sm text-gray-700">{settings.address || 'Address not set'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-pink-600" />
                      <p className="text-sm text-gray-700">{settings.businessHours}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-2">Currency</p>
                    <p className="font-bold text-xl text-gray-800">
                      {settings.currency === 'INR' ? '₹ Indian Rupee' : '$ Canadian Dollar'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== CONTACT TAB ========== */}
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
                    Phone Number <span className="text-red-500">*</span>
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
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={settings.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">For WhatsApp order integration</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    Business Email <span className="text-red-500">*</span>
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

              <div className="space-y-6">
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
                </div>

                {/* Contact Preview */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                  <p className="text-xs font-semibold text-gray-600 mb-4 flex items-center gap-2">
                    <Eye size={14} />
                    Contact Preview
                  </p>
                  <div className="space-y-3">
                    <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-pink-600 transition bg-white p-3 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Call Us</p>
                        <p className="font-semibold">{settings.phone || 'Not set'}</p>
                      </div>
                    </a>
                    
                    <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition bg-white p-3 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <MessageCircle size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">WhatsApp</p>
                        <p className="font-semibold">{settings.whatsapp || 'Not set'}</p>
                      </div>
                    </a>
                    
                    <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition bg-white p-3 rounded-lg">
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

          {/* ========== DELIVERY & PRICING TAB ========== */}
          {activeTab === 'delivery' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Truck className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Delivery Settings</h2>
                    <p className="text-sm text-gray-600">Service area configuration</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Allowed Pincodes
                    <span className="text-xs text-gray-500 ml-2">(comma-separated)</span>
                  </label>
                  <textarea
                    value={settings.allowedPincodes}
                    onChange={(e) => handleChange('allowedPincodes', e.target.value)}
                    placeholder="143416,143417,143418"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Orders will only be accepted from these pincodes. Leave empty to allow all pincodes.
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Order Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.minimumOrder}
                    onChange={(e) => handleChange('minimumOrder', Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
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
              </div>

              <div className="space-y-6">
                {/* Pricing Summary */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="text-purple-600" size={20} />
                    Pricing Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Truck size={16} />
                        Delivery Fee:
                      </span>
                      <span className="font-bold text-gray-800">{currencySymbol}{settings.deliveryFee}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Award size={16} />
                        Free Delivery Above:
                      </span>
                      <span className="font-bold text-green-600">{currencySymbol}{settings.freeDeliveryAbove}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <ShoppingCart size={16} />
                        Minimum Order:
                      </span>
                      <span className="font-bold text-gray-800">{currencySymbol}{settings.minimumOrder}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Percent size={16} />
                        Tax Rate:
                      </span>
                      <span className="font-bold text-gray-800">{settings.taxRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Example Calculation */}
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <DollarSign className="text-blue-600" size={20} />
                    Example Order Calculation
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">{currencySymbol}1000.00</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Delivery Fee:</span>
                      {1000 >= settings.freeDeliveryAbove ? (
                        <>
                          <span className="line-through text-gray-400 mr-2">{currencySymbol}{settings.deliveryFee}</span>
                          <span className="text-green-600 font-semibold">FREE</span>
                        </>
                      ) : (
                        <span className="font-semibold">{currencySymbol}{settings.deliveryFee}</span>
                      )}
                    </div>
                    {settings.taxRate > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Tax ({settings.taxRate}%):</span>
                        <span className="font-semibold">{currencySymbol}{(1000 * settings.taxRate / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-3 border-t-2 text-lg">
                      <span className="text-gray-800">Total:</span>
                      <span className="text-pink-600">
                        {currencySymbol}
                        {(1000 + (1000 >= settings.freeDeliveryAbove ? 0 : settings.deliveryFee) + (1000 * settings.taxRate / 100)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {settings.allowedPincodes && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-700 font-semibold mb-1">Delivery Restriction Active</p>
                      <p className="text-xs text-orange-600">
                        Only accepting orders from: {settings.allowedPincodes.split(',').slice(0, 3).join(', ')}
                        {settings.allowedPincodes.split(',').length > 3 && ` +${settings.allowedPincodes.split(',').length - 3} more`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========== BRANDING TAB ========== */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <ImageIcon className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Logo & Images</h2>
                    <p className="text-sm text-gray-600">Upload your brand assets</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Logo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-pink-400 transition">
                      {settings.logo && settings.logo !== '/logo.png' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={settings.logo} alt="Logo" className="h-20 mx-auto mb-3 object-contain" />
                      ) : (
                        <div className="h-20 flex items-center justify-center mb-3">
                          <ImageIcon className="text-gray-300" size={40} />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                        className="hidden"
                        id="logo-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="logo-upload"
                        className={`cursor-pointer text-pink-600 hover:text-pink-700 flex items-center justify-center gap-2 font-semibold ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Upload size={18} />
                        {uploading ? 'Uploading...' : 'Upload Logo'}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG (max 2MB)</p>
                    </div>
                  </div>

                  {/* Favicon Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Favicon</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-pink-400 transition">
                      {settings.favicon && settings.favicon !== '/favicon.ico' ? (
                      <Image src={settings.favicon} alt="Favicon" width={48} height={48} className="mx-auto mb-3" />
                      ) : (
                        <div className="h-12 flex items-center justify-center mb-3">
                          <ImageIcon className="text-gray-300" size={24} />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'favicon')}
                        className="hidden"
                        id="favicon-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="favicon-upload"
                        className={`cursor-pointer text-pink-600 hover:text-pink-700 flex items-center justify-center gap-2 font-semibold ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Upload size={18} />
                        {uploading ? 'Uploading...' : 'Upload Favicon'}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">16x16 or 32x32 px</p>
                    </div>
                  </div>

                  {/* OG Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">OG Image (SEO)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-pink-400 transition">
                      {settings.seo.ogImage ? (
                      <Image src={settings.seo.ogImage} alt="OG Image" width={80} height={80} className="mx-auto mb-3 object-cover rounded" />
                      ) : (
                        <div className="h-20 flex items-center justify-center mb-3">
                          <ImageIcon className="text-gray-300" size={40} />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'ogImage')}
                        className="hidden"
                        id="og-image-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="og-image-upload"
                        className={`cursor-pointer text-pink-600 hover:text-pink-700 flex items-center justify-center gap-2 font-semibold ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Upload size={18} />
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">1200x630 px recommended</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Palette className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Brand Colors</h2>
                    <p className="text-sm text-gray-600">Customize your color scheme</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={settings.branding.primaryColor}
                        onChange={(e) => handleNestedChange('branding', 'primaryColor', e.target.value)}
                        className="w-20 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.branding.primaryColor}
                        onChange={(e) => handleNestedChange('branding', 'primaryColor', e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm"
                      />
                    </div>
                    <div className="mt-2 h-8 rounded-lg" style={{ backgroundColor: settings.branding.primaryColor }}></div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Color</label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={settings.branding.secondaryColor}
                        onChange={(e) => handleNestedChange('branding', 'secondaryColor', e.target.value)}
                        className="w-20 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.branding.secondaryColor}
                        onChange={(e) => handleNestedChange('branding', 'secondaryColor', e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm"
                      />
                    </div>
                    <div className="mt-2 h-8 rounded-lg" style={{ backgroundColor: settings.branding.secondaryColor }}></div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Accent Color</label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={settings.branding.accentColor}
                        onChange={(e) => handleNestedChange('branding', 'accentColor', e.target.value)}
                        className="w-20 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.branding.accentColor}
                        onChange={(e) => handleNestedChange('branding', 'accentColor', e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm"
                      />
                    </div>
                    <div className="mt-2 h-8 rounded-lg" style={{ backgroundColor: settings.branding.accentColor }}></div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <p className="text-sm font-semibold text-gray-600 mb-4">Color Preview</p>
                  <div className="flex gap-3">
                    <button
                      className="px-6 py-3 rounded-lg font-semibold text-white"
                      style={{ backgroundColor: settings.branding.primaryColor }}
                    >
                      Primary Button
                    </button>
                    <button
                      className="px-6 py-3 rounded-lg font-semibold text-white"
                      style={{ backgroundColor: settings.branding.secondaryColor }}
                    >
                      Secondary Button
                    </button>
                    <button
                      className="px-6 py-3 rounded-lg font-semibold text-white"
                      style={{ backgroundColor: settings.branding.accentColor }}
                    >
                      Accent Button
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== SOCIAL MEDIA TAB ========== */}
          {activeTab === 'social' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
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
                      <Facebook size={18} className="text-blue-600" />
                      Facebook Page URL
                    </label>
                    <input
                      type="url"
                      value={settings.socialMedia.facebook || ''}
                      onChange={(e) => handleNestedChange('socialMedia', 'facebook', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Instagram size={18} className="text-pink-600" />
                      Instagram Profile URL
                    </label>
                    <input
                      type="url"
                      value={settings.socialMedia.instagram || ''}
                      onChange={(e) => handleNestedChange('socialMedia', 'instagram', e.target.value)}
                      placeholder="https://instagram.com/yourprofile"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Twitter size={18} className="text-blue-400" />
                      Twitter Profile URL
                    </label>
                    <input
                      type="url"
                      value={settings.socialMedia.twitter || ''}
                      onChange={(e) => handleNestedChange('socialMedia', 'twitter', e.target.value)}
                      placeholder="https://twitter.com/yourhandle"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Youtube size={18} className="text-red-600" />
                      YouTube Channel URL
                    </label>
                    <input
                      type="url"
                      value={settings.socialMedia.youtube || ''}
                      onChange={(e) => handleNestedChange('socialMedia', 'youtube', e.target.value)}
                      placeholder="https://youtube.com/c/yourchannel"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Linkedin size={18} className="text-blue-700" />
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      value={settings.socialMedia.linkedin || ''}
                      onChange={(e) => handleNestedChange('socialMedia', 'linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/yourcompany"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Monitor size={18} className="text-red-500" />
                      Pinterest Profile URL
                    </label>
                    <input
                      type="url"
                      value={settings.socialMedia.pinterest || ''}
                      onChange={(e) => handleNestedChange('socialMedia', 'pinterest', e.target.value)}
                      placeholder="https://pinterest.com/yourprofile"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Social Preview */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Eye size={20} />
                    Social Media Preview
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {settings.socialMedia.facebook && (
                      <a
                        href={settings.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-white rounded-xl hover:shadow-lg transition transform hover:scale-105 flex items-center gap-2"
                      >
                        <Facebook className="text-blue-600" size={24} />
                        <span className="text-sm font-semibold">Facebook</span>
                      </a>
                    )}
                    {settings.socialMedia.instagram && (
                      <a
                        href={settings.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-white rounded-xl hover:shadow-lg transition transform hover:scale-105 flex items-center gap-2"
                      >
                        <Instagram className="text-pink-600" size={24} />
                        <span className="text-sm font-semibold">Instagram</span>
                      </a>
                    )}
                    {settings.socialMedia.twitter && (
                      <a
                        href={settings.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-white rounded-xl hover:shadow-lg transition transform hover:scale-105 flex items-center gap-2"
                      >
                        <Twitter className="text-blue-500" size={24} />
                        <span className="text-sm font-semibold">Twitter</span>
                      </a>
                    )}
                    {settings.socialMedia.youtube && (
                      <a
                        href={settings.socialMedia.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-white rounded-xl hover:shadow-lg transition transform hover:scale-105 flex items-center gap-2"
                      >
                        <Youtube className="text-red-600" size={24} />
                        <span className="text-sm font-semibold">YouTube</span>
                      </a>
                    )}
                    {settings.socialMedia.linkedin && (
                      <a
                        href={settings.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-white rounded-xl hover:shadow-lg transition transform hover:scale-105 flex items-center gap-2"
                      >
                        <Linkedin className="text-blue-700" size={24} />
                        <span className="text-sm font-semibold">LinkedIn</span>
                      </a>
                    )}
                    {!Object.values(settings.socialMedia).some(v => v) && (
                      <p className="text-gray-500 text-sm italic">No social media links added yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== SEO TAB ========== */}
          {activeTab === 'seo' && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Search className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">SEO Settings</h2>
                  <p className="text-sm text-gray-600">Optimize for search engines</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Page Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.seo.title}
                  onChange={(e) => handleNestedChange('seo', 'title', e.target.value)}
                  placeholder="NestSweets - Premium Cakes & Bakery"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {settings.seo.title.length}/60 characters (optimal: 50-60)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={settings.seo.description}
                  onChange={(e) => handleNestedChange('seo', 'description', e.target.value)}
                  placeholder="Order delicious custom cakes online with same-day delivery. Premium quality birthday, wedding, and anniversary cakes."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {settings.seo.description.length}/160 characters (optimal: 150-160)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={settings.seo.keywords}
                  onChange={(e) => handleNestedChange('seo', 'keywords', e.target.value)}
                  placeholder="cakes, bakery, custom cakes, birthday cakes, wedding cakes"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated keywords
                </p>
              </div>

              {/* SEO Preview */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Eye size={20} />
                  Google Search Preview
                </h3>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-blue-800 text-xl hover:underline cursor-pointer mb-1">
                    {settings.seo.title || 'Your Page Title'}
                  </div>
                  <div className="text-green-700 text-sm mb-2">
                    {typeof window !== 'undefined' && window.location.origin}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {settings.seo.description || 'Your meta description will appear here...'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== FEATURES TAB ========== */}
          {activeTab === 'features' && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <Zap className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Feature Toggles</h2>
                  <p className="text-sm text-gray-600">Enable or disable features</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.features).map(([key, value]) => {
                  const icons: any = {
                    enableWhatsAppOrders: MessageCircle,
                    enableCOD: DollarSign,
                    enableOnlinePayment: CreditCard,
                    enableGuestCheckout: Users,
                    enableReviews: Star,
                    enableWishlist: Heart,
                    enableNewsletter: Mail
                  };
                  const Icon = icons[key] || Check;
                  
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl hover:border-pink-300 cursor-pointer transition ${
                        value ? 'bg-pink-50 border-pink-300' : 'border-gray-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        value ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-gray-200'
                      }`}>
                        <Icon className={value ? 'text-white' : 'text-gray-400'} size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace('enable', '').trim()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {value ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleNestedChange('features', key, e.target.checked)}
                        className="w-6 h-6 text-pink-600 rounded focus:ring-pink-500"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========== PAYMENTS TAB ========== */}
          {activeTab === 'payments' && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Payment Methods</h2>
                  <p className="text-sm text-gray-600">Configure payment options</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.paymentMethods).map(([key, value]) => {
                  const labels: any = {
                    razorpay: 'Razorpay',
                    stripe: 'Stripe',
                    paypal: 'PayPal',
                    cod: 'Cash on Delivery'
                  };
                  
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl hover:border-pink-300 cursor-pointer transition ${
                        value ? 'bg-pink-50 border-pink-300' : 'border-gray-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        value ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-gray-200'
                      }`}>
                        <CreditCard className={value ? 'text-white' : 'text-gray-400'} size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{labels[key]}</p>
                        <p className="text-xs text-gray-500">
                          {value ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleNestedChange('paymentMethods', key, e.target.checked)}
                        className="w-6 h-6 text-pink-600 rounded focus:ring-pink-500"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========== NOTIFICATIONS TAB ========== */}
          {activeTab === 'notifications' && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Bell className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
                  <p className="text-sm text-gray-600">Configure notification settings</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order Notification Email
                </label>
                <input
                  type="email"
                  value={settings.notifications.orderEmail}
                  onChange={(e) => handleNestedChange('notifications', 'orderEmail', e.target.value)}
                  placeholder="orders@nestsweetbakers.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  New order notifications will be sent to this email
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 border-2 rounded-xl hover:border-pink-300 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={settings.notifications.enableEmailNotifications}
                    onChange={(e) => handleNestedChange('notifications', 'enableEmailNotifications', e.target.checked)}
                    className="w-6 h-6 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive email alerts for new orders</p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 border-2 rounded-xl hover:border-pink-300 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={settings.notifications.enableSMS}
                    onChange={(e) => handleNestedChange('notifications', 'enableSMS', e.target.checked)}
                    className="w-6 h-6 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">SMS Notifications</p>
                    <p className="text-xs text-gray-500">Receive SMS alerts for new orders</p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Save Button (Sticky) */}
        <div className="sticky bottom-4 flex justify-end mt-8 z-10">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving || uploading}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold shadow-2xl transition-all transform ${
              hasChanges && !saving && !uploading
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span className="text-lg">Saving...</span>
              </>
            ) : uploading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span className="text-lg">Uploading...</span>
              </>
            ) : (
              <>
                <Save size={24} />
                <span className="text-lg">Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
