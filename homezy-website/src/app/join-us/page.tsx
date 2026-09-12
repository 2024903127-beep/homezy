'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Award, 
  Phone, 
  User, 
  MapPin, 
  Briefcase
} from 'lucide-react';

const EARNINGS_CALC: Record<string, { monthly: string; jobsPerDay: string; perks: string[] }> = {
  'ac-tech': {
    monthly: 'Rs 55,000 - Rs 75,000',
    jobsPerDay: '4 to 6 AC foam jet & repair bookings',
    perks: ['Free professional jet pump kit', 'High peak summer incentives', 'Weekly guaranteed payouts']
  },
  'cleaner': {
    monthly: 'Rs 40,000 - Rs 55,000',
    jobsPerDay: '2 to 3 deep cleaning bookings',
    perks: ['Free mechanized scrubbing machine', 'Chemical supply refills subsidized', 'Customer tips retained 100%']
  },
  'electrician': {
    monthly: 'Rs 45,000 - Rs 60,000',
    jobsPerDay: '5 to 7 electrical fixtures/wiring jobs',
    perks: ['Digital multimeter & safety gear kit', 'Short distance neighborhood dispatch', 'Daily surge bonuses']
  },
  'plumber': {
    monthly: 'Rs 45,000 - Rs 62,000',
    jobsPerDay: '4 to 6 pipe, leakage & fitting jobs',
    perks: ['Pipe clearance tool kit provided', 'Flexible working hours', 'Medical insurance for family']
  },
  'beautician': {
    monthly: 'Rs 50,000 - Rs 70,000',
    jobsPerDay: '3 to 5 home salon treatments',
    perks: ['Branded salon kit & disposable packs', 'Women safety SOS feature in app', 'Client gratuity rewards']
  }
};

export default function JoinUsPage() {
  const [selectedTrade, setSelectedTrade] = useState('ac-tech');
  const [registered, setRegistered] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Mumbai');

  const tradeData = EARNINGS_CALC[selectedTrade];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistered(true);
  };

  return (
    <div className="flex flex-col w-full bg-slate-50/50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-100/60 via-emerald-50/30 to-slate-50/50 py-16 sm:py-20 border-b border-emerald-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-100/80 px-3 py-1 rounded-full">
            Homezy Partner Program
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mt-3 leading-tight">
            Turn Your Skill Into a Thriving Business. <br className="hidden sm:inline" />
            <span className="text-emerald-600">Earn up to Rs 75,000 / month.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-3 font-normal">
            Join 12,000+ certified service partners. Get regular customer bookings, weekly direct bank deposits, free training, and family health insurance.
          </p>
        </div>
      </section>

      {/* Income Calculator Widget */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md mb-14">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
              Income Estimator
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Check How Much You Can Earn
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your profession below to see average monthly income based on real partner earnings.
            </p>
          </div>

          {/* Trade Select Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { id: 'ac-tech', label: 'AC Technician' },
              { id: 'cleaner', label: 'Deep Cleaner' },
              { id: 'electrician', label: 'Electrician' },
              { id: 'plumber', label: 'Plumber' },
              { id: 'beautician', label: 'Salon Beautician' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTrade(t.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedTrade === t.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Income Result Box */}
          <div className="bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-green-50 rounded-2xl p-6 sm:p-8 border border-emerald-200 max-w-2xl mx-auto text-center space-y-4">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Estimated Monthly Take-Home
            </div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-900">
              {tradeData.monthly}
            </div>
            <p className="text-xs font-semibold text-emerald-800">
              Based on {tradeData.jobsPerDay}
            </p>

            <div className="pt-4 border-t border-emerald-200/80 flex flex-wrap justify-center gap-4 text-xs font-semibold text-emerald-950">
              {tradeData.perks.map((p, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Steps to Start Earning */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
            Simple Onboarding
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            4 Easy Steps to Start Earning
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">1</div>
            <h3 className="font-extrabold text-sm text-slate-900">Submit Application</h3>
            <p className="text-xs text-slate-500">Fill your name, mobile number, city, and trade below.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">2</div>
            <h3 className="font-extrabold text-sm text-slate-900">KYC & Skill Trial</h3>
            <p className="text-xs text-slate-500">Visit our regional partner center for quick background check and skill demo.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">3</div>
            <h3 className="font-extrabold text-sm text-slate-900">App Setup & Kit</h3>
            <p className="text-xs text-slate-500">Download the Homezy Partner app, collect branded uniform and toolkit.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">4</div>
            <h3 className="font-extrabold text-sm text-slate-900">Go Online & Earn</h3>
            <p className="text-xs text-slate-500">Toggle duty ON, accept nearby bookings, and receive weekly payouts.</p>
          </div>
        </div>

        {/* Partner Registration Form */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-lg max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
              Apply Now
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Join Homezy as a Service Partner
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Takes less than 2 minutes. Our onboarding team will call you within 24 hours.
            </p>
          </div>

          {!registered ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs">
                  <User className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="e.g. Rajesh Shinde"
                    className="w-full outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (WhatsApp Active)</label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-500">+91</span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Primary Skill / Trade</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none bg-white font-medium"
                  >
                    <option>AC & Appliance Repair</option>
                    <option>Home Deep Cleaning</option>
                    <option>Electrician</option>
                    <option>Plumber</option>
                    <option>Carpentry</option>
                    <option>Salon & Beautician</option>
                    <option>Painting</option>
                    <option>Pest Control</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none bg-white font-medium"
                  >
                    <option>Mumbai</option>
                    <option>Delhi NCR</option>
                    <option>Bengaluru</option>
                    <option>Pune</option>
                    <option>Hyderabad</option>
                    <option>Chennai</option>
                    <option>Kolkata</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Years of Practical Work Experience</label>
                <select className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none bg-white font-medium">
                  <option>1 - 2 Years</option>
                  <option>3 - 5 Years</option>
                  <option>5+ Years (Master Level)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md text-xs transition-colors mt-2"
              >
                Submit Partner Registration
              </button>
            </form>
          ) : (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-900">Application Received!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Welcome, <strong>{partnerName}</strong>! Your partner inquiry has been sent to our {city} Onboarding Center. Our onboarding officer will call you on <strong>+91 {phone}</strong> within 24 hours to schedule your document verification.
              </p>
              <button
                onClick={() => setRegistered(false)}
                className="text-xs font-bold text-emerald-700 hover:underline pt-2 block mx-auto"
              >
                Register another partner
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
