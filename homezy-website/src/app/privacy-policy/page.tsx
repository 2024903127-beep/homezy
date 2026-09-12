import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col w-full bg-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Compliance & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Last Updated: September 10, 2026 | Effective Date: January 1, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Introduction</h2>
            <p>
              Homezy Technologies India Private Limited (\"Homezy\", \"we\", \"our\", or \"us\") is committed to protecting your privacy and personal data. This Privacy Policy details how we collect, process, store, and safeguard your information when you access our public website, mobile applications, and doorstep service platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Information We Collect</h2>
            <p>
              To deliver seamless doorstep home services, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contact Information:</strong> Full name, phone number, email address, and delivery/home address.</li>
              <li><strong>Location Information:</strong> Precise GPS coordinates during active booking dispatch to navigate technicians to your door.</li>
              <li><strong>Payment Data:</strong> Transaction references and UPI/Card gateway identifiers. We never store raw credit card CVV or PIN numbers.</li>
              <li><strong>Service Logs:</strong> Service photos (e.g. before/after AC wash or plumbing repair), invoices, and customer satisfaction ratings.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. How We Use Your Data</h2>
            <p>
              Your data is utilized strictly for service fulfillment:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Assigning and dispatching the nearest background-verified service partner.</li>
              <li>Issuing GST compliant digital invoices and managing warranty claims.</li>
              <li>Sending transactional notifications via SMS, WhatsApp, and email.</li>
              <li>Quality audits and customer support resolution.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Partner Background & Data Sharing</h2>
            <p>
              We only share your address and phone number with the assigned service professional during the active booking window. We never sell, rent, or trade your personal data to third-party marketing brokers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Security & DPDP Compliance</h2>
            <p>
              Our infrastructure employs 256-bit TLS encryption in transit and AES encryption at rest, complying with the Digital Personal Data Protection (DPDP) Act of India.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">6. Contact Our Grievance Officer</h2>
            <p>
              For data access requests, corrections, or grievance inquiries, write to our designated Data Protection Officer at:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1 text-slate-700">
              <div><strong>Grievance Officer:</strong> Homezy Privacy & Legal Team</div>
              <div><strong>Email:</strong> privacy@homezy.in | grievance@homezy.in</div>
              <div><strong>Address:</strong> Level 8, Platina Tower, BKC, Mumbai, MH 400051</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
