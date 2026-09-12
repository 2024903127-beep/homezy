'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Award, 
  Users, 
  Heart, 
  Target, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-100/60 via-emerald-50/30 to-white py-16 sm:py-20 border-b border-emerald-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-100/80 px-3 py-1 rounded-full">
            Our Mission & Story
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mt-3 leading-tight">
            Building India's Most Trusted <br className="hidden sm:inline" />
            <span className="text-emerald-600">Home Services Platform.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mt-4 leading-relaxed font-normal">
            Homezy was founded with a singular ambition: to organize the fragmented home service industry in India by empowering skilled local technicians and giving homeowners reliable, transparent, high-quality service at standardized rates.
          </p>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
              <div className="text-3xl font-black text-emerald-800">50,000+</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Happy Households Served</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
              <div className="text-3xl font-black text-emerald-800">12,000+</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Certified Partners Trained</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
              <div className="text-3xl font-black text-emerald-800">8+</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Major Indian Metros</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
              <div className="text-3xl font-black text-emerald-800">4.88 </div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Average Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Pillars */}
      <section className="py-16 sm:py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
              Core Principles
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mt-1">
              The 4 Pillars of Homezy
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Everything we do is designed to protect your home and uplift our partner professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Safety & Background Verification</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  We conduct strict multi-tier identity checks including government Aadhaar authentication, court record scans, and in-person interviews before any partner joins Homezy.
                </p>
              </div>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Rigorous Training & Quality Standards</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Every technician undergoes mandatory 14-day practical skill training in our regional Homezy Centers covering tool usage, hygiene standards, and customer soft skills.
                </p>
              </div>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Transparent & Standardized Pricing</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  No sudden surprises or arbitrary cash negotiations. We publish exact itemized rate cards with GST digital invoices delivered directly to your phone.
                </p>
              </div>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Partner Dignity & Fair Earnings</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Homezy professionals take home 80-85% of each service fee with weekly direct bank payouts, health insurance for their families, and micro-loan assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Pledge Section */}
      <section id="safety" className="py-16 sm:py-20 bg-emerald-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
            Our Promise to You
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-2">
            The Homezy Safety & Quality Pledge
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
            If you are not 100% delighted with our work, our customer protection team steps in immediately. We offer a 30-day free re-work guarantee on all repair and cleaning services, backed by up to Rs 10,000 damage protection insurance on every booking.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs px-6 py-3 rounded-full transition-all"
            >
              <span>Explore Home Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/join-us"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs px-6 py-3 rounded-full transition-all border border-white/20"
            >
              <span>Join as Service Partner</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
