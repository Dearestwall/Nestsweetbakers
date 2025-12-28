import FeedbackForm from '@/components/FeedbackForm';

export default function FeedbackPage({ params }: { params: { orderId: string } }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Share Your Experience</h1>
      <p className="text-gray-600 mb-8">
        Thank you for ordering from us! Your feedback helps us serve you better.
      </p>
      <FeedbackForm orderId={params.orderId} />
    </div>
  );
}
