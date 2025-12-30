'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, orderBy, limit as limitQuery } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Cake } from '@/lib/types';
import { 
  ArrowRight, Star, Clock, Truck, Award, ChevronLeft, ChevronRight, 
  TrendingUp, Heart, Shield, Users, Quote, Play, Sparkles
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  rating: number;
  comment: string;
  image?: string;
  date: string;
}

export default function HomePage() {
  const [popularCakes, setPopularCakes] = useState<Cake[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState({ orders: 0, customers: 0, cakes: 0, rating: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { showSuccess } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch popular cakes
        const productsRef = collection(db, 'products');
        const allCakes = await getDocs(productsRef);
        const cakesData = allCakes.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cake));
        
        const sortedByPopularity = [...cakesData].sort((a, b) => 
          (b.orderCount || 0) - (a.orderCount || 0)
        );
        setPopularCakes(sortedByPopularity.slice(0, 8));

        // Fetch hero slides
        const heroRef = collection(db, 'heroSlides');
        const heroSnap = await getDocs(heroRef);
        if (!heroSnap.empty) {
          const slides = heroSnap.docs.map(doc => doc.data() as HeroSlide);
          setHeroSlides(slides);
        } else {
          setHeroSlides([
            {
              image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920',
              title: 'Welcome to NestSweets',
              subtitle: 'Crafting Sweet Memories, One Cake at a Time 🍰',
              ctaText: 'Order Now',
              ctaLink: '/cakes'
            },
            {
              image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1920',
              title: 'Custom Birthday Cakes',
              subtitle: 'Make every birthday unforgettable',
              ctaText: 'Explore',
              ctaLink: '/cakes?category=Birthday'
            },
            {
              image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920',
              title: 'Wedding Cakes',
              subtitle: 'Elegant designs for your special day',
              ctaText: 'View Collection',
              ctaLink: '/cakes?category=Wedding'
            }
          ]);
        }

        // Fetch features
        const featuresRef = collection(db, 'features');
        const featuresSnap = await getDocs(featuresRef);
        if (!featuresSnap.empty) {
          setFeatures(featuresSnap.docs.map(doc => doc.data() as Feature));
        } else {
          setFeatures([
            { icon: 'star', title: 'Premium Quality', description: 'Finest ingredients sourced daily' },
            { icon: 'clock', title: '24/7 Service', description: 'Order anytime, anywhere' },
            { icon: 'truck', title: 'Fast Delivery', description: 'Same day delivery available' },
            { icon: 'award', title: 'Award Winning', description: 'Best bakery in town' },
          ]);
        }

        // Fetch testimonials
        const testimonialsRef = query(
          collection(db, 'testimonials'),
          orderBy('createdAt', 'desc'),
          limitQuery(6)
        );
        const testimonialsSnap = await getDocs(testimonialsRef);
        if (!testimonialsSnap.empty) {
          setTestimonials(testimonialsSnap.docs.map(doc => doc.data() as Testimonial));
        } else {
          setTestimonials([
            {
              name: 'Priya Sharma',
              rating: 5,
              comment: 'Best chocolate cake I\'ve ever had! Delivered on time and tasted amazing.',
              image: 'https://i.pravatar.cc/150?img=1',
              date: '2 days ago'
            },
            {
              name: 'Rahul Kumar',
              rating: 5,
              comment: 'Ordered a custom wedding cake. Exceeded all expectations! Highly recommended.',
              image: 'https://i.pravatar.cc/150?img=2',
              date: '1 week ago'
            },
            {
              name: 'Anita Patel',
              rating: 5,
              comment: 'Fresh, delicious, and beautifully designed. Will definitely order again!',
              image: 'https://i.pravatar.cc/150?img=3',
              date: '2 weeks ago'
            }
          ]);
        }

        // Fetch stats
        const statsRef = collection(db, 'stats');
        const statsSnap = await getDocs(statsRef);
        if (!statsSnap.empty) {
          const statsData = statsSnap.docs[0].data();
          setStats(statsData as typeof stats);
        } else {
          setStats({ orders: 2500, customers: 1200, cakes: 50, rating: 4.9 });
        }

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Auto-slide hero
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
        left: direction === 'left' ? -320 : 320,
        behavior: 'smooth'
      });
    }
  };

  const handleQuickAdd = (cake: Cake) => {
    addToCart(cake, 1, '');
    showSuccess(`${cake.name} added to cart!`);
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      star: Star,
      clock: Clock,
      truck: Truck,
      award: Award,
      heart: Heart,
      shield: Shield,
      users: Users,
    };
    return icons[iconName] || Star;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Auto-Slide */}
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/90 via-purple-600/90 to-pink-700/90 z-10" />
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-5xl">
                <div className="mb-4">
                  <Sparkles className="inline-block text-yellow-300 mb-2" size={40} />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up leading-tight">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-3xl mb-8 text-pink-100 font-light">
                  {slide.subtitle}
                </p>
                {index === currentSlide && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay">
                    <Link 
                      href={slide.ctaLink || '/cakes'}
                      className="group bg-white text-pink-600 px-8 py-4 rounded-full font-bold hover:bg-yellow-300 hover:text-gray-900 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      {slide.ctaText || 'Order Now'}
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </Link>
                    <Link 
                      href="/custom-cakes"
                      className="bg-transparent border-2 border-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-pink-600 transition-all shadow-2xl backdrop-blur-sm"
                    >
                      Custom Cakes
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/40 transition-all"
        >
          <ChevronLeft className="text-white" size={28} />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/40 transition-all"
        >
          <ChevronRight className="text-white" size={28} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: stats.orders, label: 'Orders Delivered', suffix: '+' },
              { value: stats.customers, label: 'Happy Customers', suffix: '+' },
              { value: stats.cakes, label: 'Cake Varieties', suffix: '+' },
              { value: stats.rating, label: 'Customer Rating', suffix: '⭐' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-pink-100 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cakes */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-pink-600" size={32} />
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">Popular Right Now</h2>
                <p className="text-gray-600 mt-1">Bestsellers everyone loves</p>
              </div>
            </div>
            <Link 
              href="/cakes" 
              className="text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-2 group"
            >
              View All 
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-96 bg-white rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="relative group/scroll">
              <button 
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 bg-white shadow-2xl rounded-full p-4 hover:bg-pink-600 hover:text-white transition-all opacity-0 group-hover/scroll:opacity-100"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 bg-white shadow-2xl rounded-full p-4 hover:bg-pink-600 hover:text-white transition-all opacity-0 group-hover/scroll:opacity-100"
              >
                <ChevronRight size={24} />
              </button>

              <div 
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar scroll-smooth"
              >
                {popularCakes.map((cake) => (
                  <div 
                    key={cake.id}
                    className="min-w-[300px] md:min-w-[340px] snap-start"
                  >
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 h-full group">
                      <Link href={`/cakes/${cake.id}`}>
                        <div className="relative h-64 overflow-hidden">
                          <Image
                            src={cake.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'}
                            alt={cake.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="340px"
                          />
                          <div className="absolute top-3 right-3 bg-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                            {cake.category}
                          </div>
                          {cake.orderCount && cake.orderCount > 10 && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                              <Star size={14} className="fill-current" />
                              Bestseller
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-5">
                        <Link href={`/cakes/${cake.id}`}>
                          <h3 className="text-xl font-bold mb-2 line-clamp-1 hover:text-pink-600 transition-colors">
                            {cake.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{cake.description}</p>
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <span className="text-3xl font-bold text-pink-600">₹{cake.basePrice}</span>
                            <span className="text-sm text-gray-500 ml-1">/ kg</span>
                          </div>
                          {cake.rating && (
                            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                              <Star size={14} className="fill-green-500 text-green-500" />
                              <span className="text-sm font-semibold text-green-700">{cake.rating}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleQuickAdd(cake)}
                          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Add to Cart
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose NestSweets?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We&apos;re committed to delivering the best cake experience
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, i) => {
              const Icon = getIconComponent(feature.icon);
              return (
                <div 
                  key={i}
                  className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 text-center group border-2 border-transparent hover:border-pink-200"
                >
                  <div className="bg-white rounded-full w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-pink-600 group-hover:text-purple-600 transition-colors group-hover:scale-110 transform duration-300" />
                  </div>
                  <h3 className="font-bold text-lg md:text-xl mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm md:text-base">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Occasion</h2>
            <p className="text-gray-600 text-lg">Perfect cakes for every celebration</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: 'Birthday', image: 'photo-1558636508-e0db3814bd1d', gradient: 'from-pink-500/80 to-purple-600/80', icon: '🎂' },
              { name: 'Wedding', image: 'photo-1519225421980-715cb0215aed', gradient: 'from-purple-500/80 to-pink-600/80', icon: '💍' },
              { name: 'Anniversary', image: 'photo-1586985289688-ca3cf47d3e6e', gradient: 'from-red-500/80 to-pink-600/80', icon: '❤️' },
              { name: 'Custom', image: 'photo-1576618148400-f54bed99fcfd', gradient: 'from-yellow-500/80 to-orange-600/80', icon: '✨' },
            ].map((cat) => (
              <Link 
                key={cat.name}
                href={`/cakes?category=${cat.name}`}
                className="group relative h-56 md:h-72 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Image
                  src={`https://images.unsplash.com/${cat.image}?w=400`}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} group-hover:opacity-90 transition-opacity`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="text-4xl md:text-5xl mb-3 group-hover:scale-125 transition-transform duration-300">
                    {cat.icon}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{cat.name}</h3>
                  <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Collection →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
              <p className="text-gray-600 text-lg">Real reviews from real customers</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {testimonials.slice(0, 3).map((testimonial, i) => (
                <div 
                  key={i}
                  className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-pink-100"
                >
                  <Quote className="text-pink-300 mb-4" size={32} />
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} size={18} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">&ldquo;{testimonial.comment}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    {testimonial.image && (
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video Section */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">See How We Make Magic</h2>
            <p className="text-xl mb-8 text-pink-100">
              Watch our bakers create your favorite cakes with love and precision
            </p>
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl group cursor-pointer">
              <Image
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200"
                alt="Baking Process"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                  <Play className="text-pink-600 ml-1" size={32} fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom CTA */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto">
                <Image
                  src="https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600"
                  alt="Custom Cake"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-8 md:p-12 text-white flex flex-col justify-center">
                <Sparkles className="mb-4" size={40} />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Dream It, We&apos;ll Create It
                </h2>
                <p className="text-lg mb-6 text-pink-100">
                  Have a unique design in mind? Our expert bakers will bring your vision to life with precision and creativity.
                </p>
                <Link 
                  href="/custom-cakes"
                  className="inline-flex items-center justify-center gap-2 bg-white text-pink-600 px-8 py-4 rounded-full font-bold hover:bg-yellow-300 hover:text-gray-900 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 w-fit"
                >
                  Request Custom Cake
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Sweet with Us</h2>
            <p className="text-gray-600 text-lg mb-8">
              Subscribe to get special offers, free giveaways, and updates
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-full focus:border-pink-500 focus:outline-none text-base"
                required
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
