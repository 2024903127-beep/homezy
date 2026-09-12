'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  Award,
  Zap,
  BadgePercent,
  Smartphone,
  Check,
  Play,
  Wind,
  Droplets,
  Hammer,
  Scissors,
  PaintBucket,
  Bug,
  Home,
  Users,
  MapPin,
  Calendar,
  CreditCard,
  ChevronRight,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'cleaning', name: 'Deep Cleaning', Icon: Home, price: 'From Rs.499', badge: 'Popular', tagline: 'Home, Bathroom, Kitchen & Sofa', color: 'bg-blue-50 text-blue-600', badgeColor: 'bg-blue-100 text-blue-700' },
  { id: 'ac-repair', name: 'AC & Appliance Repair', Icon: Wind, price: 'From Rs.349', badge: 'Seasonal Hot', tagline: 'Deep jet service, gas refill & PCB', color: 'bg-cyan-50 text-cyan-600', badgeColor: 'bg-red-100 text-red-700' },
  { id: 'electrician', name: 'Electrician Services', Icon: Zap, price: 'From Rs.149', badge: 'Fast 45m', tagline: 'Fan, switchboard, fuse & rewiring', color: 'bg-amber-50 text-amber-600', badgeColor: 'bg-amber-100 text-amber-700' },
  { id: 'plumber', name: 'Plumbing & Leakages', Icon: Droplets, price: 'From Rs.179', badge: 'Guaranteed', tagline: 'Taps, pipes, blockage & fittings', color: 'bg-indigo-50 text-indigo-600', badgeColor: 'bg-green-100 text-green-700' },
  { id: 'carpenter', name: 'Carpentry & Furniture', Icon: Hammer, price: 'From Rs.199', badge: 'Expert', tagline: 'Door lock, assembly & custom repair', color: 'bg-orange-50 text-orange-600', badgeColor: 'bg-orange-100 text-orange-700' },
  { id: 'salon-women', name: 'Salon & Spa for Women', Icon: Scissors, price: 'From Rs.399', badge: 'Top Rated', tagline: 'Facial, waxing, manicure & pedicure', color: 'bg-pink-50 text-pink-600', badgeColor: 'bg-pink-100 text-pink-700' },
  { id: 'painting', name: 'Painting & Waterproofing', Icon: PaintBucket, price: 'From Rs.999', badge: 'Warranty', tagline: 'Full house, room accent & seepage', color: 'bg-purple-50 text-purple-600', badgeColor: 'bg-purple-100 text-purple-700' },
  { id: 'pest-control', name: 'Pest Control', Icon: Bug, price: 'From Rs.699', badge: '100% Safe', tagline: 'Termite, cockroach, bedbug & rat', color: 'bg-emerald-50 text-emerald-600', badgeColor: 'bg-emerald-100 text-emerald-700' },
];

const TRENDING_SERVICES = [
  { id: 1, title: 'AC Foam Jet Deep Cleaning & Tune-Up', category: 'AC & Appliance', rating: 4.89, reviews: '38.4k', price: 499, originalPrice: 899, time: '45 mins', badge: 'Best Seller', features: ['2x deeper dirt removal', 'Improves cooling by 40%', '30-day warranty'] },
  { id: 2, title: 'Complete 2BHK Deep Cleaning Package', category: 'Home Cleaning', rating: 4.92, reviews: '19.2k', price: 2499, originalPrice: 3999, time: '4-5 hrs', badge: 'Mega Saver', features: ['Floor scrubbing machine', 'Kitchen degreasing', 'Bathroom descaling'] },
  { id: 3, title: 'Intense Bathroom Descaling & Disinfection', category: 'Deep Cleaning', rating: 4.87, reviews: '24.1k', price: 799, originalPrice: 1299, time: '1.5 hrs', badge: 'Hygiene Pro', features: ['Commercial-grade chemicals', 'Tile & grout cleaning', 'Odor neutralizer'] },
  { id: 4, title: "Women's Classic Facial + D-Tan Combo", category: 'Salon & Spa', rating: 4.91, reviews: '31.8k', price: 599, originalPrice: 999, time: '60 mins', badge: 'Trending', features: ['Premium O3+ products', 'UV protection', 'Relaxing head massage'] },
];

const TESTIMONIALS = [
  { id: 1, name: 'Priya Sharma', city: 'Mumbai, Bandra', service: 'Deep Cleaning', rating: 5, comment: 'Absolutely blown away by how thorough the team was. My kitchen looks brand new! The professional was on time, courteous, and used eco-friendly products.', verified: true },
  { id: 2, name: 'Rahul Gupta', city: 'Delhi NCR, Noida', service: 'AC Servicing', rating: 5, comment: "AC wasn't cooling at all. The technician diagnosed the issue in minutes, did a thorough foam jet service and now it's running at peak efficiency. Saved me Rs.8000!", verified: true },
  { id: 3, name: 'Meera Nair', city: 'Bengaluru, Koramangala', service: 'Salon at Home', rating: 5, comment: 'Best decision I made! A professional beautician came home with salon-grade equipment. The facial + waxing combo was incredible  -  same quality as my premium salon.', verified: true },
];

const STATS = [
  { value: '12,000+', label: 'Verified Professionals', Icon: Users },
  { value: '50+', label: 'Services Offered', Icon: Sparkles },
  { value: '4.88', label: 'Average Rating', Icon: Star },
  { value: '25 Cities', label: 'Pan India Presence', Icon: MapPin },
];

const HOW_IT_WORKS = [
  { step: '01', Icon: Search, title: 'Select Your Service', desc: 'Choose from 50+ services with standardized pricing and transparent inclusions.' },
  { step: '02', Icon: Calendar, title: 'Pick Date & Time', desc: 'Select an instant 60-minute express slot or schedule anytime as per your convenience.' },
  { step: '03', Icon: ShieldCheck, title: 'Pro Arrives at Door', desc: 'Verified expert arrives with specialized tools, equipment, and safety gear.' },
  { step: '04', Icon: CreditCard, title: 'Pay After Delight', desc: 'Inspect the work, pay via UPI, card, or cash, and enjoy 30-day warranty.' },
];

const WHY_HOMEZY = [
  { Icon: ShieldCheck, title: 'Background-Verified Pros', desc: 'Every professional undergoes Aadhaar + police verification, skill assessment, and a 90-day onboarding training before their first booking.' },
  { Icon: BadgePercent, title: 'Transparent Upfront Pricing', desc: 'No awkward bargaining. See itemized costs upfront before booking. Receive digital GST invoices with every completed service.' },
  { Icon: Award, title: '30-Day Re-Work Warranty', desc: 'If something goes wrong within 30 days of service, our technician will revisit and resolve it completely free of charge.' },
  { Icon: Zap, title: '60-Minute Express Booking', desc: "Need help right now? Our express slots get a verified professional at your doorstep within 60 minutes of booking." },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-white">
      {/* -- HERO -- */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>India's #1 Home Services Platform</span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Your Home,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
                Perfectly Maintained
              </span>
              <br />
              <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-300 mt-2 block">
                by Verified Professionals
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
              Book trusted home services at your doorstep. Cleaning, AC repair, electricians,
              plumbers, salon, painting & more. 60-minute express delivery. Guaranteed quality.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a service (AC, Cleaning, Salon...)"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white/15 backdrop-blur-sm transition-all"
                />
              </div>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm px-7 py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-0.5 whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                Search Services
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span><strong className="text-white">12,000+</strong> Verified Pros</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span><strong className="text-white">4.88</strong> Avg Rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span><strong className="text-white">60-min</strong> Express Slots</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span><strong className="text-white">25 Cities</strong> Pan India</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- SERVICE CATEGORIES -- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">50+ Services</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">What Can We Help With?</h2>
              <p className="text-slate-500 text-sm mt-2 max-w-lg">From urgent repairs to lifestyle enhancements  -  covered with professional excellence.</p>
            </div>
            <Link href="/services" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm mt-4 sm:mt-0 group">
              View all services
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/services?category=${cat.id}`}
                className="group relative bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/0 group-hover:from-emerald-50/60 group-hover:to-transparent transition-all duration-300 rounded-3xl" />
                <div className="relative">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 ${cat.badgeColor}`}>{cat.badge}</span>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${cat.color}`}>
                    <cat.Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug mb-1">{cat.name}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-3">{cat.tagline}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-600 font-bold text-xs">{cat.price}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -- TRENDING SERVICES -- */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Most Booked</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">Trending Right Now</h2>
              <p className="text-slate-500 text-sm mt-2">Services loved by thousands of homeowners this week.</p>
            </div>
            <Link href="/services" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm mt-4 sm:mt-0 group">
              Browse all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRENDING_SERVICES.map((svc) => (
              <Link
                key={svc.id}
                href={`/services?service=${svc.id}`}
                className="bg-white rounded-3xl border border-slate-100 p-5 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                <div className="w-full h-36 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="w-16 h-16 bg-emerald-200 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-emerald-600" />
                  </div>
                  <span className="absolute top-3 left-3 text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full">{svc.badge}</span>
                  <span className="absolute top-3 right-3 text-[10px] font-bold bg-white/90 text-slate-700 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Clock className="w-3 h-3" />{svc.time}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">{svc.category}</span>
                <h3 className="font-extrabold text-slate-900 text-sm leading-snug mb-2 group-hover:text-emerald-700 transition-colors">{svc.title}</h3>
                <div className="flex items-center gap-1.5 mb-3">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-800">{svc.rating}</span>
                  <span className="text-xs text-slate-400">({svc.reviews} reviews)</span>
                </div>
                <ul className="space-y-1 mb-4 flex-1">
                  {svc.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="font-extrabold text-slate-900 text-base">Rs.{svc.price}</span>
                    <span className="text-xs text-slate-400 line-through ml-1.5">Rs.{svc.originalPrice}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg">{Math.round((1 - svc.price / svc.originalPrice) * 100)}% off</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -- STATS BAND -- */}
      <section className="py-14 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            {STATS.map(({ value, label, Icon }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-1">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black">{value}</span>
                <span className="text-emerald-100 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- WHY HOMEZY -- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Why Homezy?</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">The Homezy Promise</h2>
            <p className="text-slate-500 text-sm mt-2">We deliver an experience you can trust, not just a connection to a service provider.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_HOMEZY.map(({ Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mb-2">{title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- HOW IT WORKS -- */}
      <section className="py-20 bg-emerald-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Simple & Fast</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">How Homezy Works in 4 Steps</h2>
            <p className="text-slate-400 text-sm mt-2">From booking to doorstep completion in less than an hour.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(({ step, Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-start">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md">{step}</div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-800/50 text-emerald-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-bold text-base text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- TESTIMONIALS -- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Customer Stories</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">Real Reviews from Real Homes</h2>
            </div>
            <div className="flex items-center gap-1.5 mt-2 sm:mt-0 text-xs font-bold text-slate-700">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>4.88 out of 5 based on 120,000+ reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((rev) => (
              <div key={rev.id} className="bg-slate-50/70 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-0.5 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{rev.service}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic">"{rev.comment}"</p>
                </div>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-200/60">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0">
                    {rev.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                      <span>{rev.name}</span>
                      {rev.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </h4>
                    <p className="text-[11px] text-slate-400">{rev.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- APP DOWNLOAD -- */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1">
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Mobile App</span>
                <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-4">
                  Book Services in{' '}
                  <span className="text-emerald-400">Under 60 Seconds</span>
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-8 max-w-md">
                  Download the Homezy app for real-time tracking, exclusive discounts, faster re-booking, and push notifications for your booking status.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex items-center gap-3 bg-white text-slate-900 px-5 py-3.5 rounded-2xl hover:bg-slate-100 transition-colors font-bold text-sm">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <div className="text-left">
                      <div className="text-[10px] font-normal text-slate-500">Download on</div>
                      <div className="font-bold">App Store</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 bg-white text-slate-900 px-5 py-3.5 rounded-2xl hover:bg-slate-100 transition-colors font-bold text-sm">
                    <Play className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                    <div className="text-left">
                      <div className="text-[10px] font-normal text-slate-500">Get it on</div>
                      <div className="font-bold">Google Play</div>
                    </div>
                  </button>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-6">
                <div className="hidden sm:flex flex-col gap-3 text-sm text-emerald-200">
                  {['Real-time technician tracking', 'Exclusive app-only discounts', '1-tap re-booking', 'Instant push notifications'].map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="w-48 h-64 bg-emerald-800/40 border border-emerald-700/50 rounded-3xl flex items-center justify-center shadow-2xl">
                  <div className="text-center text-emerald-400">
                    <Smartphone className="w-16 h-16 mx-auto mb-3 opacity-60" />
                    <p className="text-xs font-bold opacity-60">Homezy App</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- PARTNER CTA -- */}
      <section className="py-14 bg-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-200">Are you a skilled professional?</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Earn up to Rs.60,000/month with Homezy</h2>
              <p className="text-emerald-100 text-sm max-w-xl leading-relaxed">
                Join over 12,000 service professionals. Enjoy guaranteed weekly payouts, free accidental insurance, uniforms, and smart dispatch technology.
              </p>
            </div>
            <Link
              href="/join-us"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-emerald-800 font-extrabold text-sm px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 flex-shrink-0"
            >
              <Users className="w-4 h-4" />
              Register as Partner
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
