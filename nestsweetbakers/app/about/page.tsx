/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { Award, Heart, Users, TrendingUp, Target, Sparkles } from "lucide-react";

interface AboutContent {
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

interface Stats {
  orders: number;
  customers: number;
  cakes: number;
  rating: number;
}

// Static defaults (used if Firestore is empty)
const defaultAbout: AboutContent = {
  heroTitle: "About NestSweets",
  heroSubtitle: "Crafting Sweet Memories Since 2020",
  heroImage:
    "https://images.unsplash.com/photo-1587241321921-91a834d82e01?w=1920",
  storyTitle: "Our Story",
  storyParagraph1:
    "Welcome to NestSweets, where every cake tells a story and every bite creates a memory. Founded in 2020 in the heart of Patti, Punjab, we started with a simple mission: to bring joy to every celebration with our handcrafted, delicious cakes.",
  storyParagraph2:
    "What began as a small home bakery has blossomed into a beloved local favorite. Our passion for baking, combined with premium ingredients and artistic creativity, has made us the go-to destination for custom cakes and sweet treats in the region.",
  storyParagraph3:
    "Today, we’re proud to serve hundreds of happy customers, creating custom cakes for birthdays, weddings, anniversaries, and every special moment in between. Each cake is made with love, precision, and a commitment to excellence that our customers have come to trust.",
  missionTitle: "Our Mission",
  missionText:
    "To create exceptional, custom-made cakes that bring joy to every celebration. We strive to exceed expectations through creativity, quality, and personalized service, making every customer’s special moment truly unforgettable.",
  visionTitle: "Our Vision",
  visionText:
    "To become the most trusted and loved bakery in Punjab, known for our innovative designs, superior taste, and commitment to making every celebration sweeter. We envision a world where every cake tells a beautiful story.",
};

const defaultStats: Stats = {
  orders: 1000,
  customers: 1000,
  cakes: 500,
  rating: 5,
};

export default function AboutPage() {
  const [about, setAbout] = useState<AboutContent>(defaultAbout);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // aboutPage: single document collection from CMS
        const aboutSnap: QuerySnapshot<DocumentData> = await getDocs(
          collection(db, "aboutPage")
        );
        if (!aboutSnap.empty) {
          const data = aboutSnap.docs[0].data() as Partial<AboutContent>;
          setAbout({ ...defaultAbout, ...data });
        }

        // stats: single document collection from CMS
        const statsSnap: QuerySnapshot<DocumentData> = await getDocs(
          collection(db, "stats")
        );
        if (!statsSnap.empty) {
          const data = statsSnap.docs[0].data() as Partial<Stats>;
          setStats({ ...defaultStats, ...data });
        }
      } catch (err) {
        console.error("Failed to load About content:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const statsCards = [
    {
      icon: Users,
      value: `${stats.customers || defaultStats.customers}+`,
      label: "Happy Customers",
    },
    {
      icon: Award,
      value: `${stats.cakes || defaultStats.cakes}+`,
      label: "Custom Cakes",
    },
    {
      icon: TrendingUp,
      value: "50+",
      label: "Cake Varieties",
    },
    {
      icon: Sparkles,
      value: stats.rating ? `${stats.rating.toFixed(1)}/5` : "100%",
      label: stats.rating ? "Average Rating" : "Satisfaction",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[380px] md:h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-90" />
        <Image
          src={about.heroImage}
          alt={about.heroTitle}
          fill
          className="object-cover mix-blend-overlay"
          priority
        />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4">
            {about.heroTitle}
          </h1>
          <p className="text-base sm:text-lg md:text-2xl">
            {about.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center max-w-6xl mx-auto">
            <div className="relative h-72 sm:h-80 md:h-[420px] lg:h-[480px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800"
                alt="Our bakery"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
                {about.storyTitle}
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
                <p>{about.storyParagraph1}</p>
                <p>{about.storyParagraph2}</p>
                <p>{about.storyParagraph3}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 md:mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Heart,
                title: "Made with Love",
                desc: "Every cake is crafted with passion and care, using only the finest ingredients.",
                color: "bg-pink-100 text-pink-600",
              },
              {
                icon: Award,
                title: "Premium Quality",
                desc: "We never compromise on quality. From sourcing to baking, excellence is our standard.",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: Users,
                title: "Customer First",
                desc: "Your satisfaction is our priority. We listen, create, and deliver beyond expectations.",
                color: "bg-blue-100 text-blue-600",
              },
            ].map((value, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center hover:shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <div
                  className={`${value.color} w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6`}
                >
                  <value.icon size={30} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto text-center">
            {statsCards.map((stat, i) => (
              <div key={i} className="animate-fade-in">
                <stat.icon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4" />
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm md:text-base opacity-90">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-6 sm:p-8 md:p-10">
              <Target className="w-10 h-10 sm:w-12 sm:h-12 text-pink-600 mb-4 sm:mb-6" />
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                {about.missionTitle}
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {about.missionText}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 sm:p-8 md:p-10">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mb-4 sm:mb-6" />
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                {about.visionTitle}
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {about.visionText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Order?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Let us make your next celebration unforgettable with a custom cake
            designed just for you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/custom-cakes"
              className="bg-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-pink-700 transition shadow-lg"
            >
              Order Custom Cake
            </a>
            <a
              href="/cakes"
              className="bg-white text-pink-600 border-2 border-pink-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-pink-50 transition"
            >
              Browse Cakes
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
