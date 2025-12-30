'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { 
  Save, Plus, Trash2, Loader2,
  Star, Clock, Truck, Award, Heart, Shield, Users,
  Globe, Instagram, Facebook, Twitter, Youtube, Sparkles
} from 'lucide-react';

interface HeroSlide {
  id?: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
  order: number;
}

interface Feature {
  id?: string;
  icon: string;
  title: string;
  description: string;
  order: number;
}

interface Testimonial {
  id?: string;
  name: string;
  rating: number;
  comment: string;
  image?: string;
  date: string;
  order: number;
}

interface Stats {
  orders: number;
  customers: number;
  cakes: number;
  rating: number;
}

interface FooterContent {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  newsletter: {
    enabled: boolean;
    title: string;
    subtitle: string;
  };
}

export default function ContentManagementPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<'hero' | 'features' | 'testimonials' | 'stats' | 'footer'>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Content states
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<Stats>({ orders: 0, customers: 0, cakes: 0, rating: 0 });
  const [footerContent, setFooterContent] = useState<FooterContent>({
    companyName: 'NestSweets',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    social: {},
    newsletter: { enabled: true, title: '', subtitle: '' }
  });

  // Memoize fetchContent with useCallback
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch hero slides
      const heroSnap = await getDocs(collection(db, 'heroSlides'));
      setHeroSlides(heroSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as HeroSlide)));

      // Fetch features
      const featuresSnap = await getDocs(collection(db, 'features'));
      setFeatures(featuresSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feature)));

      // Fetch testimonials
      const testimonialsSnap = await getDocs(collection(db, 'testimonials'));
      setTestimonials(testimonialsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));

      // Fetch stats
      const statsSnap = await getDocs(collection(db, 'stats'));
      if (!statsSnap.empty) {
        setStats(statsSnap.docs[0].data() as Stats);
      }

      // Fetch footer content
      const footerSnap = await getDocs(collection(db, 'footerContent'));
      if (!footerSnap.empty) {
        setFooterContent(footerSnap.docs[0].data() as FooterContent);
      }

    } catch (error) {
      console.error('Error fetching content:', error);
      showError('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/');
      return;
    }
    fetchContent();
  }, [user, isAdmin, router, fetchContent]);

  // Hero Slides Management
  const addHeroSlide = () => {
    setHeroSlides([...heroSlides, {
      image: '',
      title: '',
      subtitle: '',
      ctaText: 'Order Now',
      ctaLink: '/cakes',
      order: heroSlides.length
    }]);
  };

  const updateHeroSlide = (index: number, field: keyof HeroSlide, value: any) => {
    const updated = [...heroSlides];
    updated[index] = { ...updated[index], [field]: value };
    setHeroSlides(updated);
  };

  const deleteHeroSlide = async (index: number) => {
    if (!confirm('Delete this slide?')) return;
    const slide = heroSlides[index];
    if (slide.id) {
      await deleteDoc(doc(db, 'heroSlides', slide.id));
    }
    setHeroSlides(heroSlides.filter((_, i) => i !== index));
    showSuccess('Slide deleted');
  };

  const saveHeroSlides = async () => {
    setSaving(true);
    try {
      const existingSlides = await getDocs(collection(db, 'heroSlides'));
      await Promise.all(existingSlides.docs.map(doc => deleteDoc(doc.ref)));

      await Promise.all(heroSlides.map(slide => 
        addDoc(collection(db, 'heroSlides'), {
          image: slide.image,
          title: slide.title,
          subtitle: slide.subtitle,
          ctaText: slide.ctaText,
          ctaLink: slide.ctaLink,
          order: slide.order
        })
      ));

      showSuccess('Hero slides saved successfully!');
      fetchContent();
    } catch (error) {
      console.error('Error saving hero slides:', error);
      showError('Failed to save hero slides');
    } finally {
      setSaving(false);
    }
  };

  // Features Management
  const addFeature = () => {
    setFeatures([...features, {
      icon: 'star',
      title: '',
      description: '',
      order: features.length
    }]);
  };

  const updateFeature = (index: number, field: keyof Feature, value: any) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    setFeatures(updated);
  };

  const deleteFeature = async (index: number) => {
    if (!confirm('Delete this feature?')) return;
    const feature = features[index];
    if (feature.id) {
      await deleteDoc(doc(db, 'features', feature.id));
    }
    setFeatures(features.filter((_, i) => i !== index));
    showSuccess('Feature deleted');
  };

  const saveFeatures = async () => {
    setSaving(true);
    try {
      const existingFeatures = await getDocs(collection(db, 'features'));
      await Promise.all(existingFeatures.docs.map(doc => deleteDoc(doc.ref)));

      await Promise.all(features.map(feature => 
        addDoc(collection(db, 'features'), {
          icon: feature.icon,
          title: feature.title,
          description: feature.description,
          order: feature.order
        })
      ));

      showSuccess('Features saved successfully!');
      fetchContent();
    } catch (error) {
      console.error('Error saving features:', error);
      showError('Failed to save features');
    } finally {
      setSaving(false);
    }
  };

  // Stats Management
  const saveStats = async () => {
    setSaving(true);
    try {
      const statsSnap = await getDocs(collection(db, 'stats'));
      if (!statsSnap.empty) {
        await setDoc(doc(db, 'stats', statsSnap.docs[0].id), stats);
      } else {
        await addDoc(collection(db, 'stats'), stats);
      }
      showSuccess('Stats saved successfully!');
    } catch (error) {
      console.error('Error saving stats:', error);
      showError('Failed to save stats');
    } finally {
      setSaving(false);
    }
  };

  // Footer Content Management
  const saveFooterContent = async () => {
    setSaving(true);
    try {
      const footerSnap = await getDocs(collection(db, 'footerContent'));
      if (!footerSnap.empty) {
        await setDoc(doc(db, 'footerContent', footerSnap.docs[0].id), footerContent);
      } else {
        await addDoc(collection(db, 'footerContent'), footerContent);
      }
      showSuccess('Footer content saved successfully!');
    } catch (error) {
      console.error('Error saving footer:', error);
      showError('Failed to save footer content');
    } finally {
      setSaving(false);
    }
  };

  // Testimonials Management
  const addTestimonial = () => {
    setTestimonials([...testimonials, {
      name: '',
      rating: 5,
      comment: '',
      image: '',
      date: new Date().toLocaleDateString(),
      order: testimonials.length
    }]);
  };

  const updateTestimonial = (index: number, field: keyof Testimonial, value: any) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    setTestimonials(updated);
  };

  const deleteTestimonial = async (index: number) => {
    if (!confirm('Delete this testimonial?')) return;
    const testimonial = testimonials[index];
    if (testimonial.id) {
      await deleteDoc(doc(db, 'testimonials', testimonial.id));
    }
    setTestimonials(testimonials.filter((_, i) => i !== index));
    showSuccess('Testimonial deleted');
  };

  const saveTestimonials = async () => {
    setSaving(true);
    try {
      const existingTestimonials = await getDocs(collection(db, 'testimonials'));
      await Promise.all(existingTestimonials.docs.map(doc => deleteDoc(doc.ref)));

      await Promise.all(testimonials.map(testimonial => 
        addDoc(collection(db, 'testimonials'), {
          name: testimonial.name,
          rating: testimonial.rating,
          comment: testimonial.comment,
          image: testimonial.image,
          date: testimonial.date,
          order: testimonial.order,
          createdAt: new Date()
        })
      ));

      showSuccess('Testimonials saved successfully!');
      fetchContent();
    } catch (error) {
      console.error('Error saving testimonials:', error);
      showError('Failed to save testimonials');
    } finally {
      setSaving(false);
    }
  };

  const iconOptions = [
    { value: 'star', label: 'Star', icon: Star },
    { value: 'clock', label: 'Clock', icon: Clock },
    { value: 'truck', label: 'Truck', icon: Truck },
    { value: 'award', label: 'Award', icon: Award },
    { value: 'heart', label: 'Heart', icon: Heart },
    { value: 'shield', label: 'Shield', icon: Shield },
    { value: 'users', label: 'Users', icon: Users },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Content Management</h1>
          <p className="text-gray-600">Manage homepage and footer content</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-x-auto">
          <div className="flex border-b min-w-max">
            {[
              { id: 'hero', label: 'Hero Slides', icon: Sparkles },
              { id: 'features', label: 'Features', icon: Star },
              { id: 'testimonials', label: 'Testimonials', icon: Users },
              { id: 'stats', label: 'Stats', icon: Award },
              { id: 'footer', label: 'Footer', icon: Globe },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                      : 'text-gray-600 hover:text-pink-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Slides Tab */}
        {activeTab === 'hero' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Hero Slides</h2>
              <button
                onClick={addHeroSlide}
                className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
              >
                <Plus size={20} />
                Add Slide
              </button>
            </div>

            <div className="space-y-6">
              {heroSlides.map((slide, index) => (
                <div key={index} className="border rounded-lg p-4 hover:border-pink-300 transition">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Slide {index + 1}</h3>
                    <button
                      onClick={() => deleteHeroSlide(index)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Image URL</label>
                      <input
                        type="url"
                        value={slide.image}
                        onChange={(e) => updateHeroSlide(index, 'image', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Title</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => updateHeroSlide(index, 'title', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Welcome to NestSweets"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Subtitle</label>
                      <input
                        type="text"
                        value={slide.subtitle}
                        onChange={(e) => updateHeroSlide(index, 'subtitle', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Crafting sweet memories..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">CTA Text</label>
                      <input
                        type="text"
                        value={slide.ctaText}
                        onChange={(e) => updateHeroSlide(index, 'ctaText', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Order Now"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">CTA Link</label>
                      <input
                        type="text"
                        value={slide.ctaLink}
                        onChange={(e) => updateHeroSlide(index, 'ctaLink', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        placeholder="/cakes"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={saveHeroSlides}
              disabled={saving}
              className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Hero Slides
                </>
              )}
            </button>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Features</h2>
              <button
                onClick={addFeature}
                className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
              >
                <Plus size={20} />
                Add Feature
              </button>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="border rounded-lg p-4 hover:border-pink-300 transition">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Feature {index + 1}</h3>
                    <button
                      onClick={() => deleteFeature(index)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Icon</label>
                      <select
                        value={feature.icon}
                        onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      >
                        {iconOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Title</label>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Premium Quality"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Description</label>
                      <input
                        type="text"
                        value={feature.description}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Finest ingredients"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={saveFeatures}
              disabled={saving}
              className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Features
                </>
              )}
            </button>
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Testimonials</h2>
              <button
                onClick={addTestimonial}
                className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
              >
                <Plus size={20} />
                Add Testimonial
              </button>
            </div>

            <div className="space-y-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="border rounded-lg p-4 hover:border-pink-300 transition">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Testimonial {index + 1}</h3>
                    <button
                      onClick={() => deleteTestimonial(index)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Name</label>
                      <input
                        type="text"
                        value={testimonial.name}
                        onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Customer Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Rating (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={testimonial.rating}
                        onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Comment</label>
                      <textarea
                        value={testimonial.comment}
                        onChange={(e) => updateTestimonial(index, 'comment', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        rows={3}
                        placeholder="Great cake! Highly recommended..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Image URL (optional)</label>
                      <input
                        type="url"
                        value={testimonial.image}
                        onChange={(e) => updateTestimonial(index, 'image', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        placeholder="https://i.pravatar.cc/150"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Date</label>
                      <input
                        type="text"
                        value={testimonial.date}
                        onChange={(e) => updateTestimonial(index, 'date', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        placeholder="2 days ago"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={saveTestimonials}
              disabled={saving}
              className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Testimonials
                </>
              )}
            </button>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Homepage Stats</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Total Orders</label>
                <input
                  type="number"
                  value={stats.orders}
                  onChange={(e) => setStats({ ...stats, orders: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Total Customers</label>
                <input
                  type="number"
                  value={stats.customers}
                  onChange={(e) => setStats({ ...stats, customers: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Cake Varieties</label>
                <input
                  type="number"
                  value={stats.cakes}
                  onChange={(e) => setStats({ ...stats, cakes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Average Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={stats.rating}
                  onChange={(e) => setStats({ ...stats, rating: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>

            <button
              onClick={saveStats}
              disabled={saving}
              className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Stats
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer Tab */}
        {activeTab === 'footer' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Footer Content</h2>

            <div className="space-y-6">
              {/* Company Info */}
              <div>
                <h3 className="text-lg font-bold mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Company Name</label>
                    <input
                      type="text"
                      value={footerContent.companyName}
                      onChange={(e) => setFooterContent({ ...footerContent, companyName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Tagline</label>
                    <textarea
                      value={footerContent.tagline}
                      onChange={(e) => setFooterContent({ ...footerContent, tagline: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-bold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone</label>
                    <input
                      type="tel"
                      value={footerContent.phone}
                      onChange={(e) => setFooterContent({ ...footerContent, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Email</label>
                    <input
                      type="email"
                      value={footerContent.email}
                      onChange={(e) => setFooterContent({ ...footerContent, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Address</label>
                    <input
                      type="text"
                      value={footerContent.address}
                      onChange={(e) => setFooterContent({ ...footerContent, address: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-lg font-bold mb-4">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <Instagram size={18} /> Instagram
                    </label>
                    <input
                      type="url"
                      value={footerContent.social.instagram}
                      onChange={(e) => setFooterContent({ 
                        ...footerContent, 
                        social: { ...footerContent.social, instagram: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="https://instagram.com/nestsweetbakers"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <Facebook size={18} /> Facebook
                    </label>
                    <input
                      type="url"
                      value={footerContent.social.facebook}
                      onChange={(e) => setFooterContent({ 
                        ...footerContent, 
                        social: { ...footerContent.social, facebook: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="https://facebook.com/nestsweetbakers"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <Twitter size={18} /> Twitter
                    </label>
                    <input
                      type="url"
                      value={footerContent.social.twitter}
                      onChange={(e) => setFooterContent({ 
                        ...footerContent, 
                        social: { ...footerContent.social, twitter: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="https://twitter.com/nestsweetbakers"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <Youtube size={18} /> YouTube
                    </label>
                    <input
                      type="url"
                      value={footerContent.social.youtube}
                      onChange={(e) => setFooterContent({ 
                        ...footerContent, 
                        social: { ...footerContent.social, youtube: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="https://youtube.com/@nestsweetbakers"
                    />
                  </div>
                </div>
              </div>

              {/* Newsletter */}
              <div>
                <h3 className="text-lg font-bold mb-4">Newsletter Section</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="newsletter-enabled"
                      checked={footerContent.newsletter.enabled}
                      onChange={(e) => setFooterContent({ 
                        ...footerContent, 
                        newsletter: { ...footerContent.newsletter, enabled: e.target.checked }
                      })}
                      className="w-5 h-5 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label htmlFor="newsletter-enabled" className="text-sm font-semibold">
                      Enable Newsletter Section
                    </label>
                  </div>

                  {footerContent.newsletter.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Newsletter Title</label>
                        <input
                          type="text"
                          value={footerContent.newsletter.title}
                          onChange={(e) => setFooterContent({ 
                            ...footerContent, 
                            newsletter: { ...footerContent.newsletter, title: e.target.value }
                          })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Stay Sweet with Us"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Newsletter Subtitle</label>
                        <input
                          type="text"
                          value={footerContent.newsletter.subtitle}
                          onChange={(e) => setFooterContent({ 
                            ...footerContent, 
                            newsletter: { ...footerContent.newsletter, subtitle: e.target.value }
                          })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Get special offers and updates"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={saveFooterContent}
              disabled={saving}
              className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Footer Content
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
