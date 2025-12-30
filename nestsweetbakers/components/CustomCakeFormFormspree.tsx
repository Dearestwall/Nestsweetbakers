'use client';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type CustomCakeFormData = {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  budget: string;
  description: string;
  referenceImageUrls: string[];
  createdAt: string;
  status: 'pending' | 'contacted' | 'completed';
};

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary env missing (cloud name / upload preset).');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Cloudinary upload failed');
  const json = (await res.json()) as { secure_url?: string };

  if (!json.secure_url) throw new Error('Cloudinary did not return secure_url');
  return json.secure_url;
}

export default function CustomCakeFormFormspree() {
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    eventType: '',
    eventDate: '',
    budget: '',
    description: '',
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1) Upload images to Cloudinary (optional)
      const referenceImageUrls =
        files.length > 0 ? await Promise.all(files.map(uploadToCloudinary)) : [];

      // 2) Save request in Firestore
      const payload: CustomCakeFormData = {
        ...form,
        referenceImageUrls,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      await addDoc(collection(db, 'customRequests'), payload);

      alert('Request submitted!');
      setForm({
        name: '',
        phone: '',
        email: '',
        eventType: '',
        eventDate: '',
        budget: '',
        description: '',
      });
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        className="w-full border p-3 rounded-lg"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        required
      />
      <input
        className="w-full border p-3 rounded-lg"
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
        required
      />
      <input
        className="w-full border p-3 rounded-lg"
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        required
      />
      <input
        className="w-full border p-3 rounded-lg"
        placeholder="Event Type (Birthday/Wedding...)"
        value={form.eventType}
        onChange={(e) => setForm((p) => ({ ...p, eventType: e.target.value }))}
        required
      />
      <input
        className="w-full border p-3 rounded-lg"
        type="date"
        value={form.eventDate}
        onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))}
        required
      />
      <input
        className="w-full border p-3 rounded-lg"
        placeholder="Budget (e.g. ₹1500-₹2500)"
        value={form.budget}
        onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
        required
      />
      <textarea
        className="w-full border p-3 rounded-lg"
        placeholder="Describe your cake..."
        rows={4}
        value={form.description}
        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        required
      />

      <input
        className="w-full border p-3 rounded-lg"
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
      />

      <button
        disabled={submitting}
        className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
}
