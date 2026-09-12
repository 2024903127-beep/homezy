'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  CheckCircle2,
  Send,
  HelpCircle
} from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col w-full bg-slate-50/50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-b from-emerald-100/60 via-emerald-50/30 to-slate-50/50 py-12 border-b border-emerald-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-100/80 px-3 py-1 rounded-full">
            We Are Here For You
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mt-3">
            Contact Homezy Support
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-2">
            Have a question about a booking, partnership, or general inquiry? Our customer care team responds in under 15 minutes.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 pb-2 border-b border-slate-100">
                Direct Contact Channels
              </h3>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Toll-Free Customer Care</h4>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">+91 1800-HOMEZY-24</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">8:00 AM - 10:00 PM, 7 days a week</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Email Inquiries</h4>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">care@homezy.in</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Partnership: partner@homezy.in</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Operating Hours</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Service Delivery: 7:00 AM - 9:00 PM</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Support Desk: 24/7 for active bookings</p>
                </div>
              </div>
            </div>

            {/* Office Locations */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 pb-2 border-b border-slate-100">
                Headquarters & Regional Hubs
              </h3>

              <div className="flex items-start gap-3 text-xs text-slate-600">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Mumbai Headquarters:</strong>
                  Level 8, Platina Tower, Bandra Kurla Complex (BKC), Mumbai, MH 400051
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-600">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Bengaluru Tech & Innovation Hub:</strong>
                  Indiranagar 100 Feet Road, HAL 2nd Stage, Bengaluru, KA 560038
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-600">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Delhi NCR Operations Center:</strong>
                  Sector 62, Electronic City, Noida, UP 201309
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm">
              <h3 className="font-extrabold text-xl text-slate-900 mb-1">
                Send Us a Message
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Fill in the form below and an agent from our operations team will call or email you shortly.
              </p>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="9876543210"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 transition-colors bg-white font-medium"
                      >
                        <option>General Inquiry</option>
                        <option>Existing Booking Issue</option>
                        <option>Partner Registration Help</option>
                        <option>Warranty Claim</option>
                        <option>Billing & Refund</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Message Details</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe your question or issue in detail..."
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-7 py-3 rounded-xl shadow-md transition-colors w-full sm:w-auto"
                  >
                    <span>Submit Message</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Message Received!</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Thank you, <strong>{formData.name}</strong>. A support executive has been assigned ticket <strong>#HMZ-{Math.floor(10000 + Math.random() * 90000)}</strong> and will reach out to you within 15 minutes.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-bold text-emerald-700 hover:underline pt-2 block mx-auto"
                  >
                    Send another message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
