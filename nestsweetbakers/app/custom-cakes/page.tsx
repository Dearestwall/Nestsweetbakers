'use client';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadMultipleToCloudinary } from '@/lib/cloudinary';
import { Cake, Sparkles, Upload, X, ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function CustomCakesPage() {
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
      alert('Maximum 3 images allowed');
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
    setLoading(true);

    try {
      let imageUrls: string[] = [];

      // Upload images to Cloudinary
      if (referenceImages.length > 0) {
        setUploadProgress('Uploading images...');
        imageUrls = await uploadMultipleToCloudinary(referenceImages);
      }

      setUploadProgress('Saving request...');

      // Save to Firestore
      const requestData = {
        ...formData,
        referenceImages: imageUrls,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      await addDoc(collection(db, 'customRequests'), requestData);

      // WhatsApp message
      const imageText = imageUrls.length > 0 ? `\n\nReference Images:\n${imageUrls.join('\n')}` : '';
      const message = `🎂 *Custom Cake Request*\n\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email || 'N/A'}\nOccasion: ${formData.occasion}\nFlavor: ${formData.flavor}\nSize: ${formData.size}\nBudget: ₹${formData.budget}\nDelivery: ${formData.deliveryDate}\n\nDesign Details:\n${formData.design}\n\nMessage:\n${formData.message}${imageText}`;
      
      const whatsappUrl = `https://wa.me/911234567890?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      setSubmitted(true);
      setFormData({
        name: '', phone: '', email: '', occasion: '', flavor: '',
        size: '', design: '', budget: '', deliveryDate: '', message: '',
      });
      setReferenceImages([]);
      setImagePreviews([]);
      setUploadProgress('');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <Sparkles className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-pink-600" />
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Design Your Dream Cake</h1>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us your vision and we&apos;ll create a masterpiece just for you!
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {submitted ? (
            <div className="text-center py-12 animate-bounce-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Cake className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-green-600">Request Submitted!</h3>
              <p className="text-gray-600 mb-6">
                We&apos;ve received your custom cake request. Our team will contact you shortly via WhatsApp!
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="bg-pink-600 text-white px-6 py-3 rounded-full hover:bg-pink-700 transition"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Your Name *"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
                />
              </div>

              <input
                type="email"
                placeholder="Email (optional)"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
              />

              {/* Image Upload Section */}
              <div className="border-2 border-dashed border-pink-300 rounded-lg p-6 bg-pink-50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ImageIcon size={20} className="text-pink-600" />
                  Upload Reference Images (Optional - Max 3)
                </h3>
                
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={loading}
                />
                
                {imagePreviews.length < 3 && (
                  <label
                    htmlFor="image-upload"
                    className={`block w-full py-4 text-center bg-white hover:bg-pink-100 rounded-lg cursor-pointer transition border-2 border-pink-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className="mx-auto mb-2 text-pink-600" size={24} />
                    <span className="text-pink-600 font-semibold">Click to upload images</span>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB each</p>
                  </label>
                )}

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-32 object-cover rounded-lg border-2 border-pink-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={loading}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <select
                  required
                  value={formData.occasion}
                  onChange={e => setFormData({...formData, occasion: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
                >
                  <option value="">Occasion *</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Corporate">Corporate Event</option>
                  <option value="Other">Other</option>
                </select>

                <select
                  required
                  value={formData.flavor}
                  onChange={e => setFormData({...formData, flavor: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
                >
                  <option value="">Flavor *</option>
                  <option value="Chocolate">Chocolate</option>
                  <option value="Vanilla">Vanilla</option>
                  <option value="Red Velvet">Red Velvet</option>
                  <option value="Butterscotch">Butterscotch</option>
                  <option value="Black Forest">Black Forest</option>
                  <option value="Pineapple">Pineapple</option>
                  <option value="Custom Mix">Custom Mix</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <select
                  required
                  value={formData.size}
                  onChange={e => setFormData({...formData, size: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
                >
                  <option value="">Size *</option>
                  <option value="0.5kg">0.5 kg</option>
                  <option value="1kg">1 kg</option>
                  <option value="1.5kg">1.5 kg</option>
                  <option value="2kg">2 kg</option>
                  <option value="3kg">3 kg</option>
                  <option value="5kg+">5 kg or more</option>
                </select>

                <input
                  type="number"
                  placeholder="Budget (₹) *"
                  required
                  value={formData.budget}
                  onChange={e => setFormData({...formData, budget: e.target.value})}
                  min="100"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
                />
              </div>

              <input
                type="date"
                required
                value={formData.deliveryDate}
                onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
              />

              <textarea
                placeholder="Design Details (colors, theme, decorations, text on cake, etc.) *"
                required
                value={formData.design}
                onChange={e => setFormData({...formData, design: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
              />

              <textarea
                placeholder="Any special message or additional requirements?"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none transition"
              />

              {uploadProgress && (
                <div className="text-center py-2 text-pink-600 font-semibold">
                  {uploadProgress}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-pink-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Processing...' : 'Submit Custom Cake Request'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                You&apos;ll be redirected to WhatsApp to confirm your order with our team
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
