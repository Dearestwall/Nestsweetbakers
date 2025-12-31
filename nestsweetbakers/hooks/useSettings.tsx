'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SiteSettings {
  // Business Information
  businessName: string;
  cityName: string;
  address: string;
  
  // Contact Information
  phone: string;
  whatsapp: string;
  email: string;
  supportEmail: string;
  supportPhone: string;
  
  // Delivery & Service Area
  allowedPincodes: string;
  deliveryFee: number;
  freeDeliveryAbove: number;
  minimumOrder: number;
  deliveryInfo: string;
  
  // Financial Settings
  taxRate: number;
  currency: 'INR' | 'CAD';
  
  // Business Hours & Info
  businessHours: string;
  
  // Social Media
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  
  // Additional Settings
  enableOnlineOrders?: boolean;
  enableWhatsAppOrders?: boolean;
  enableCashOnDelivery?: boolean;
  enableOnlinePayment?: boolean;
}

const defaultSettings: SiteSettings = {
  // Business Information
  businessName: 'Nest Sweet Bakers',
  cityName: 'Narnaund',
  address: 'Narnaund, Haryana, India',
  
  // Contact Information
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'info@nestsweetbakers.com',
  supportEmail: 'support@nestsweetbakers.com',
  supportPhone: '+91 98765 43210',
  
  // Delivery & Service Area
  allowedPincodes: '',
  deliveryFee: 50,
  freeDeliveryAbove: 500,
  minimumOrder: 500,
  deliveryInfo: 'Same-day delivery available',
  
  // Financial Settings
  taxRate: 0,
  currency: 'INR',
  
  // Business Hours & Info
  businessHours: 'Mon-Sun: 9 AM - 9 PM',
  
  // Social Media
  socialMedia: {},
  
  // Additional Settings
  enableOnlineOrders: true,
  enableWhatsAppOrders: true,
  enableCashOnDelivery: true,
  enableOnlinePayment: true,
};

// Helper function to get currency symbol
export const getCurrencySymbol = (currency: 'INR' | 'CAD' = 'INR'): string => {
  return currency === 'CAD' ? '$' : '₹';
};

// Helper function to format phone number for WhatsApp
export const formatWhatsAppNumber = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '');
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
        setSettings({ ...defaultSettings, ...data });
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

    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'site'),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as Partial<SiteSettings>;
          setSettings({ ...defaultSettings, ...data });
        }
      },
      (err) => {
        console.error('Error listening to settings:', err);
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
          setSettings({ ...defaultSettings, ...data });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();

    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'site'),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as Partial<SiteSettings>;
          setSettings({ ...defaultSettings, ...data });
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const currencySymbol = getCurrencySymbol(settings.currency);

  return { settings, loading, error, currencySymbol };
}

// Export helper functions as a bundled object
export const SettingsHelpers = {
  getCurrencySymbol,
  formatWhatsAppNumber,
  isPincodeAllowed,
  calculateDeliveryFee,
  calculateTax,
  calculateOrderTotal,
};
