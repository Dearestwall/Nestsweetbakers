"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import {
  Save,
  Plus,
  Trash2,
  Loader2,
  Star,
  Clock,
  Truck,
  Award,
  Heart,
  Shield,
  Users,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Sparkles,
  Cake,
  Gift,
  Package,
  Zap,
  ThumbsUp,
  FileText,
  Cookie,
} from "lucide-react";

// Interfaces
interface HeroSlide {
  id?: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
  order: number;
  isActive?: boolean;
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
  isApproved?: boolean;
}

interface Service {
  id?: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  color: string;
  order: number;
}

interface Policy {
  id?: string;
  type: "privacy" | "terms" | "refund" | "cookie";
  title: string;
  content: string;
  lastUpdated: string;
}

interface WhyChooseItem {
  id?: string;
  icon: string;
  title: string;
  description: string;
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

// New: About page content
interface AboutContent {
  id?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  storyTitle: string;
  storyParagraph1: string;
  storyParagraph2: string;
  storyParagraph3: string;
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
}

// New: Services page content (hero + intro)
interface ServicesPageContent {
  id?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  introTitle: string;
  introSubtitle: string;
  ctaPrimaryLabel: string;
  ctaPrimaryLink: string;
  ctaSecondaryLabel: string;
  ctaSecondaryLink: string;
}

type TabId =
  | "hero"
  | "features"
  | "whyChoose"
  | "services"
  | "about"
  | "servicesPage"
  | "testimonials"
  | "policies"
  | "stats"
  | "footer";

export default function ContentManagementPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Content states
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [whyChooseItems, setWhyChooseItems] = useState<WhyChooseItem[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([
    {
      type: "privacy",
      title: "Privacy Policy",
      content: "",
      lastUpdated: new Date().toLocaleDateString(),
    },
    {
      type: "terms",
      title: "Terms of Service",
      content: "",
      lastUpdated: new Date().toLocaleDateString(),
    },
    {
      type: "refund",
      title: "Refund Policy",
      content: "",
      lastUpdated: new Date().toLocaleDateString(),
    },
    {
      type: "cookie",
      title: "Cookie Policy",
      content: "",
      lastUpdated: new Date().toLocaleDateString(),
    },
  ]);
  const [stats, setStats] = useState<Stats>({
    orders: 0,
    customers: 0,
    cakes: 0,
    rating: 0,
  });
  const [footerContent, setFooterContent] = useState<FooterContent>({
    companyName: "NestSweets",
    tagline: "",
    phone: "",
    email: "",
    address: "",
    social: {},
    newsletter: { enabled: true, title: "", subtitle: "" },
  });

  // NEW: About page content state
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    heroTitle: "About NestSweets",
    heroSubtitle: "Crafting Sweet Memories Since 2020",
    heroImage:
      "https://images.unsplash.com/photo-1587241321921-91a834d82e01?w=1920",
    storyTitle: "Our Story",
    storyParagraph1:
      "Welcome to NestSweets, where every cake tells a story and every bite creates a memory.",
    storyParagraph2:
      "What began as a small home bakery has blossomed into a beloved local favorite.",
    storyParagraph3:
      "Today, we are proud to serve customers for birthdays, weddings, anniversaries, and more.",
    missionTitle: "Our Mission",
    missionText:
      "To bring joy to every celebration with handcrafted, delicious cakes made with love.",
    visionTitle: "Our Vision",
    visionText:
      "To become the most trusted and creative cake brand in our region and beyond.",
  });

  // NEW: Services page content state
  const [servicesPageContent, setServicesPageContent] =
    useState<ServicesPageContent>({
      heroTitle: "Our Services",
      heroSubtitle: "Premium cake services for every celebration",
      heroImage:
        "https://images.unsplash.com/photo-1588195538326-c5b1e5b80d8b?w=1920",
      introTitle: "What We Offer",
      introSubtitle:
        "From custom designs to delivery, we provide comprehensive cake services for all your needs.",
      ctaPrimaryLabel: "Order Custom Cake",
      ctaPrimaryLink: "/custom-cakes",
      ctaSecondaryLabel: "Contact Us",
      ctaSecondaryLink: "/contact",
    });

  // Icon options
  const iconOptions = [
    { value: "star", label: "Star" },
    { value: "clock", label: "Clock" },
    { value: "truck", label: "Truck" },
    { value: "award", label: "Award" },
    { value: "heart", label: "Heart" },
    { value: "shield", label: "Shield" },
    { value: "users", label: "Users" },
    { value: "cake", label: "Cake" },
    { value: "gift", label: "Gift" },
    { value: "package", label: "Package" },
    { value: "zap", label: "Zap" },
    { value: "thumbsup", label: "Thumbs Up" },
  ];

  // Fetch all content
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);

      const collectionsToFetch = [
        { name: "heroSlides", setter: setHeroSlides },
        { name: "features", setter: setFeatures },
        { name: "testimonials", setter: setTestimonials },
        { name: "services", setter: setServices },
        { name: "whyChoose", setter: setWhyChooseItems },
        { name: "policies", setter: setPolicies },
      ];

      for (const col of collectionsToFetch) {
        const snap = await getDocs(collection(db, col.name));
        if (!snap.empty) {
          col.setter(
            snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any
          );
        }
      }

      // Stats
      const statsSnap = await getDocs(collection(db, "stats"));
      if (!statsSnap.empty) {
        setStats(statsSnap.docs[0].data() as Stats);
      }

      // Footer
      const footerSnap = await getDocs(collection(db, "footerContent"));
      if (!footerSnap.empty) {
        setFooterContent(footerSnap.docs[0].data() as FooterContent);
      }

      // NEW: About page content (single document)
      const aboutSnap = await getDocs(collection(db, "aboutPage"));
      if (!aboutSnap.empty) {
        const docRef = aboutSnap.docs[0];
        setAboutContent({
          id: docRef.id,
          ...(docRef.data() as AboutContent),
        });
      }

      // NEW: Services page content (single document)
      const servicesPageSnap = await getDocs(collection(db, "servicesPage"));
      if (!servicesPageSnap.empty) {
        const docRef = servicesPageSnap.docs[0];
        setServicesPageContent({
          id: docRef.id,
          ...(docRef.data() as ServicesPageContent),
        });
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      showError("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (!user || !isAdmin) {
      router.push("/");
      return;
    }
    fetchContent();
  }, [user, isAdmin, router, fetchContent]);

  // Generic save function for list collections
  const saveCollection = async (
    collectionName: string,
    items: any[],
    successMessage: string
  ) => {
    setSaving(true);
    try {
      const existing = await getDocs(collection(db, collectionName));
      await Promise.all(existing.docs.map((d) => deleteDoc(d.ref)));
      await Promise.all(
        items.map((item) => {
          const { id, ...data } = item;
          return addDoc(collection(db, collectionName), data);
        })
      );
      showSuccess(successMessage);
      fetchContent();
    } catch (error) {
      console.error(`Error saving ${collectionName}:`, error);
      showError(`Failed to save ${collectionName}`);
    } finally {
      setSaving(false);
    }
  };

  // Save functions for list collections
  const saveHeroSlides = () =>
    saveCollection("heroSlides", heroSlides, "Hero slides saved!");

  const saveFeatures = () =>
    saveCollection("features", features, "Features saved!");

  const saveTestimonials = () =>
    saveCollection(
      "testimonials",
      testimonials.map((t) => ({
        ...t,
        createdAt: new Date(),
        isApproved: t.isApproved !== false,
      })),
      "Testimonials saved!"
    );

  const saveServices = () =>
    saveCollection("services", services, "Services saved!");

  const saveWhyChooseItems = () =>
    saveCollection("whyChoose", whyChooseItems, "Why Choose section saved!");

  const savePolicies = async () => {
    setSaving(true);
    try {
      await Promise.all(
        policies.map(async (policy) => {
          const payload = {
            ...policy,
            lastUpdated: new Date().toLocaleDateString(),
          };
          if (policy.id) {
            await setDoc(doc(db, "policies", policy.id), payload);
          } else {
            await addDoc(collection(db, "policies"), payload);
          }
        })
      );
      showSuccess("Policies saved!");
      fetchContent();
    } catch (error) {
      console.error(error);
      showError("Failed to save policies");
    } finally {
      setSaving(false);
    }
  };

  // NEW: Save About page content
  const saveAboutContentToDb = async () => {
    setSaving(true);
    try {
      if (aboutContent.id) {
        await setDoc(doc(db, "aboutPage", aboutContent.id), {
          ...aboutContent,
        });
      } else {
        await addDoc(collection(db, "aboutPage"), { ...aboutContent });
      }
      showSuccess("About page content saved!");
    } catch (error) {
      console.error(error);
      showError("Failed to save About page content");
    } finally {
      setSaving(false);
    }
  };

  // NEW: Save Services page content
  const saveServicesPageContentToDb = async () => {
    setSaving(true);
    try {
      if (servicesPageContent.id) {
        await setDoc(doc(db, "servicesPage", servicesPageContent.id), {
          ...servicesPageContent,
        });
      } else {
        await addDoc(collection(db, "servicesPage"), {
          ...servicesPageContent,
        });
      }
      showSuccess("Services page content saved!");
    } catch (error) {
      console.error(error);
      showError("Failed to save Services page content");
    } finally {
      setSaving(false);
    }
  };

  const saveStats = async () => {
    setSaving(true);
    try {
      const statsSnap = await getDocs(collection(db, "stats"));
      if (!statsSnap.empty) {
        await setDoc(doc(db, "stats", statsSnap.docs[0].id), stats);
      } else {
        await addDoc(collection(db, "stats"), stats);
      }
      showSuccess("Stats saved!");
    } catch (error) {
      console.error(error);
      showError("Failed to save stats");
    } finally {
      setSaving(false);
    }
  };

  const saveFooterContent = async () => {
    setSaving(true);
    try {
      const footerSnap = await getDocs(collection(db, "footerContent"));
      if (!footerSnap.empty) {
        await setDoc(
          doc(db, "footerContent", footerSnap.docs[0].id),
          footerContent
        );
      } else {
        await addDoc(collection(db, "footerContent"), footerContent);
      }
      showSuccess("Footer saved!");
    } catch (error) {
      console.error(error);
      showError("Failed to save footer");
    } finally {
      setSaving(false);
    }
  };

  // Add/Update/Delete helpers
  const addHeroSlide = () =>
    setHeroSlides([
      ...heroSlides,
      {
        image: "",
        title: "",
        subtitle: "",
        ctaText: "Order Now",
        ctaLink: "/cakes",
        order: heroSlides.length,
        isActive: true,
      },
    ]);

  const updateHeroSlide = (
    index: number,
    field: keyof HeroSlide,
    value: any
  ) => {
    const updated = [...heroSlides];
    updated[index] = { ...updated[index], [field]: value };
    setHeroSlides(updated);
  };

  const deleteHeroSlide = async (index: number) => {
    if (!confirm("Delete this slide?")) return;
    const slide = heroSlides[index];
    if (slide.id) await deleteDoc(doc(db, "heroSlides", slide.id));
    setHeroSlides(heroSlides.filter((_, i) => i !== index));
    showSuccess("Slide deleted");
  };

  const addFeature = () =>
    setFeatures([
      ...features,
      { icon: "star", title: "", description: "", order: features.length },
    ]);

  const updateFeature = (
    index: number,
    field: keyof Feature,
    value: any
  ) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    setFeatures(updated);
  };

  const deleteFeature = async (index: number) => {
    if (!confirm("Delete?")) return;
    if (features[index].id)
      await deleteDoc(doc(db, "features", features[index].id!));
    setFeatures(features.filter((_, i) => i !== index));
    showSuccess("Deleted");
  };

  const addTestimonial = () =>
    setTestimonials([
      ...testimonials,
      {
        name: "",
        rating: 5,
        comment: "",
        image: "",
        date: new Date().toLocaleDateString(),
        order: testimonials.length,
        isApproved: true,
      },
    ]);

  const updateTestimonial = (
    index: number,
    field: keyof Testimonial,
    value: any
  ) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    setTestimonials(updated);
  };

  const deleteTestimonial = async (index: number) => {
    if (!confirm("Delete?")) return;
    if (testimonials[index].id)
      await deleteDoc(doc(db, "testimonials", testimonials[index].id!));
    setTestimonials(testimonials.filter((_, i) => i !== index));
    showSuccess("Deleted");
  };

  const addService = () =>
    setServices([
      ...services,
      {
        icon: "cake",
        title: "",
        description: "",
        features: ["", "", "", ""],
        image: "photo-1578985545062-69928b1d9587",
        color: "from-pink-500 to-rose-500",
        order: services.length,
      },
    ]);

  const updateService = (
    index: number,
    field: keyof Service,
    value: any
  ) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const updateServiceFeature = (
    serviceIndex: number,
    featureIndex: number,
    value: string
  ) => {
    const updated = [...services];
    updated[serviceIndex].features[featureIndex] = value;
    setServices(updated);
  };

  const addServiceFeature = (serviceIndex: number) => {
    const updated = [...services];
    updated[serviceIndex].features.push("");
    setServices(updated);
  };

  const deleteService = async (index: number) => {
    if (!confirm("Delete?")) return;
    if (services[index].id)
      await deleteDoc(doc(db, "services", services[index].id!));
    setServices(services.filter((_, i) => i !== index));
    showSuccess("Deleted");
  };

  const addWhyChooseItem = () =>
    setWhyChooseItems([
      ...whyChooseItems,
      { icon: "shield", title: "", description: "", order: whyChooseItems.length },
    ]);

  const updateWhyChooseItem = (
    index: number,
    field: keyof WhyChooseItem,
    value: any
  ) => {
    const updated = [...whyChooseItems];
    updated[index] = { ...updated[index], [field]: value };
    setWhyChooseItems(updated);
  };

  const deleteWhyChooseItem = async (index: number) => {
    if (!confirm("Delete?")) return;
    if (whyChooseItems[index].id)
      await deleteDoc(doc(db, "whyChoose", whyChooseItems[index].id!));
    setWhyChooseItems(whyChooseItems.filter((_, i) => i !== index));
    showSuccess("Deleted");
  };

  const updatePolicy = (
    type: Policy["type"],
    field: keyof Policy,
    value: any
  ) => {
    const updated = [...policies];
    const index = updated.findIndex((p) => p.type === type);
    if (index >= 0) {
      updated[index] = { ...updated[index], [field]: value };
    }
    setPolicies(updated);
  };

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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Content Management System
          </h1>
          <p className="text-gray-600">
            Manage all website content dynamically (home, About, Services,
            policies, and more)
          </p>
        </div>

        {/* Tabs - horizontally scrollable on mobile */}
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-x-auto">
          <div className="flex border-b min-w-max">
            {[
              { id: "hero", label: "Hero Slides", icon: Sparkles },
              { id: "features", label: "Features", icon: Star },
              { id: "whyChoose", label: "Why Choose", icon: Shield },
              { id: "services", label: "Services Cards", icon: Cake },
              { id: "about", label: "About Page", icon: FileText },
              { id: "servicesPage", label: "Services Page", icon: Gift },
              { id: "testimonials", label: "Reviews", icon: Users },
              { id: "policies", label: "Policies", icon: Cookie },
              { id: "stats", label: "Stats", icon: Award },
              { id: "footer", label: "Footer", icon: Globe },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-pink-600 border-b-2 border-pink-600 bg-pink-50"
                      : "text-gray-600 hover:text-pink-600 hover:bg-gray-50"
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
        {activeTab === "hero" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">Hero Slides</h2>
              <button
                onClick={addHeroSlide}
                className="flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 w-full md:w-auto"
              >
                <Plus size={20} /> Add Slide
              </button>
            </div>

            <div className="space-y-6">
              {heroSlides.map((slide, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <h3 className="font-bold text-lg">Slide {index + 1}</h3>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={slide.isActive !== false}
                          onChange={(e) =>
                            updateHeroSlide(
                              index,
                              "isActive",
                              e.target.checked
                            )
                          }
                          className="rounded"
                        />
                        <span>Active</span>
                      </label>
                      <button
                        onClick={() => deleteHeroSlide(index)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={slide.image}
                        onChange={(e) =>
                          updateHeroSlide(index, "image", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) =>
                          updateHeroSlide(index, "title", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={slide.subtitle}
                        onChange={(e) =>
                          updateHeroSlide(index, "subtitle", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        CTA Text
                      </label>
                      <input
                        type="text"
                        value={slide.ctaText}
                        onChange={(e) =>
                          updateHeroSlide(index, "ctaText", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        CTA Link
                      </label>
                      <input
                        type="text"
                        value={slide.ctaLink}
                        onChange={(e) =>
                          updateHeroSlide(index, "ctaLink", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={saveHeroSlides}
              disabled={saving}
              className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Saving...
                </>
              ) : (
                <>
                  <Save size={20} /> Save Hero Slides
                </>
              )}
            </button>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === "features" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">Features</h2>
              <button
                onClick={addFeature}
                className="flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 w-full md:w-auto"
              >
                <Plus size={20} /> Add Feature
              </button>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">
                      Feature {index + 1}
                    </h3>
                    <button
                      onClick={() => deleteFeature(index)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Icon
                      </label>
                      <select
                        value={feature.icon}
                        onChange={(e) =>
                          updateFeature(index, "icon", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        {iconOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) =>
                          updateFeature(index, "title", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={feature.description}
                        onChange={(e) =>
                          updateFeature(index, "description", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={saveFeatures}
              disabled={saving}
              className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Saving...
                </>
              ) : (
                <>
                  <Save size={20} /> Save Features
                </>
              )}
            </button>
          </div>
        )}

        {/* Why Choose Tab */}
        {activeTab === "whyChoose" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">Why Choose Us</h2>
              <button
                onClick={addWhyChooseItem}
                className="flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 w-full md:w-auto"
              >
                <Plus size={20} /> Add Item
              </button>
            </div>

            <div className="space-y-6">
              {whyChooseItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Item {index + 1}</h3>
                    <button
                      onClick={() => deleteWhyChooseItem(index)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Icon
                      </label>
                      <select
                        value={item.icon}
                        onChange={(e) =>
                          updateWhyChooseItem(
                            index,
                            "icon",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        {iconOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          updateWhyChooseItem(
                            index,
                            "title",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateWhyChooseItem(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={saveWhyChooseItems}
              disabled={saving}
              className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Saving...
                </>
              ) : (
                <>
                  <Save size={20} /> Save Why Choose
                </>
              )}
            </button>
          </div>
        )}

        {/* Services Cards Tab */}
        {activeTab === "services" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">Services (Cards)</h2>
              <button
                onClick={addService}
                className="flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 w-full md:w-auto"
              >
                <Plus size={20} /> Add Service
              </button>
            </div>

            <div className="space-y-6">
              {services.map((service, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">
                      Service {index + 1}
                    </h3>
                    <button
                      onClick={() => deleteService(index)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Icon
                      </label>
                      <select
                        value={service.icon}
                        onChange={(e) =>
                          updateService(index, "icon", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        {iconOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={service.title}
                        onChange={(e) =>
                          updateService(index, "title", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">
                        Description
                      </label>
                      <textarea
                        value={service.description}
                        onChange={(e) =>
                          updateService(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Image ID (Unsplash)
                      </label>
                      <input
                        type="text"
                        value={service.image}
                        onChange={(e) =>
                          updateService(index, "image", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="photo-1578985545062-69928b1d9587"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Gradient Color
                      </label>
                      <input
                        type="text"
                        value={service.color}
                        onChange={(e) =>
                          updateService(index, "color", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="from-pink-500 to-rose-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">
                        Features
                      </label>
                      {service.features.map((feature, fIndex) => (
                        <input
                          key={fIndex}
                          type="text"
                          value={feature}
                          onChange={(e) =>
                            updateServiceFeature(
                              index,
                              fIndex,
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border rounded-lg mb-2"
                          placeholder={`Feature ${fIndex + 1}`}
                        />
                      ))}
                      <button
                        onClick={() => addServiceFeature(index)}
                        className="text-pink-600 text-sm hover:underline"
                      >
                        + Add Feature
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={saveServices}
              disabled={saving}
              className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Saving...
                </>
              ) : (
                <>
                  <Save size={20} /> Save Services
                </>
              )}
            </button>
          </div>
        )}

        {/* NEW: About Page Tab */}
        {activeTab === "about" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">About Page Content</h2>

            <div className="space-y-8">
              {/* Hero */}
              <div>
                <h3 className="text-lg font-bold mb-4">Hero Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Hero Title
                    </label>
                    <input
                      type="text"
                      value={aboutContent.heroTitle}
                      onChange={(e) =>
                        setAboutContent({
                          ...aboutContent,
                          heroTitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Hero Subtitle
                    </label>
                    <input
                      type="text"
                      value={aboutContent.heroSubtitle}
                      onChange={(e) =>
                        setAboutContent({
                          ...aboutContent,
                          heroSubtitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">
                      Hero Background Image URL
                    </label>
                    <input
                      type="url"
                      value={aboutContent.heroImage}
                      onChange={(e) =>
                        setAboutContent({
                          ...aboutContent,
                          heroImage: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* Story */}
              <div>
                <h3 className="text-lg font-bold mb-4">Our Story Section</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={aboutContent.storyTitle}
                      onChange={(e) =>
                        setAboutContent({
                          ...aboutContent,
                          storyTitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Paragraph 1
                      </label>
                      <textarea
                        value={aboutContent.storyParagraph1}
                        onChange={(e) =>
                          setAboutContent({
                            ...aboutContent,
                            storyParagraph1: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Paragraph 2
                      </label>
                      <textarea
                        value={aboutContent.storyParagraph2}
                        onChange={(e) =>
                          setAboutContent({
                            ...aboutContent,
                            storyParagraph2: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Paragraph 3
                      </label>
                      <textarea
                        value={aboutContent.storyParagraph3}
                        onChange={(e) =>
                          setAboutContent({
                            ...aboutContent,
                            storyParagraph3: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mission & Vision */}
              <div>
                <h3 className="text-lg font-bold mb-4">
                  Mission &amp; Vision
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Mission Title
                    </label>
                    <input
                      type="text"
                      value={aboutContent.missionTitle}
                      onChange={(e) =>
                        setAboutContent({
                          ...aboutContent,
                          missionTitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg mb-3"
                    />
                    <label className="block text-sm font-semibold mb-2">
                      Mission Text
                    </label>
                    <textarea
                      value={aboutContent.missionText}
                      onChange={(e) =>
                        setAboutContent({
                          ...aboutContent,
                          missionText: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Vision Title
                    </label>
                    <input
                      type="text"
                      value={aboutContent.visionTitle}
                      onChange={(e) =>
                        setAboutContent({
                          ...aboutContent,
                          visionTitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg mb-3"
                    />
                    <label className="block text-sm font-semibold mb-2">
                      Vision Text
                    </label>
                    <textarea
                      value={aboutContent.visionText}
                      onChange={(e) =>
                        setAboutContent({
                          ...aboutContent,
                          visionText: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={saveAboutContentToDb}
              disabled={saving}
              className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Saving...
                </>
              ) : (
                <>
                  <Save size={20} /> Save About Page
                </>
              )}
            </button>
          </div>
        )}

        {/* NEW: Services Page Meta Tab */}
        {activeTab === "servicesPage" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Services Page Content</h2>

            <div className="space-y-8">
              {/* Hero */}
              <div>
                <h3 className="text-lg font-bold mb-4">Hero Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Hero Title
                    </label>
                    <input
                      type="text"
                      value={servicesPageContent.heroTitle}
                      onChange={(e) =>
                        setServicesPageContent({
                          ...servicesPageContent,
                          heroTitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Hero Subtitle
                    </label>
                    <input
                      type="text"
                      value={servicesPageContent.heroSubtitle}
                      onChange={(e) =>
                        setServicesPageContent({
                          ...servicesPageContent,
                          heroSubtitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">
                      Hero Background Image URL
                    </label>
                    <input
                      type="url"
                      value={servicesPageContent.heroImage}
                      onChange={(e) =>
                        setServicesPageContent({
                          ...servicesPageContent,
                          heroImage: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* Intro Section */}
              <div>
                <h3 className="text-lg font-bold mb-4">Intro Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={servicesPageContent.introTitle}
                      onChange={(e) =>
                        setServicesPageContent({
                          ...servicesPageContent,
                          introTitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Section Subtitle
                    </label>
                    <textarea
                      value={servicesPageContent.introSubtitle}
                      onChange={(e) =>
                        setServicesPageContent({
                          ...servicesPageContent,
                          introSubtitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div>
                <h3 className="text-lg font-bold mb-4">CTA Buttons</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Primary CTA Label
                    </label>
                    <input
                      type="text"
                      value={servicesPageContent.ctaPrimaryLabel}
                      onChange={(e) =>
                        setServicesPageContent({
                          ...servicesPageContent,
                          ctaPrimaryLabel: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Primary CTA Link
                    </label>
                    <input
                      type="text"
                      value={servicesPageContent.ctaPrimaryLink}
                      onChange={(e) =>
                        setServicesPageContent({
                          ...servicesPageContent,
                          ctaPrimaryLink: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="/custom-cakes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Secondary CTA Label
                    </label>
                    <input
                      type="text"
                      value={servicesPageContent.ctaSecondaryLabel}
                      onChange={(e) =>
                        setServicesPageContent({
                          ...servicesPageContent,
                          ctaSecondaryLabel: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Secondary CTA Link
                    </label>
                    <input
                      type="text"
                      value={servicesPageContent.ctaSecondaryLink}
                      onChange={(e) =>
                        setServicesPageContent({
                          ...servicesPageContent,
                          ctaSecondaryLink: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="/contact"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={saveServicesPageContentToDb}
              disabled={saving}
              className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Saving...
                </>
              ) : (
                <>
                  <Save size={20} /> Save Services Page
                </>
              )}
            </button>
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === "testimonials" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">Customer Reviews</h2>
              <button
                onClick={addTestimonial}
                className="flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 w-full md:w-auto"
              >
                <Plus size={20} /> Add Review
              </button>
            </div>

            <div className="space-y-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <h3 className="font-bold text-lg">
                      Review {index + 1}
                    </h3>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={testimonial.isApproved !== false}
                          onChange={(e) =>
                            updateTestimonial(
                              index,
                              "isApproved",
                              e.target.checked
                            )
                          }
                          className="rounded"
                        />
                        <span>Approved</span>
                      </label>
                      <button
                        onClick={() => deleteTestimonial(index)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={testimonial.name}
                        onChange={(e) =>
                          updateTestimonial(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Rating (1-5)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={testimonial.rating}
                        onChange={(e) =>
                          updateTestimonial(
                            index,
                            "rating",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">
                        Comment
                      </label>
                      <textarea
                        value={testimonial.comment}
                        onChange={(e) =>
                          updateTestimonial(
                            index,
                            "comment",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Image URL (optional)
                      </label>
                      <input
                        type="url"
                        value={testimonial.image}
                        onChange={(e) =>
                          updateTestimonial(
                            index,
                            "image",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Date
                      </label>
                      <input
                        type="text"
                        value={testimonial.date}
                        onChange={(e) =>
                          updateTestimonial(
                            index,
                            "date",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={saveTestimonials}
              disabled={saving}
              className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Saving...
                </>
              ) : (
                <>
                  <Save size={20} /> Save Reviews
                </>
              )}
            </button>
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === "policies" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Policies</h2>

            <div className="space-y-6">
              {policies.map((policy) => (
                <div key={policy.type} className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4 capitalize">
                    {policy.type} Policy
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={policy.title}
                        onChange={(e) =>
                          updatePolicy(
                            policy.type,
                            "title",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Content (HTML/Markdown supported)
                      </label>
                      <textarea
                        value={policy.content}
                        onChange={(e) =>
                          updatePolicy(
                            policy.type,
                            "content",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                        rows={10}
                        placeholder="Enter policy content..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={savePolicies}
              disabled={saving}
              className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Saving...
                </>
              ) : (
                <>
                  <Save size={20} /> Save Policies
                </>
              )}
            </button>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Homepage / About Stats</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Total Orders
                </label>
                <input
                  type="number"
                  value={stats.orders}
                  onChange={(e) =>
                    setStats({
                      ...stats,
                      orders: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Total Customers
                </label>
                <input
                  type="number"
                  value={stats.customers}
                  onChange={(e) =>
                    setStats({
                      ...stats,
                      customers: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Cake Varieties
                </label>
                <input
                  type="number"
                  value={stats.cakes}
                  onChange={(e) =>
                    setStats({
                      ...stats,
                      cakes: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Average Rating
                </label>
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  max={5}
                  value={stats.rating}
                  onChange={(e) =>
                    setStats({
                      ...stats,
                      rating: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <button
              onClick={saveStats}
              disabled={saving}
              className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Saving...
                </>
              ) : (
                <>
                  <Save size={20} /> Save Stats
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer Tab */}
        {activeTab === "footer" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Footer Content</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-4">
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={footerContent.companyName}
                      onChange={(e) =>
                        setFooterContent({
                          ...footerContent,
                          companyName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">
                      Tagline
                    </label>
                    <textarea
                      value={footerContent.tagline}
                      onChange={(e) =>
                        setFooterContent({
                          ...footerContent,
                          tagline: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={footerContent.phone}
                      onChange={(e) =>
                        setFooterContent({
                          ...footerContent,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={footerContent.email}
                      onChange={(e) =>
                        setFooterContent({
                          ...footerContent,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={footerContent.address}
                      onChange={(e) =>
                        setFooterContent({
                          ...footerContent,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">
                  Social Media Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["instagram", "facebook", "twitter", "youtube"].map(
                    (platform) => (
                      <div key={platform}>
                        <label className="block text-sm font-semibold mb-2 capitalize flex items-center gap-2">
                          {platform === "instagram" && (
                            <Instagram size={18} />
                          )}
                          {platform === "facebook" && <Facebook size={18} />}
                          {platform === "twitter" && <Twitter size={18} />}
                          {platform === "youtube" && <Youtube size={18} />}
                          {platform}
                        </label>
                        <input
                          type="url"
                          value={
                            footerContent.social[
                              platform as keyof typeof footerContent.social
                            ] || ""
                          }
                          onChange={(e) =>
                            setFooterContent({
                              ...footerContent,
                              social: {
                                ...footerContent.social,
                                [platform]: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder={`https://${platform}.com/...`}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">
                  Newsletter Section
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={footerContent.newsletter.enabled}
                      onChange={(e) =>
                        setFooterContent({
                          ...footerContent,
                          newsletter: {
                            ...footerContent.newsletter,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-semibold">
                      Enable Newsletter Section
                    </span>
                  </label>

                  {footerContent.newsletter.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Newsletter Title
                        </label>
                        <input
                          type="text"
                          value={footerContent.newsletter.title}
                          onChange={(e) =>
                            setFooterContent({
                              ...footerContent,
                              newsletter: {
                                ...footerContent.newsletter,
                                title: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Newsletter Subtitle
                        </label>
                        <input
                          type="text"
                          value={footerContent.newsletter.subtitle}
                          onChange={(e) =>
                            setFooterContent({
                              ...footerContent,
                              newsletter: {
                                ...footerContent.newsletter,
                                subtitle: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg"
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
              className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Saving...
                </>
              ) : (
                <>
                  <Save size={20} /> Save Footer Content
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}