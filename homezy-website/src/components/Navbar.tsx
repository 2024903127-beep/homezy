'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, 
  Menu, 
  X, 
  ChevronDown, 
  Sparkles, 
  ArrowRight,
  User,
  CalendarCheck,
  MapPinned,
  LogOut,
  Navigation,
  Check,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { useLocation } from '@/lib/locationContext';

const CITIES = ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'];

export default function Navbar() {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { location, isLocating, detectLocation, setCity } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDetectGPS = async () => {
    await detectLocation();
    setCityDropdownOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-slate-100' 
        : 'bg-white/85 backdrop-blur-sm py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & City Selector */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm ring-1 ring-emerald-200 group-hover:scale-105 transition-transform bg-white flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="Homezy Logo" 
                width={36} 
                height={36} 
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center">
                Home<span className="text-emerald-600">zy</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase -mt-1">
                Expert Services
              </span>
            </div>
          </Link>

          {/* Location / City Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 text-xs font-semibold transition-colors border border-emerald-200/80 shadow-xs max-w-[190px]"
              title={location.formattedAddress || `${location.area}, ${location.city}`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">
                {location.isAutoDetected ? (location.area || location.city) : location.city}
              </span>
              <ChevronDown className="w-3 h-3 text-emerald-700 flex-shrink-0 transition-transform" />
            </button>

            {cityDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* GPS Detect Button */}
                <div className="p-2 border-b border-slate-100">
                  <button
                    onClick={handleDetectGPS}
                    disabled={isLocating}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold transition-all"
                  >
                    <Navigation className={`w-4 h-4 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Detecting GPS Location...' : 'Detect Current Location'}</span>
                  </button>
                  {location.isAutoDetected && (
                    <div className="mt-1.5 px-1 text-[10px] text-slate-500 truncate flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{location.area || location.city}</span>
                    </div>
                  )}
                </div>

                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Metro City
                </div>
                <div className="max-h-52 overflow-y-auto py-1">
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setCity(city);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        location.city === city && !location.isAutoDetected
                          ? 'bg-emerald-50 text-emerald-700 font-bold' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{city}</span>
                      {location.city === city && !location.isAutoDetected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-emerald-600 transition-colors font-semibold text-slate-900">Home</Link>
          <Link href="/services" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
            <span>Services</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">50+</span>
          </Link>
          <Link href="/about" className="hover:text-emerald-600 transition-colors">About Us</Link>
          <Link href="/join-us" className="hover:text-emerald-600 transition-colors flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Join as Partner</span>
          </Link>
          <Link href="/careers" className="hover:text-emerald-600 transition-colors">Careers</Link>
          <Link href="/support" className="hover:text-emerald-600 transition-colors">Support</Link>
        </nav>

        {/* Auth / Account & Booking Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-xs font-bold text-slate-800"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'HC'}
                </div>
                <span>{user.name || user.phone || 'My Account'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900 truncate">{user.name || 'Homezy Customer'}</div>
                    <div className="text-[11px] text-slate-500">{user.phone}</div>
                  </div>

                  <Link
                    href="/bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-semibold"
                  >
                    <CalendarCheck className="w-4 h-4 text-emerald-600" />
                    <span>My Bookings</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-semibold"
                  >
                    <MapPinned className="w-4 h-4 text-emerald-600" />
                    <span>Profile & Addresses</span>
                  </Link>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 font-semibold border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal()}
              className="flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 font-bold text-xs px-3.5 py-2 rounded-full border border-slate-200 hover:border-emerald-300 transition-colors bg-white shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Login / Register</span>
            </button>
          )}

          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/35 transition-all transform hover:-translate-y-0.5"
          >
            <span>Book Service</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200/80 px-5 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-500 uppercase">Location:</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                  {location.area || location.city}
                </span>
              </div>
              {isAuthenticated ? (
                <button onClick={() => logout()} className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              ) : (
                <button onClick={() => { setMobileMenuOpen(false); openAuthModal(); }} className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Login
                </button>
              )}
            </div>

            {/* Mobile GPS Detect Button */}
            <button
              onClick={() => {
                detectLocation();
                setMobileMenuOpen(false);
              }}
              disabled={isLocating}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold"
            >
              <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting Location...' : 'Use My Current GPS Location'}</span>
            </button>
          </div>

          <div className="flex flex-col space-y-2.5 font-medium text-slate-700 text-sm">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-emerald-600 font-bold text-slate-900">Home</Link>
            <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-emerald-600 flex items-center justify-between">
              <span>Services Catalog</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">50+ Services</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/bookings" onClick={() => setMobileMenuOpen(false)} className="py-1.5 text-emerald-800 font-bold flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  <span>My Bookings</span>
                </Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="py-1.5 text-emerald-800 font-bold flex items-center gap-2">
                  <MapPinned className="w-4 h-4 text-emerald-600" />
                  <span>Profile & Addresses</span>
                </Link>
              </>
            )}
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-emerald-600">About Homezy</Link>
            <Link href="/join-us" onClick={() => setMobileMenuOpen(false)} className="py-1.5 text-emerald-700 font-bold flex items-center gap-2 bg-emerald-50/80 p-2 rounded-xl border border-emerald-100">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Join as Partner (Earn Rs 40k - Rs 75k)</span>
            </Link>
            <Link href="/careers" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-emerald-600">Careers & Jobs</Link>
            <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-emerald-600">Support & FAQs</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-emerald-600">Contact Us</Link>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md text-sm"
            >
              Book a Service Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
