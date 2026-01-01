'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc,
   query,  
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { Megaphone, Plus, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { notificationService } from '@/lib/notificationService';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'promo' | 'system';
  link?: string;
  isActive: boolean;
  showOnHeader: boolean;
  createdAt?: Date;
}

export default function AdminAnnouncementsPage() {
  const { user, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [type, setType] = useState<'info' | 'promo' | 'system'>('promo');
  const [showOnHeader, setShowOnHeader] = useState(true);

  useEffect(() => {
  if (!user || !isAdmin) {
    router.replace('/');
    return;
  }

  const q = query(
    collection(db, 'announcements'),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => {
      const raw = d.data() as any;
      return {
        id: d.id,
        title: raw.title,
        message: raw.message,
        type: raw.type ?? 'info',
        link: raw.link,
        isActive: raw.isActive ?? true,
        showOnHeader: raw.showOnHeader ?? true,
        createdAt: raw.createdAt?.toDate?.(),
      } as Announcement;
    });
    setAnnouncements(data);
    setLoading(false);
  });

  return () => unsubscribe();
}, [user, isAdmin, router]);


  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      setSaving(true);
      const docRef = await addDoc(collection(db, 'announcements'), {
        title: title.trim(),
        message: message.trim(),
        type,
        link: link.trim() || null,
        isActive: true,
        showOnHeader,
        createdAt: serverTimestamp(),
        createdBy: user?.uid ?? null,
      });

      // Broadcast notification to all users
      await notificationService.sendBroadcastNotification(
        title.trim(),
        message.trim(),
        type === 'promo' ? 'promo' : 'info',
        link.trim() || undefined
      );

      showSuccess('✅ Announcement created and sent to users');
      setTitle('');
      setMessage('');
      setLink('');
      setType('promo');
      setShowOnHeader(true);
    } catch (err) {
      console.error('Error creating announcement', err);
      showError('❌ Failed to create announcement');
    } finally {
      setSaving(false);
    }
  };

  const toggleField = async (id: string, field: 'isActive' | 'showOnHeader', value: boolean) => {
    try {
      await updateDoc(doc(db, 'announcements', id), { [field]: value });
    } catch (err) {
      console.error('Error updating announcement', err);
      showError('❌ Failed to update announcement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
      showSuccess('✅ Announcement deleted');
    } catch (err) {
      console.error('Error deleting announcement', err);
      showError('❌ Failed to delete announcement');
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-600">Checking access...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin h-8 w-8 text-pink-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Announcements
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Create banners for the header and send them as notifications to all users.
          </p>
        </div>
      </div>

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl shadow-lg p-4 md:p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Megaphone className="text-pink-600" size={22} />
          <h2 className="text-lg font-semibold text-gray-800">
            New Announcement
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Eg. Weekend Offer: Flat 20% Off"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              placeholder="Short description that will appear in notifications and optional header subtitle"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Link (optional)
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="/cakes?tag=offer"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'info' | 'promo' | 'system')}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="promo">Promo / Offer</option>
              <option value="info">Information</option>
              <option value="system">System</option>
            </select>

            <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnHeader}
                onChange={(e) => setShowOnHeader(e.target.checked)}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              Show as header banner
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-semibold hover:from-pink-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create & Send
              </>
            )}
          </button>
        </div>
      </form>

      {/* Existing announcements */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Existing Announcements
        </h2>

        {announcements.length === 0 ? (
          <p className="text-sm text-gray-500">No announcements yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="border rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">
                    {a.title}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {a.message}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 font-semibold">
                      {a.type.toUpperCase()}
                    </span>
                    {a.link && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {a.link}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleField(a.id, 'showOnHeader', !a.showOnHeader)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] text-gray-700 hover:bg-gray-50"
                    title="Show in header"
                  >
                    {a.showOnHeader ? (
                      <ToggleRight size={16} className="text-green-500" />
                    ) : (
                      <ToggleLeft size={16} className="text-gray-400" />
                    )}
                    Header
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleField(a.id, 'isActive', !a.isActive)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] text-gray-700 hover:bg-gray-50"
                    title="Activate / deactivate"
                  >
                    {a.isActive ? (
                      <ToggleRight size={16} className="text-green-500" />
                    ) : (
                      <ToggleLeft size={16} className="text-gray-400" />
                    )}
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 rounded-full hover:bg-red-50 text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
