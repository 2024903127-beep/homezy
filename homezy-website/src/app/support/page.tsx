'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  PhoneCall, 
  MessageSquare, 
  ShieldCheck, 
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';

const FAQS = [
  {
    category: 'Bookings & Scheduling',
    items: [
      {
        q: 'How fast can a service professional arrive at my home?',
        a: 'With our express booking feature, a certified professional arrives at your doorstep within 60 minutes in serviced pin codes. You can also schedule slots up to 7 days in advance.'
      },
      {
        q: 'Can I reschedule or cancel my service booking?',
        a: 'Yes, you can reschedule or cancel anytime for 100% free up to 30 minutes before the scheduled arrival time through the website or customer support hotline.'
      },
      {
        q: 'How do I track my assigned service technician?',
        a: 'Once your pro is assigned, you receive real-time SMS updates with the technician name, photo, phone number, and live arrival status.'
      }
    ]
  },
  {
    category: 'Pricing & Warranty',
    items: [
      {
        q: 'Are the prices fixed or do they change upon arrival?',
        a: 'All Homezy service prices are strictly standardized and upfront. The professional will never charge higher than the displayed rate card. Any extra parts needed are billed at standard MRP with prior consent.'
      },
      {
        q: 'What does the 30-day warranty cover?',
        a: 'Our 30-day warranty covers the specific repair or service performed. If the same issue recurs within 30 days, we send a technician to inspect and resolve it completely free.'
      },
      {
        q: 'What payment modes are accepted?',
        a: 'We accept UPI (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, and cash on service completion.'
      }
    ]
  },
  {
    category: 'Safety & Quality',
    items: [
      {
        q: 'How are Homezy professionals verified?',
        a: 'Every technician undergoes government-backed Aadhaar/PAN identity checks, police criminal record verification, and a mandatory 14-day training module.'
      },
      {
        q: 'What if an item in my home gets damaged during service?',
        a: 'Homezy provides up to Rs 10,000 in damage protection insurance on every booked service. If accidental damage occurs during authorized work, our claim team reimburses repair or replacement costs.'
      }
    ]
  }
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<string | null>('Bookings & Scheduling-0');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaq = (key: string) => {
    setOpenFaq(openFaq === key ? null : key);
  };

  return (
    <div className="flex flex-col w-full bg-slate-50/50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-100/60 via-emerald-50/30 to-slate-50/50 py-12 border-b border-emerald-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-100/80 px-3 py-1 rounded-full">
            Help Center & FAQs
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mt-3">
            How Can We Assist You?
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-2 font-normal">
            Find immediate answers to common questions regarding bookings, payments, safety, and our 30-day warranty.
          </p>
        </div>
      </section>

      {/* Support Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Phone Support</h3>
              <p className="text-xs text-slate-500 mt-1">Direct call with our support agents for urgent booking queries.</p>
            </div>
            <a
              href="tel:1800-466-399"
              className="mt-4 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>+91 1800-HOMEZY-24</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">WhatsApp Assistance</h3>
              <p className="text-xs text-slate-500 mt-1">Get immediate responses, share photos of leaks or repair jobs.</p>
            </div>
            <Link
              href="/contact"
              className="mt-4 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Start WhatsApp Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">30-Day Warranty Claim</h3>
              <p className="text-xs text-slate-500 mt-1">Claim free re-work if any completed job needs attention.</p>
            </div>
            <Link
              href="/contact?subject=Warranty"
              className="mt-4 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>File Warranty Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs max-w-4xl mx-auto space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500 mt-0.5">Everything you need to know about booking with Homezy.</p>
          </div>

          {FAQS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">
                {group.category}
              </h3>

              <div className="space-y-2">
                {group.items.map((item, idx) => {
                  const key = `${group.category}-${idx}`;
                  const isOpen = openFaq === key;

                  return (
                    <div
                      key={idx}
                      className="border border-slate-100 rounded-2xl overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => toggleFaq(key)}
                        className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {item.q}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed bg-slate-50/50 pt-1">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
