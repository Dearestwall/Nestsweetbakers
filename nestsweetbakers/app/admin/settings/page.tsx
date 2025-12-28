'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Settings {
  cityName: string;
  allowedPincodes: string;
  businessPhone: string;
  deliveryFee: number;
  minimumOrder: number;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    cityName: process.env.NEXT_PUBLIC_CITY_NAME || '',
    allowedPincodes: process.env.NEXT_PUBLIC_CITY_PINCODES || '',
    businessPhone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '',
    deliveryFee: 0,
    minimumOrder: 500,
  });
  const [saved, setSaved] = useState(false);

  // Function declaration BEFORE useEffect
  const fetchSettings = async () => {
    const docRef = doc(db, 'settings', 'business');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setSettings(docSnap.data() as Settings);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
     
  }, []);

  const handleSave = async () => {
    // Fix TypeScript error by spreading the object
    await updateDoc(doc(db, 'settings', 'business'), { ...settings });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Business Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City Name</label>
          <input
            value={settings.cityName}
            onChange={(e) => setSettings({ ...settings, cityName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Pincodes (comma-separated)</label>
          <input
            value={settings.allowedPincodes}
            onChange={(e) => setSettings({ ...settings, allowedPincodes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="143416,143417,143418"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business WhatsApp Number</label>
          <input
            value={settings.businessPhone}
            onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="919876543210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (₹)</label>
          <input
            type="number"
            value={settings.deliveryFee}
            onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount (₹)</label>
          <input
            type="number"
            value={settings.minimumOrder}
            onChange={(e) => setSettings({ ...settings, minimumOrder: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          onClick={handleSave}
          className="bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-pink-700 transition"
        >
          Save Settings
        </button>

        {saved && (
          <p className="text-green-600 font-medium">Settings saved successfully!</p>
        )}
      </div>
    </div>
  );
}
