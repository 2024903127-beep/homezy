import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  Headphones, 
  Award, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  Heart,
  Smartphone
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-emerald-950">
      {/* Top Value Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">100% Verified</h4>
              <p className="text-slate-400 text-xs mt-0.5">Background checked pros</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">30-Day Warranty</h4>
              <p className="text-slate-400 text-xs mt-0.5">Re-work guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Instant Arrival</h4>
              <p className="text-slate-400 text-xs mt-0.5">At your door in 60 mins</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">24/7 Support</h4>
              <p className="text-slate-400 text-xs mt-0.5">Dedicated helpline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Col */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-sm bg-white flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="Homezy Logo" 
                width={32} 
                height={32} 
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Home<span className="text-emerald-400">zy</span>
            </span>
          </Link>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            Homezy is India's fastest growing on-demand home services platform, bringing verified, skilled professionals for cleaning, repair, maintenance, and salon directly to your home.
          </p>

          <div className="pt-2 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+91 1800-HOMEZY-24 (Toll Free)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>care@homezy.in | partner@homezy.in</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 cursor-pointer transition-colors">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-semibold">Get it on</div>
                <div className="text-xs font-bold text-white">Google Play</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 cursor-pointer transition-colors">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-semibold">Download on</div>
                <div className="text-xs font-bold text-white">App Store</div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Col */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
            Popular Services
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><Link href="/services" className="hover:text-emerald-400 transition-colors">AC Service & Repair</Link></li>
            <li><Link href="/services" className="hover:text-emerald-400 transition-colors">Deep Home Cleaning</Link></li>
            <li><Link href="/services" className="hover:text-emerald-400 transition-colors">Electricians & Rewiring</Link></li>
            <li><Link href="/services" className="hover:text-emerald-400 transition-colors">Plumbers & Pipe Repair</Link></li>
            <li><Link href="/services" className="hover:text-emerald-400 transition-colors">Carpentry & Furniture</Link></li>
            <li><Link href="/services" className="hover:text-emerald-400 transition-colors">Salon & Spa for Women</Link></li>
            <li><Link href="/services" className="hover:text-emerald-400 transition-colors">Painting & Waterproofing</Link></li>
            <li><Link href="/services" className="hover:text-emerald-400 transition-colors">Pest Control & Sanitization</Link></li>
          </ul>
        </div>

        {/* Company Col */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
            Company & Community
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
            <li><Link href="/careers" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <span>Careers</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">HIRING</span>
            </Link></li>
            <li><Link href="/join-us" className="hover:text-emerald-400 transition-colors text-emerald-400 font-semibold">Join as a Partner</Link></li>
            <li><Link href="/support" className="hover:text-emerald-400 transition-colors">Customer Support</Link></li>
            <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact Us</Link></li>
            <li><Link href="/about#safety" className="hover:text-emerald-400 transition-colors">Homezy Safety Standards</Link></li>
            <li><Link href="/about#press" className="hover:text-emerald-400 transition-colors">Press & Media</Link></li>
          </ul>
        </div>

        {/* Legal & Policy Col */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
            Legal & Compliance
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
            <li><Link href="/disclaimer" className="hover:text-emerald-400 transition-colors">Service Disclaimer</Link></li>
            <li><Link href="/disclaimer#warranty" className="hover:text-emerald-400 transition-colors">30-Day Warranty Policy</Link></li>
            <li><Link href="/privacy-policy#cookies" className="hover:text-emerald-400 transition-colors">Cookie Policy</Link></li>
            <li><Link href="/terms#anti-discrimination" className="hover:text-emerald-400 transition-colors">Anti-Discrimination Policy</Link></li>
            <li><Link href="/support#cancellations" className="hover:text-emerald-400 transition-colors">Refund & Cancellation</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>(C) 2026 Homezy Technologies India Private Limited. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with care for happy homes across India.
        </p>
      </div>
    </footer>
  );
}
