'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Cake } from '@/lib/types';
import { ArrowRight, Star, Clock, Truck, Award, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function HomePage() {
  const [popularCakes, setPopularCakes] = useState<Cake[]>([]);
  const [heroSlides, setHeroSlides] = useState<Array<{image: string; title: string; subtitle: string}>>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch cakes
        const productsRef = collection(db, 'products');
        const allCakes = await getDocs(productsRef);
        const cakesData = allCakes.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cake));
        
        const sortedByPopularity = [...cakesData].sort((a, b) => 
          (b.orderCount || 0) - (a.orderCount || 0)
        );
        setPopularCakes(sortedByPopularity.slice(0, 8));

        // Fetch hero slides from admin
        const heroRef = collection(db, 'heroSlides');
        const heroSnap = await getDocs(heroRef);
        if (!heroSnap.empty) {
          const slides = heroSnap.docs.map(doc => doc.data() as {image: string; title: string; subtitle: string});
          setHeroSlides(slides);
        } else {
          // Default slides
          setHeroSlides([
            {
              image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920',
              title: 'Welcome to NestSweets',
              subtitle: 'Crafting Sweet Memories, One Cake at a Time 🍰'
            },
            {
              image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1920',
              title: 'Custom Birthday Cakes',
              subtitle: 'Make every birthday unforgettable'
            },
            {
              image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920',
              title: 'Wedding Cakes',
              subtitle: 'Elegant designs for your special day'
            }
          ]);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Auto-slide hero every 5 seconds
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth'
      });
    }
  };

  const handleQuickAdd = (cake: Cake) => {
    addToCart(cake, 1);
    const proceed = confirm('Added to cart! Go to cart or continue shopping?');
    if (proceed) {
      window.location.href = '/cart';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Auto-Sliding Hero Section */}
      <section className="relative h-[500px] md:h-[700px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-600 to-pink-700 opacity-95" />
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover mix-blend-overlay"
              priority={index === 0}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl">
                <h1 className="text-4xl md:text-7xl font-bold mb-4 md:mb-6 animate-slide-up">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-2xl mb-6 md:mb-8">
                  {slide.subtitle}
                </p>
                {index === currentSlide && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
                    <Link 
                      href="/cakes" 
                      className="bg-white text-pink-600 px-6 md:px-8 py-3 md:py-4 rounded-full font-bold hover:bg-yellow-300 transition-all"
                    >
                      Order Now <ArrowRight className="inline ml-2" size={20} />
                    </Link>
                    <Link 
                      href="/custom-cakes" 
                      className="bg-transparent border-2 border-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold hover:bg-white hover:text-pink-600 transition-all"
                    >
                      Custom Cakes
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Popular Cakes - Horizontal Scroll */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-pink-600" size={28} />
              <h2 className="text-2xl md:text-4xl font-bold">Popular Right Now</h2>
            </div>
            <Link href="/cakes" className="text-pink-600 hover:text-pink-700 font-semibold">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
              {[1,2,3,4].map(i => (
                <div key={i} className="min-w-[280px] h-80 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="relative group">
              <button 
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-pink-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-pink-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={24} />
              </button>

              <div 
                ref={scrollRef}
                className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar scroll-smooth"
              >
                {popularCakes.map((cake) => (
                  <div 
                    key={cake.id}
                    className="min-w-[280px] md:min-w-[320px] snap-start group/card"
                  >
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 h-full">
                      <Link href={`/cakes/${cake.id}`}>
                        <div className="relative h-56 md:h-64 overflow-hidden">
                          <Image
                            src={cake.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'}
                            alt={cake.name}
                            fill
                            className="object-cover group-hover/card:scale-110 transition-transform duration-500"
                            sizes="320px"
                          />
                          <div className="absolute top-3 right-3 bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                            {cake.category}
                          </div>
                          {cake.orderCount && cake.orderCount > 5 && (
                            <div className="absolute top-3 left-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              <Star size={12} className="fill-current" />
                              Bestseller
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-4">
                        <h3 className="text-lg font-bold mb-2 line-clamp-1">{cake.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{cake.description}</p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-2xl font-bold text-pink-600">₹{cake.basePrice}</span>
                          <span className="text-xs text-gray-500">per kg</span>
                        </div>
                        <button
                          onClick={() => handleQuickAdd(cake)}
                          className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors font-semibold text-sm"
                        >
                          Quick Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: Star, title: 'Premium Quality', desc: 'Finest ingredients' },
              { icon: Clock, title: '24/7 Service', desc: 'Order anytime' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Same day delivery' },
              { icon: Award, title: 'Award Winning', desc: 'Best in town' },
            ].map((feature, i) => (
              <div 
                key={i}
                className="bg-white p-4 md:p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 text-center group"
              >
                <feature.icon className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-pink-600 group-hover:text-yellow-500 transition-colors" />
                <h3 className="font-bold text-sm md:text-xl mb-1 md:mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-xs md:text-base">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">Shop by Occasion</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: 'Birthday', image: 'photo-1558636508-e0db3814bd1d', color: 'from-pink-400 to-purple-500' },
              { name: 'Wedding', image: 'photo-1519225421980-715cb0215aed', color: 'from-purple-400 to-pink-500' },
              { name: 'Anniversary', image: 'photo-1586985289688-ca3cf47d3e6e', color: 'from-red-400 to-pink-500' },
              { name: 'Custom', image: 'photo-1576618148400-f54bed99fcfd', color: 'from-yellow-400 to-orange-500' },
            ].map((cat) => (
              <Link 
                key={cat.name}
                href={`/cakes?category=${cat.name}`}
                className="group relative h-48 md:h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Image
                  src={`https://images.unsplash.com/${cat.image}?w=400`}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-60 group-hover:opacity-70 transition-opacity`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-xl md:text-2xl font-bold">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Custom CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Want a Custom Cake?</h2>
          <p className="text-base md:text-xl mb-6 max-w-2xl mx-auto">
            Tell us your dream cake and we&apos;ll bring it to life!
          </p>
          <Link 
            href="/custom-cakes"
            className="inline-block bg-white text-pink-600 px-6 md:px-8 py-3 md:py-4 rounded-full font-bold hover:bg-yellow-300 transition-all"
          >
            Request Custom Cake
          </Link>
        </div>
      </section>
    </div>
  );
}
