'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SiteSettings {
  enableWhatsAppOrders: boolean;
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

const defaultSettings: SiteSettings = {
  // Business Info
  businessName: 'NestSweets',
  tagline: 'Crafting Sweet Memories',
  logo: '/logo.png',
  favicon: '/favicon.ico',
  cityName: 'Narnaund',
  address: 'Narnaund, Haryana, India',

  // Contact Info
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'info@nestsweetbakers.com',
  supportEmail: 'support@nestsweetbakers.com',
  supportPhone: '+91 98765 43210',

  // Delivery & Pricing
  allowedPincodes: '',
  deliveryFee: 50,
  freeDeliveryAbove: 500,
  minimumOrder: 500,
  taxRate: 0,
  currency: 'INR',

  // Business Hours & Info
  businessHours: 'Mon-Sun: 9 AM - 9 PM',
  deliveryInfo: 'Same-day delivery available',

  // Social Media
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    linkedin: '',
    pinterest: '',
  },

  // SEO Settings
  seo: {
    title: 'NestSweets - Premium Cakes & Bakery',
    description: 'Order delicious custom cakes online with same-day delivery',
    keywords: 'cakes, bakery, custom cakes, birthday cakes, wedding cakes',
    ogImage: ''
  },

  // Features Toggle
  features: {
    enableWhatsAppOrders: true,
    enableCOD: true,
    enableOnlinePayment: true,
    enableGuestCheckout: false,
    enableReviews: true,
    enableWishlist: true,
    enableNewsletter: true
  },

  // Colors & Branding
  branding: {
    primaryColor: '#ec4899',
    secondaryColor: '#9333ea',
    accentColor: '#f59e0b'
  },

  // Payment Methods
  paymentMethods: {
    razorpay: true,
    stripe: false,
    paypal: false,
    cod: true
  },

  // Notifications
  notifications: {
    orderEmail: 'orders@nestsweetbakers.com',
    enableSMS: false,
    enableEmailNotifications: true
  },
  enableWhatsAppOrders: false
};

// Helper function to get currency symbol
export const getCurrencySymbol = (currency: 'INR' | 'CAD' = 'INR'): string => {
  return currency === 'CAD' ? '$' : '₹';
};

// Helper function to format price
export const formatPrice = (amount: number, currency: 'INR' | 'CAD' = 'INR'): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
};

// Helper function to format phone number for WhatsApp
export const formatWhatsAppNumber = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '');
};

// Helper function to get WhatsApp link
export const getWhatsAppLink = (phone: string, message?: string, businessName?: string): string => {
  const formattedPhone = formatWhatsAppNumber(phone);
  const defaultMessage = `Hi ${businessName || 'there'}, I'd like to place an order.`;
  const text = message || defaultMessage;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
};

// Helper function to check if pincode is allowed
export const isPincodeAllowed = (pincode: string, allowedPincodes: string): boolean => {
  if (!allowedPincodes || allowedPincodes.trim() === '') return true;
  const pincodes = allowedPincodes.split(',').map(p => p.trim());
  return pincodes.includes(pincode.trim());
};

// Helper function to calculate delivery fee
export const calculateDeliveryFee = (orderTotal: number, settings: SiteSettings): number => {
  if (orderTotal >= settings.freeDeliveryAbove) {
    return 0;
  }
  return settings.deliveryFee;
};

// Helper function to calculate tax
export const calculateTax = (amount: number, taxRate: number): number => {
  return (amount * taxRate) / 100;
};

// Helper function to calculate order total
export const calculateOrderTotal = (
  subtotal: number,
  settings: SiteSettings,
  includeDelivery: boolean = true
): {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
} => {
  const deliveryFee = includeDelivery ? calculateDeliveryFee(subtotal, settings) : 0;
  const tax = calculateTax(subtotal, settings.taxRate);
  const total = subtotal + deliveryFee + tax;
  
  return {
    subtotal,
    deliveryFee,
    tax,
    total,
  };
};

// Context for Settings
interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  currencySymbol: string;
  formatPrice: (amount: number) => string;
  getWhatsAppLink: (message?: string) => string;
  isDeliveryAvailable: (pincode: string) => boolean;
  calculateDeliveryFee: (orderTotal: number) => number;
  calculateOrderTotal: (subtotal: number, includeDelivery?: boolean) => {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
  };
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Settings Provider Component
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data() as Partial<SiteSettings>;
        setSettings({
          ...defaultSettings,
          ...data,
          socialMedia: { ...defaultSettings.socialMedia, ...data.socialMedia },
          seo: { ...defaultSettings.seo, ...data.seo },
          features: { ...defaultSettings.features, ...data.features },
          branding: { ...defaultSettings.branding, ...data.branding },
          paymentMethods: { ...defaultSettings.paymentMethods, ...data.paymentMethods },
          notifications: { ...defaultSettings.notifications, ...data.notifications }
        });
      } else {
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Real-time listener
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'site'),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as Partial<SiteSettings>;
          setSettings({
            ...defaultSettings,
            ...data,
            socialMedia: { ...defaultSettings.socialMedia, ...data.socialMedia },
            seo: { ...defaultSettings.seo, ...data.seo },
            features: { ...defaultSettings.features, ...data.features },
            branding: { ...defaultSettings.branding, ...data.branding },
            paymentMethods: { ...defaultSettings.paymentMethods, ...data.paymentMethods },
            notifications: { ...defaultSettings.notifications, ...data.notifications }
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to settings:', err);
        setError('Failed to listen to settings updates');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const currencySymbol = getCurrencySymbol(settings.currency);

  const value: SettingsContextType = {
    settings,
    loading,
    error,
    currencySymbol,
    formatPrice: (amount: number) => formatPrice(amount, settings.currency),
    getWhatsAppLink: (message?: string) => getWhatsAppLink(settings.whatsapp, message, settings.businessName),
    isDeliveryAvailable: (pincode: string) => isPincodeAllowed(pincode, settings.allowedPincodes),
    calculateDeliveryFee: (orderTotal: number) => calculateDeliveryFee(orderTotal, settings),
    calculateOrderTotal: (subtotal: number, includeDelivery: boolean = true) => 
      calculateOrderTotal(subtotal, settings, includeDelivery),
    refreshSettings: fetchSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook to use settings
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Standalone hook (for pages not wrapped in provider)
export function useSettingsStandalone() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data() as Partial<SiteSettings>;
          setSettings({
            ...defaultSettings,
            ...data,
            socialMedia: { ...defaultSettings.socialMedia, ...data.socialMedia },
            seo: { ...defaultSettings.seo, ...data.seo },
            features: { ...defaultSettings.features, ...data.features },
            branding: { ...defaultSettings.branding, ...data.branding },
            paymentMethods: { ...defaultSettings.paymentMethods, ...data.paymentMethods },
            notifications: { ...defaultSettings.notifications, ...data.notifications }
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();

    // Real-time listener
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'site'),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as Partial<SiteSettings>;
          setSettings({
            ...defaultSettings,
            ...data,
            socialMedia: { ...defaultSettings.socialMedia, ...data.socialMedia },
            seo: { ...defaultSettings.seo, ...data.seo },
            features: { ...defaultSettings.features, ...data.features },
            branding: { ...defaultSettings.branding, ...data.branding },
            paymentMethods: { ...defaultSettings.paymentMethods, ...data.paymentMethods },
            notifications: { ...defaultSettings.notifications, ...data.notifications }
          });
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const currencySymbol = getCurrencySymbol(settings.currency);

  return {
    settings,
    loading,
    error,
    currencySymbol,
    formatPrice: (amount: number) => formatPrice(amount, settings.currency),
    getWhatsAppLink: (message?: string) => getWhatsAppLink(settings.whatsapp, message, settings.businessName),
    isDeliveryAvailable: (pincode: string) => isPincodeAllowed(pincode, settings.allowedPincodes),
    calculateDeliveryFee: (orderTotal: number) => calculateDeliveryFee(orderTotal, settings),
    calculateOrderTotal: (subtotal: number, includeDelivery: boolean = true) => 
      calculateOrderTotal(subtotal, settings, includeDelivery),
  };
}

// Export helper functions as a bundled object
export const SettingsHelpers = {
  getCurrencySymbol,
  formatPrice,
  formatWhatsAppNumber,
  getWhatsAppLink,
  isPincodeAllowed,
  calculateDeliveryFee,
  calculateTax,
  calculateOrderTotal,
};
