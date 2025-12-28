'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import WhatsAppButton from './WhatsAppButton';

interface CustomCakeFormData {
  customerName: string;
  customerPhone: string;
  occasion: string;
  servings: string;
  flavor: string;
  designDescription: string;
  budget: string;
  deliveryDate: string;
  deliveryAddress: string;
}

export default function CustomCakeForm() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomCakeFormData>();

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    const res = await fetch(url, { method: 'POST', body: formData });
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }
    
    return data.secure_url as string;
  };

  const onSubmit = async (data: CustomCakeFormData) => {
    setSubmitting(true);
    
    try {
      let uploadedImageUrl = '';
      if (imageFile) {
        uploadedImageUrl = await uploadToCloudinary(imageFile);
      }

      const docRef = await addDoc(collection(db, 'custom-cake-requests'), {
        ...data,
        imageUrl: uploadedImageUrl,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      setOrderId(docRef.id);
    } catch (error) {
      console.error('Error submitting custom cake request:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderId) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Request Submitted!</h2>
        <p className="text-gray-600 mb-4">
          Your custom cake request (#{orderId}) has been received. We&apos;ll contact you within 2 hours.
        </p>
        <WhatsAppButton
          cake={null}
          orderData={{ orderId, type: 'custom-cake' }}
          isCustom={true}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* All your previous form fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
        <input
          {...register('customerName', { required: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        {errors.customerName && <span className="text-red-500 text-sm">Required</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
        <input
          {...register('customerPhone', { required: true, pattern: /^[0-9]{10}$/ })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        {errors.customerPhone && <span className="text-red-500 text-sm">Valid 10-digit number required</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
        <select {...register('occasion')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
          <option value="Birthday">Birthday</option>
          <option value="Anniversary">Anniversary</option>
          <option value="Wedding">Wedding</option>
          <option value="Baby Shower">Baby Shower</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Servings</label>
        <select {...register('servings')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
          <option value="6-8">6-8 people</option>
          <option value="10-12">10-12 people</option>
          <option value="15-20">15-20 people</option>
          <option value="25+">25+ people</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Flavor</label>
        <input
          {...register('flavor')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="e.g., Chocolate, Vanilla, Red Velvet"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Design Reference Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Design Description *</label>
        <textarea
          {...register('designDescription', { required: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          rows={4}
          placeholder="Describe your dream cake..."
        />
        {errors.designDescription && <span className="text-red-500 text-sm">Required</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range (₹)</label>
        <input
          {...register('budget')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="e.g., 1500-2000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
        <input
          type="date"
          {...register('deliveryDate')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
        <textarea {...register('deliveryAddress')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
}
