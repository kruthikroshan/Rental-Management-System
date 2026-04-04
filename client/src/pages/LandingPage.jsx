import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Instant Booking',
      description: 'Reserve instantly with real-time availability checks and zero wait times.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Secure Payments',
      description: 'Bank-grade encryption with UPI, cards, and digital wallet support.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Doorstep Delivery',
      description: 'Free delivery and pickup at your location, on your schedule.',
    },
  ];

  const categories = [
    { emoji: '🪑', title: 'Premium Furniture', desc: 'Modern living, affordable rates', color: 'from-amber-50 to-orange-50', border: 'border-amber-100' },
    { emoji: '🚲', title: 'Urban Mobility', desc: 'Bikes, scooters & more', color: 'from-emerald-50 to-teal-50', border: 'border-emerald-100' },
    { emoji: '💻', title: 'High-End Tech', desc: 'Latest devices on demand', color: 'from-blue-50 to-indigo-50', border: 'border-blue-100' },
    { emoji: '🛠️', title: 'Professional Tools', desc: 'Industrial-grade equipment', color: 'from-slate-50 to-gray-100', border: 'border-slate-200' },
  ];

  const steps = [
    { num: '01', title: 'Browse & Discover', desc: 'Explore our curated catalog of premium items. Filter by category, price, or availability to find exactly what you need.', icon: '🔍' },
    { num: '02', title: 'Book & Pay', desc: 'Choose your rental duration and pay securely. We support UPI, credit cards, and all major payment methods.', icon: '💳' },
    { num: '03', title: 'Receive & Enjoy', desc: 'We deliver to your doorstep. Use the item as long as you need, and we handle the pickup when you\'re done.', icon: '🎉' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'Interior Designer', text: 'SmartRent transformed how I source furniture for staging. The quality is outstanding and delivery is always on time.', avatar: 'PS' },
    { name: 'Rohit Verma', role: 'Freelance Developer', text: 'Renting a MacBook Pro for a 3-month project saved me ₹1.5L. The process was seamless from start to finish.', avatar: 'RV' },
    { name: 'Anika Joshi', role: 'Event Planner', text: 'From projectors to premium furniture, SmartRent is my go-to for every event setup. Highly recommended!', avatar: 'AJ' },
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* ── Navigation ──────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-100 py-2'
          : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Smart<span className="text-indigo-600">Rent</span>
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              {['Features', 'How It Works', 'Reviews', 'Contact'].map((item, i) => (
                <a key={item} href={`#${['explore','process','reviews','contact'][i]}`} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="btn-premium-primary !py-2.5 !px-5 !text-sm !rounded-xl">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/auth/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 px-4 py-2 transition-colors">
                    Sign In
                  </Link>
                  <Link to="/auth/signup" className="btn-premium-primary !py-2.5 !px-5 !text-sm !rounded-xl">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-mesh pointer-events-none" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-indigo-100 rounded-full mix-blend-multiply filter blur-[128px] opacity-40" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-100 rounded-full mix-blend-multiply filter blur-[128px] opacity-30" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
                RENT SMARTER, NOT HARDER
              </div>

              <h1 className="text-5xl lg:text-[4.25rem] font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Rent anything,{' '}
                <span className="text-gradient">anytime.</span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Premium furniture, electronics, and tools — delivered to your door. No commitments, no hassle, just what you need.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
                <Link to={isAuthenticated ? (user?.role === 'admin' ? '/admin/dashboard' : '/products') : '/auth/signup'} className="btn-premium-primary text-base px-8 py-4 shadow-xl shadow-indigo-200/50">
                  {isAuthenticated ? 'Go to App' : 'Start Renting'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                {!isAuthenticated && (
                  <Link to="/auth/login" className="btn-premium-secondary text-base px-8 py-4">
                    Sign In
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-5 pt-4 justify-center lg:justify-start">
                <div className="flex -space-x-2.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/100?u=smartrent${i}`} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-9 h-9 rounded-full border-2 border-white bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                    5k+
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">5,000+</span> happy renters across India
                </div>
              </div>
            </div>

            <div className="flex-1 relative lg:max-w-xl w-full">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-200/40 animate-float">
                <img
                  src="/assets/hero.png"
                  alt="SmartRent - Premium Rentals"
                  className="rounded-3xl w-full h-auto object-cover max-h-[480px]"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80';
                  }}
                />
              </div>
              <div className="absolute -top-10 -right-10 w-56 h-56 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────── */}
      <section id="explore" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-indigo-600 font-semibold text-sm mb-3">WHAT WE OFFER</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              Everything you need, just a click away
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              From furniture to electronics to tools — browse thousands of items available for daily, weekly, or monthly rental.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <div key={idx} className={`rounded-2xl p-6 bg-gradient-to-br ${cat.color} border ${cat.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}>
                <div className="text-4xl mb-4">{cat.emoji}</div>
                <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{cat.title}</h3>
                <p className="text-sm text-slate-500">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div>
                <p className="text-indigo-600 font-semibold text-sm mb-3">WHY SMARTRENT</p>
                <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                  A better way to access the things you love
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed">
                  Skip the hassle of ownership. Rent premium items with flexible plans, free delivery, and no long-term commitments.
                </p>
              </div>
              <div className="space-y-6">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex gap-5 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1">{feature.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/furniture.png"
                alt="Premium items"
                className="rounded-3xl shadow-xl w-full"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80';
                }}
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 max-w-[200px] border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600">Available Now</span>
                </div>
                <p className="text-sm font-bold text-slate-800">2,500+ items</p>
                <p className="text-xs text-slate-400">Ready for rental</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section id="process" className="py-24 lg:py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15),_transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-indigo-400 font-semibold text-sm mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
              Three simple steps to get started
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              Renting has never been easier. Follow these simple steps and get your items delivered today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl">{step.icon}</span>
                  <span className="text-sm font-bold text-indigo-400 mono-num">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-300 transition-colors">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────── */}
      <section id="reviews" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-indigo-600 font-semibold text-sm mb-3">TESTIMONIALS</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              Loved by thousands of renters
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-mesh">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
          <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Ready to rent <span className="text-gradient">smarter?</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Join 15,000+ people who are saving money and living better with SmartRent. No credit card required to browse.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={isAuthenticated ? (user?.role === 'admin' ? '/admin/dashboard' : '/products') : '/auth/signup'} className="btn-premium-primary px-10 py-4 text-base shadow-xl shadow-indigo-200/50">
              {isAuthenticated ? 'Go to App' : 'Get Started Free'}
            </Link>
            {!isAuthenticated && (
              <Link to="/auth/login" className="btn-premium-secondary px-10 py-4 text-base">
                Sign In to Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer id="contact" className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
            <div className="col-span-2 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="text-lg font-bold">SmartRent</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                India's leading rental platform. Rent premium furniture, electronics, and tools with free delivery.
              </p>
              <div className="flex gap-4">
                {['twitter', 'instagram', 'linkedin'].map(s => (
                  <a key={s} href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /></svg>
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: 'Product', links: ['Browse Catalog', 'Pricing', 'Categories', 'How It Works'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-slate-500 text-sm">
            <p>© 2026 SmartRent Technologies. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;