import CustomCakeForm from '@/components/CustomCakeForm';

export default function CustomCakePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Custom Cake Request</h1>
      <p className="text-gray-600 mb-8">
        Share your dream cake details. We&apos;ll review and send you a quote via WhatsApp within 2 hours.
      </p>
      <CustomCakeForm />
    </div>
  );
}
