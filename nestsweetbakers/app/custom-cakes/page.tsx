'use client';

import { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSettings } from '@/hooks/useSettings';
import { uploadMultipleToCloudinary } from '@/lib/cloudinary';
import { sendEmailNotification } from '@/lib/emailService';
import { sendWhatsAppNotification } from '@/lib/whatsappService';
import { 
  Cake, Sparkles, Upload, X, Loader2, Phone, Mail, MapPin,
  Calendar, DollarSign, Users, Layers, Info, Clock, AlertCircle,
  MessageCircle, Send, CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CustomCakesPage() {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const { settings, loading: settingsLoading, currencySymbol } = useSettings();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    deliveryAddress: '',
    occasion: '',
    flavor: '',
    size: '',
    servings: '',
    tier: '1',
    eggless: false,
    design: '',
    budget: '',
    deliveryDate: '',
    urgency: 'normal',
    message: '',
  });
  
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [notificationMethod, setNotificationMethod] = useState<'email' | 'whatsapp' | 'both'>('both');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + referenceImages.length > 5) {
      showError('Maximum 5 images allowed');
      return;
    }

    setReferenceImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!formData.name || !formData.phone || !formData.occasion || 
        !formData.flavor || !formData.size || !formData.design || 
        !formData.budget || !formData.deliveryDate) {
      showError('Please fill in all required fields');
      return false;
    }

    const deliveryDate = new Date(formData.deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deliveryDate < today) {
      showError('Delivery date cannot be in the past');
      return false;
    }

    const daysUntilDelivery = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDelivery < 2 && formData.urgency !== 'urgent') {
      showInfo('Orders within 2 days are considered urgent. Please select urgent option.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showError('Please sign in to submit a custom cake request');
      router.push('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setUploadProgress('Preparing your request...');

    try {
      let imageUrls: string[] = [];

      if (referenceImages.length > 0) {
        setUploadProgress(`Uploading ${referenceImages.length} image(s)...`);
        imageUrls = await uploadMultipleToCloudinary(referenceImages);
      }

      setUploadProgress('Submitting your custom cake request...');

      const requestData = {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || formData.name,
        referenceImages: imageUrls,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'customRequests'), requestData);
      const requestId = docRef.id;
      // ✅ GUEST USER FLOW
if (!user) {
  showSuccess(`✅ Request submitted! Reference: ${requestId.slice(0, 8).toUpperCase()}`);
  showInfo('Save this reference ID to track your request');
  
  // Redirect to track page
  setTimeout(() => {
    router.push(`/track-order?ref=REQ${requestId.slice(0, 8).toUpperCase()}`);
  }, 3000);
} else {
  // Logged-in user flow
  setTimeout(() => {
    router.push('/orders');
  }, 3000);
}

      setUploadProgress('Notifying admin...');

      // Send notifications based on user selection
      const requestWithId = { ...formData, referenceImages: imageUrls, requestId };

      if (notificationMethod === 'email' || notificationMethod === 'both') {
        await sendEmailNotification(requestWithId, settings);
      }

      if (notificationMethod === 'whatsapp' || notificationMethod === 'both') {
        // Small delay to ensure Firestore write completes
        setTimeout(() => {
          sendWhatsAppNotification(requestWithId, settings);
        }, 1000);
      }

      showSuccess('Custom cake request submitted successfully! 🎉');
      setSubmitted(true);

      // Reset form
      setFormData({
        name: user.displayName || '',
        phone: '',
        email: user.email || '',
        deliveryAddress: '',
        occasion: '',
        flavor: '',
        size: '',
        servings: '',
        tier: '1',
        eggless: false,
        design: '',
        budget: '',
        deliveryDate: '',
        urgency: 'normal',
        message: '',
      });
      setReferenceImages([]);
      setImagePreviews([]);
      setCurrentStep(1);

      // Redirect after showing success
      setTimeout(() => {
        router.push('/orders');
      }, 3000);

    } catch (error) {
      console.error('Error submitting custom cake request:', error);
      showError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-pink-600" size={48} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-white p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg text-center animate-scale-in">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="text-white" size={48} />
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Request Received!
          </h2>
          <p className="text-gray-600 text-lg mb-4">
            Thank you for your custom cake request! Our cake artists will review your design and contact you soon.
          </p>
          
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-3">What happens next?</h3>
            <div className="space-y-2 text-sm text-gray-600 text-left">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <span>We&apos;ll review your design requirements</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <span>Contact you within 24 hours via {notificationMethod === 'email' ? 'email' : notificationMethod === 'whatsapp' ? 'WhatsApp' : 'email/WhatsApp'}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <span>Provide detailed quote and timeline</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                <span>Finalize design and confirm order</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition"
            >
              <Phone size={20} />
              Call Us
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              <MessageCircle size={20} />
              WhatsApp
            </a>
          </div>

          <p className="text-sm text-gray-500 mt-6">Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cake className="text-pink-600" size={48} />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Design Your Dream Cake
            </h1>
          </div>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto mb-6">
            Tell us about your perfect cake and we&apos;ll bring it to life! Our expert cake artists are ready to create something magical for your special occasion.
          </p>
          
          {/* Contact Info Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition">
              <Phone size={16} />
              <span className="font-medium">{settings.phone}</span>
            </a>
            <span className="text-gray-300">|</span>
            <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition">
              <MessageCircle size={16} />
              <span className="font-medium">WhatsApp</span>
            </a>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={16} />
              <span className="font-medium">{settings.businessHours}</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              { num: 1, label: 'Contact' },
              { num: 2, label: 'Cake Details' },
              { num: 3, label: 'Design' },
              { num: 4, label: 'Review' }
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep >= step.num 
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white scale-110 shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.num}
                  </div>
                  <span className={`text-xs md:text-sm mt-2 font-medium ${
                    currentStep >= step.num ? 'text-pink-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`h-1 w-12 md:w-24 mx-2 rounded transition-all ${
                    currentStep > step.num ? 'bg-gradient-to-r from-pink-600 to-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="space-y-8">
            {/* Step 1: Contact Information */}
            <div className={currentStep === 1 ? '' : 'hidden'}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Contact Information</h2>
                  <p className="text-gray-600">How can we reach you?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone size={16} />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} />
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    placeholder="Full delivery address"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (formData.name && formData.phone && formData.deliveryAddress) {
                    setCurrentStep(2);
                  } else {
                    showError('Please fill in all required fields');
                  }
                }}
                className="mt-6 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Continue to Cake Details →
              </button>
            </div>

            {/* Step 2: Cake Details */}
            <div className={currentStep === 2 ? '' : 'hidden'}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Cake Details</h2>
                  <p className="text-gray-600">Tell us about your cake</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Occasion *
                  </label>
                  <select
                    value={formData.occasion}
                    onChange={(e) => setFormData({...formData, occasion: e.target.value})}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Occasion</option>
                    <option value="Birthday">🎂 Birthday</option>
                    <option value="Wedding">💍 Wedding</option>
                    <option value="Anniversary">💖 Anniversary</option>
                    <option value="Baby Shower">👶 Baby Shower</option>
                    <option value="Corporate Event">🏢 Corporate Event</option>
                    <option value="Engagement">💑 Engagement</option>
                    <option value="Graduation">🎓 Graduation</option>
                    <option value="Other">🎉 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Flavor *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Chocolate, Vanilla, Red Velvet"
                    value={formData.flavor}
                    onChange={(e) => setFormData({...formData, flavor: e.target.value})}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Size/Weight *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2kg, 5 pounds"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Users size={16} />
                    Number of Servings
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 20-25 people"
                    value={formData.servings}
                    onChange={(e) => setFormData({...formData, servings: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Layers size={16} />
                    Number of Tiers
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({...formData, tier: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  >
                    <option value="1">Single Tier</option>
                    <option value="2">2 Tiers</option>
                    <option value="3">3 Tiers</option>
                    <option value="4+">4+ Tiers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign size={16} />
                    Budget {currencySymbol} *
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    required
                    min="500"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Delivery Date *
                  </label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                    required
                    min={minDateString}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 2 days advance order</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Urgency
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  >
                    <option value="normal">🟢 Normal (2+ days)</option>
                    <option value="urgent">🔴 Urgent (Rush order)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.eggless}
                      onChange={(e) => setFormData({...formData, eggless: e.target.checked})}
                      className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="font-semibold text-gray-700">🥚 Eggless Cake</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.occasion && formData.flavor && formData.size && formData.budget && formData.deliveryDate) {
                      setCurrentStep(3);
                    } else {
                      showError('Please fill in all required fields');
                    }
                  }}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Continue to Design →
                </button>
              </div>
            </div>

            {/* Step 3: Design & Images */}
            <div className={currentStep === 3 ? '' : 'hidden'}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Design Your Cake</h2>
                  <p className="text-gray-600">Describe your vision and add references</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Design Description *
                  </label>
                  <textarea
                    placeholder="Describe your dream cake in detail...

Examples:
• Colors and theme (e.g., pink and gold princess theme)
• Decorations (e.g., fresh flowers, fondant figurines)
• Text/message on cake
• Special design elements
• Inspiration from any specific style"
                    value={formData.design}
                    onChange={(e) => setFormData({...formData, design: e.target.value})}
                    required
                    rows={8}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reference Images (Optional - Max 5)
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-500 transition-colors bg-gradient-to-br from-pink-50 to-purple-50">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={referenceImages.length >= 5}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`cursor-pointer ${referenceImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Upload className="mx-auto mb-4 text-pink-600" size={56} />
                      <p className="text-gray-700 font-semibold mb-2 text-lg">
                        Upload reference images
                      </p>
                      <p className="text-sm text-gray-600">
                        PNG, JPG up to 10MB each ({5 - referenceImages.length} remaining)
                      </p>
                    </label>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="relative h-40 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                            <Image
                              src={preview}
                              alt={`Reference ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, 20vw"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg transform hover:scale-110"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    placeholder="Any dietary restrictions, allergies, or special requests..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.design) {
                      setCurrentStep(4);
                    } else {
                      showError('Please describe your cake design');
                    }
                  }}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Review & Submit →
                </button>
              </div>
            </div>

            {/* Step 4: Review & Submit */}
            <div className={currentStep === 4 ? '' : 'hidden'}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Review Your Request</h2>
                  <p className="text-gray-600">Please verify all details before submitting</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Contact Section */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border-2 border-pink-200">
                  <h3 className="font-bold text-lg mb-3 text-gray-800">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-600">Name:</span> <span className="font-semibold">{formData.name}</span></div>
                    <div><span className="text-gray-600">Phone:</span> <span className="font-semibold">{formData.phone}</span></div>
                    {formData.email && <div><span className="text-gray-600">Email:</span> <span className="font-semibold">{formData.email}</span></div>}
                    <div className="md:col-span-2"><span className="text-gray-600">Address:</span> <span className="font-semibold">{formData.deliveryAddress}</span></div>
                  </div>
                </div>

                {/* Cake Details Section */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                  <h3 className="font-bold text-lg mb-3 text-gray-800">Cake Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-600">Occasion:</span> <span className="font-semibold">{formData.occasion}</span></div>
                    <div><span className="text-gray-600">Flavor:</span> <span className="font-semibold">{formData.flavor}</span></div>
                    <div><span className="text-gray-600">Size:</span> <span className="font-semibold">{formData.size}</span></div>
                    {formData.servings && <div><span className="text-gray-600">Servings:</span> <span className="font-semibold">{formData.servings}</span></div>}
                    <div><span className="text-gray-600">Tiers:</span> <span className="font-semibold">{formData.tier}</span></div>
                    <div><span className="text-gray-600">Type:</span> <span className="font-semibold">{formData.eggless ? '🥚 Eggless' : 'Regular'}</span></div>
                    <div><span className="text-gray-600">Budget:</span> <span className="font-semibold">{currencySymbol}{formData.budget}</span></div>
                    <div><span className="text-gray-600">Delivery:</span> <span className="font-semibold">{new Date(formData.deliveryDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                  </div>
                </div>

                {/* Design Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                  <h3 className="font-bold text-lg mb-3 text-gray-800">Design Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{formData.design}</p>
                  {formData.message && (
                    <>
                      <h4 className="font-bold mt-4 mb-2 text-gray-800">Additional Notes</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{formData.message}</p>
                    </>
                  )}
                  {imagePreviews.length > 0 && (
                    <>
                      <h4 className="font-bold mt-4 mb-2 text-gray-800">Reference Images ({imagePreviews.length})</h4>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative h-20 rounded-lg overflow-hidden border-2 border-white shadow">
                            <Image src={preview} alt={`Ref ${index + 1}`} fill className="object-cover" sizes="20vw" />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Notification Method */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                  <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center gap-2">
                    <Send size={20} />
                    How should we notify the admin?
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition">
                      <input
                        type="radio"
                        name="notification"
                        value="both"
                        checked={notificationMethod === 'both'}
                        onChange={(e) => setNotificationMethod(e.target.value as any)}
                        className="w-5 h-5 text-pink-600"
                      />
                      <div>
                        <span className="font-semibold">Email + WhatsApp (Recommended)</span>
                        <p className="text-xs text-gray-600">Get fastest response</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition">
                      <input
                        type="radio"
                        name="notification"
                        value="email"
                        checked={notificationMethod === 'email'}
                        onChange={(e) => setNotificationMethod(e.target.value as any)}
                        className="w-5 h-5 text-pink-600"
                      />
                      <span className="font-semibold">Email Only</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition">
                      <input
                        type="radio"
                        name="notification"
                        value="whatsapp"
                        checked={notificationMethod === 'whatsapp'}
                        onChange={(e) => setNotificationMethod(e.target.value as any)}
                        className="w-5 h-5 text-pink-600"
                      />
                      <span className="font-semibold">WhatsApp Only</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-8 py-5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-pink-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      {uploadProgress || 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} />
                      Submit Custom Cake Request
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                {!user && '⚠️ Please sign in to submit a request. '}
                We&apos;ll contact you within 24 hours via your preferred method.
              </p>
            </div>
          </div>
        </form>

        {/* Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Info className="mx-auto mb-4" size={40} />
          <h3 className="text-2xl font-bold mb-3">Need Help?</h3>
          <p className="mb-4 text-blue-100">Our cake artists are here to help you create the perfect cake!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
            >
              <Phone size={20} />
              Call {settings.phone}
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition"
            >
              <MessageCircle size={20} />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
