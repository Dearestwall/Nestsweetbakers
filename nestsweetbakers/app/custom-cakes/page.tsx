'use client';

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { uploadMultipleToCloudinary } from '@/lib/cloudinary';
import { Cake, Sparkles, Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { generateCustomRequestWhatsAppMessage, notifyAdminViaWhatsApp } from '@/lib/whatsapp';
import { notifyAdmins } from '@/lib/notificationUtils';

export default function CustomCakesPage() {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', occasion: '', flavor: '',
    size: '', design: '', budget: '', deliveryDate: '', message: '',
  });
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + referenceImages.length > 3) {
      showError('Maximum 3 images allowed');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showError('Please sign in to submit a custom cake request');
      router.push('/login');
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

      await addDoc(collection(db, 'customRequests'), {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || formData.name,
        referenceImages: imageUrls,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      showSuccess('Custom cake request submitted! We\'ll contact you soon.');
      setSubmitted(true);

      // Reset form
      setFormData({
        name: '', phone: '', email: '', occasion: '', flavor: '',
        size: '', design: '', budget: '', deliveryDate: '', message: '',
      });
      setReferenceImages([]);
      setImagePreviews([]);

      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        router.push('/orders');
      }, 2000);

    } catch (error) {
      console.error('Error submitting custom cake request:', error);
      showError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-white p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Sparkles className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Request Received!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you! Our cake artists will contact you soon to discuss your dream cake design.
          </p>
          <p className="text-sm text-gray-500">Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cake className="text-pink-600" size={40} />
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Design Your Dream Cake
            </h1>
          </div>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Tell us about your perfect cake and we&apos;ll bring it to life! Upload reference images and share your ideas.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10">
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all md:col-span-2"
                />
              </div>
            </div>

            {/* Cake Details */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                Cake Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={formData.occasion}
                  onChange={(e) => setFormData({...formData, occasion: e.target.value})}
                  required
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Occasion *</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Baby Shower">Baby Shower</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="text"
                  placeholder="Flavor (e.g., Chocolate, Vanilla) *"
                  value={formData.flavor}
                  onChange={(e) => setFormData({...formData, flavor: e.target.value})}
                  required
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />

                <input
                  type="text"
                  placeholder="Size (e.g., 2kg, 3 tiers) *"
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  required
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />

                <input
                  type="number"
                  placeholder="Budget (₹) *"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  required
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />

                <input
                  type="date"
                  placeholder="Delivery Date *"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all md:col-span-2"
                />
              </div>
            </div>

            {/* Design Description */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                Design Description
              </h2>
              <textarea
                placeholder="Describe your dream cake design... (colors, theme, decorations, etc.) *"
                value={formData.design}
                onChange={(e) => setFormData({...formData, design: e.target.value})}
                required
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Reference Images */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
                Reference Images (Optional)
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 md:p-8 text-center hover:border-pink-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={referenceImages.length >= 3}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer ${referenceImages.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="mx-auto mb-3 text-gray-400" size={48} />
                  <p className="text-gray-600 mb-2">
                    Click to upload reference images (Max 3)
                  </p>
                  <p className="text-sm text-gray-500">
                    Upload images of cakes you like
                  </p>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="relative h-32 md:h-40 rounded-xl overflow-hidden">
                        <Image
                          src={preview}
                          alt={`Reference ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Message */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm">5</span>
                Additional Message
              </h2>
              <textarea
                placeholder="Any special requests, dietary requirements, or additional notes..."
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 md:py-5 rounded-xl font-bold text-base md:text-lg hover:from-pink-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
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

            <p className="text-center text-sm text-gray-500">
              {!user && '⚠️ Please sign in to submit a request. '}
              We&apos;ll contact you within 24 hours to confirm your design and pricing.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
