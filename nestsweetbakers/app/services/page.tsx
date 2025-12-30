import Image from 'next/image';
import Link from 'next/link';
import { Cake, Gift, Users, Truck, Clock, Shield, Sparkles, Heart } from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      icon: Cake,
      title: 'Custom Cake Design',
      description: 'Bring your dream cake to life with our custom design service. From simple elegance to elaborate creations, we craft cakes tailored to your vision.',
      features: [
        'Personalized consultations',
        'Unlimited design revisions',
        'Premium ingredients',
        'Professional decorating',
      ],
      image: 'photo-1578985545062-69928b1d9587',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Gift,
      title: 'Event Catering',
      description: 'Make your event memorable with our full-service cake catering. Perfect for weddings, corporate events, and large celebrations.',
      features: [
        'Multi-tier cakes',
        'Dessert tables',
        'Event setup service',
        'Bulk order discounts',
      ],
      image: 'photo-1519225421980-715cb0215aed',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Wedding Cakes',
      description: 'Celebrate your special day with a stunning wedding cake. We specialize in elegant, show-stopping designs that taste as good as they look.',
      features: [
        'Cake tasting sessions',
        'Free delivery & setup',
        'Matching desserts',
        'Preservation service',
      ],
      image: 'photo-1464349095431-e9a21285b5f3',
      color: 'from-blue-500 to-purple-500',
    },
    {
      icon: Heart,
      title: 'Birthday Celebrations',
      description: 'Make birthdays unforgettable with our creative and delicious birthday cakes. Any theme, any size, any flavor!',
      features: [
        'Character cakes',
        'Photo cakes',
        'Number & letter cakes',
        'Same-day delivery available',
      ],
      image: 'photo-1558636508-e0db3814bd1d',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Sparkles,
      title: 'Special Occasions',
      description: 'Anniversaries, engagements, baby showers, or just because - we create cakes for every special moment in your life.',
      features: [
        'Theme customization',
        'Fondant & buttercream',
        'Edible prints',
        'Gift packaging',
      ],
      image: 'photo-1586985289688-ca3cf47d3e6e',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: Truck,
      title: 'Delivery & Setup',
      description: 'Reliable delivery service ensuring your cake arrives fresh and perfect. We also offer professional setup for events.',
      features: [
        'Temperature-controlled delivery',
        'Same-day service',
        'Professional setup',
        'GPS tracking',
      ],
      image: 'photo-1556910103-1c02745aae4d',
      color: 'from-green-500 to-teal-500',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 opacity-95" />
        <Image
          src="https://images.unsplash.com/photo-1588195538326-c5b1e5b80d8b?w=1920"
          alt="Our Services"
          fill
          className="object-cover mix-blend-overlay"
          priority
        />
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-slide-up">Our Services</h1>
          <p className="text-lg md:text-2xl animate-slide-up animation-delay-200">
            Premium cake services for every celebration
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Offer</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From custom designs to delivery, we provide comprehensive cake services for all your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={`https://images.unsplash.com/${service.image}?w=600`}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${service.color} opacity-60 group-hover:opacity-40 transition-opacity duration-500`} />
                  
                  {/* Icon */}
                  <div className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    <service.icon className="text-pink-600" size={24} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-pink-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-700 transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300"
                        style={{ transitionDelay: `${idx * 50}ms` }}
                      >
                        <Sparkles className="text-pink-500 flex-shrink-0 mt-0.5" size={16} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href="/custom-cakes"
                    className="block w-full text-center bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl"
                  >
                    Get Started →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose NestSweets?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: 'Quality Guaranteed',
                description: 'Premium ingredients and strict quality control',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                icon: Clock,
                title: 'On-Time Delivery',
                description: 'Punctual delivery for your special moments',
                color: 'bg-green-100 text-green-600',
              },
              {
                icon: Heart,
                title: 'Made with Love',
                description: 'Every cake crafted with passion and care',
                color: 'bg-pink-100 text-pink-600',
              },
              {
                icon: Users,
                title: 'Expert Team',
                description: 'Skilled bakers and designers at your service',
                color: 'bg-purple-100 text-purple-600',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className={`${item.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:rotate-6 transition-all duration-300`}>
                  <item.icon size={36} />
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Process</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { step: '01', title: 'Consultation', desc: 'Share your vision with us' },
              { step: '02', title: 'Design', desc: 'We create your perfect cake' },
              { step: '03', title: 'Baking', desc: 'Fresh preparation with care' },
              { step: '04', title: 'Delivery', desc: 'On-time at your doorstep' },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center group"
              >
                <div className="text-6xl font-bold opacity-20 mb-4 group-hover:opacity-40 group-hover:scale-110 transition-all duration-300">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm opacity-90">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Let&apos;s create something amazing together. Get in touch with us today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/custom-cakes"
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-pink-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              Order Custom Cake
            </Link>
            <Link
              href="/contact"
              className="bg-white text-pink-600 border-2 border-pink-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-50 transform hover:scale-105 transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
