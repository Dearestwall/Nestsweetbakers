"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  order: number;
  createdAt: any;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  comment: string;
  occasion?: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: any;
}

export function useContent() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch banners (realtime)
  useEffect(() => {
    const q = query(collection(db, "heroBanners"), orderBy("order", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bannersData = snapshot.docs.map(
          (d) =>
            ({
              id: d.id,
              ...d.data(),
              createdAt: d.data().createdAt?.toDate?.() || new Date(),
            } as HeroBanner)
        );
        setBanners(bannersData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error loading banners:", err);
        setError("Failed to load hero banners");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch testimonials (realtime)
  useEffect(() => {
    const q = query(
      collection(db, "testimonials"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const testimonialsData = snapshot.docs.map(
          (d) =>
            ({
              id: d.id,
              ...d.data(),
              createdAt: d.data().createdAt?.toDate?.() || new Date(),
            } as Testimonial)
        );
        setTestimonials(testimonialsData);
        setError(null);
      },
      (err) => {
        console.error("Error loading testimonials:", err);
        setError("Failed to load testimonials");
      }
    );

    return () => unsubscribe();
  }, []);

  // Banner methods
  const createBanner = useCallback(
    async (data: Omit<HeroBanner, "id" | "createdAt">) => {
      try {
        await addDoc(collection(db, "heroBanners"), {
          ...data,
          createdAt: serverTimestamp(),
        });
        return { success: true };
      } catch (error) {
        console.error("Error creating banner:", error);
        return { success: false, error };
      }
    },
    []
  );

  const updateBanner = useCallback(
    async (bannerId: string, data: Partial<HeroBanner>) => {
      try {
        await updateDoc(doc(db, "heroBanners", bannerId), data);
        return { success: true };
      } catch (error) {
        console.error("Error updating banner:", error);
        return { success: false, error };
      }
    },
    []
  );

  const deleteBanner = useCallback(async (bannerId: string) => {
    try {
      await deleteDoc(doc(db, "heroBanners", bannerId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting banner:", error);
      return { success: false, error };
    }
  }, []);

  // Testimonial methods
  const createTestimonial = useCallback(
    async (data: Omit<Testimonial, "id" | "createdAt">) => {
      try {
        await addDoc(collection(db, "testimonials"), {
          ...data,
          createdAt: serverTimestamp(),
        });
        return { success: true };
      } catch (error) {
        console.error("Error creating testimonial:", error);
        return { success: false, error };
      }
    },
    []
  );

  const updateTestimonial = useCallback(
    async (testimonialId: string, data: Partial<Testimonial>) => {
      try {
        await updateDoc(doc(db, "testimonials", testimonialId), data);
        return { success: true };
      } catch (error) {
        console.error("Error updating testimonial:", error);
        return { success: false, error };
      }
    },
    []
  );

  const deleteTestimonial = useCallback(async (testimonialId: string) => {
    try {
      await deleteDoc(doc(db, "testimonials", testimonialId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      return { success: false, error };
    }
  }, []);

  // Selectors
  const getActiveBanners = useCallback(
    () => banners.filter((banner) => banner.isActive),
    [banners]
  );

  const getApprovedTestimonials = useCallback(
    () => testimonials.filter((testimonial) => testimonial.isApproved),
    [testimonials]
  );

  const getFeaturedTestimonials = useCallback(
    () =>
      testimonials.filter(
        (testimonial) => testimonial.isFeatured && testimonial.isApproved
      ),
    [testimonials]
  );

  return {
    banners,
    testimonials,
    loading,
    error,
    createBanner,
    updateBanner,
    deleteBanner,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    getActiveBanners,
    getApprovedTestimonials,
    getFeaturedTestimonials,
  };
}
