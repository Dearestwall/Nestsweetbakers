'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';

interface FeedbackFormData {
  rating: number;
  comment: string;
  wouldRecommend: boolean;
  orderId: string;
}

interface Props {
  orderId: string;
}

export default function FeedbackFormFormspree({ orderId }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FeedbackFormData>();

  const onSubmit = async (data: FeedbackFormData) => {
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      Object.entries({ ...data, orderId }).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      formData.append('_subject', `Customer Feedback - Order ${orderId}`);

      const response = await fetch('https://formspree.io/f/your-feedback-form-id', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Thank You!</h2>
        <p className="text-gray-600">
          Your feedback has been recorded. We appreciate your business!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating *</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} className="cursor-pointer">
              <input
                type="radio"
                value={star}
                {...register('rating', { required: true })}
                className="sr-only"
              />
              <span className="text-3xl">{star <= 3 ? '⭐' : '⭐'}</span>
            </label>
          ))}
        </div>
        {errors.rating && <span className="text-red-500 text-sm">Please select a rating</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback *</label>
        <textarea
          {...register('comment', { required: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          rows={4}
          placeholder="Tell us about your experience..."
        />
        {errors.comment && <span className="text-red-500 text-sm">Required</span>}
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('wouldRecommend')}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            I would recommend this business to others
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
}
