import React from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex flex-col w-full bg-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>User Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Last Updated: September 10, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Homezy website, consumer app, or booking our home services, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Booking & Cancellation Policy</h2>
            <p>
              Users can book services on an on-demand (60-minute express) or scheduled basis. Free cancellation is permitted up to 30 minutes prior to technician arrival. A nominal convenience fee of Rs 99 may apply if cancellation occurs after the technician is already dispatched to the address.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Standardized Pricing & Billing</h2>
            <p>
              All prices displayed on Homezy include applicable platform fees and technician compensation. Standard 18% GST will be itemized on the final tax invoice. Payment must be settled upon job completion via digital UPI, card, or cash.
            </p>
          </section>

          <section id="anti-discrimination" className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Anti-Discrimination & Partner Safety Policy</h2>
            <p>
              Homezy enforces a strict zero-tolerance policy against any form of discrimination, verbal abuse, or harassment directed towards service partners on the basis of caste, religion, gender, or social background. We reserve the right to immediately terminate user accounts that violate partner dignity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Governing Law & Dispute Resolution</h2>
            <p>
              These terms are governed by the laws of the Republic of India. Any disputes arising out of service delivery shall be subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
