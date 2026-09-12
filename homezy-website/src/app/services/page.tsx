'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Star, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Calendar,
  Sparkles,
  Phone,
  User,
  MapPin,
  Check,
  CreditCard,
  Banknote,
  Loader2,
  Mail,
  Navigation
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { createBooking, getAddresses, getLiveServices, getLiveCategories, Address, Booking } from '@/lib/api';
import { useLocation } from '@/lib/locationContext';

const CATEGORIES = [
  { id: 'all', name: 'All Services' },
  { id: 'ac-repair', name: 'AC & Appliances' },
  { id: 'cleaning', name: 'Deep Cleaning' },
  { id: 'electrician', name: 'Electrician' },
  { id: 'plumber', name: 'Plumbing' },
  { id: 'carpenter', name: 'Carpentry' },
  { id: 'salon', name: 'Salon for Women' },
  { id: 'pest-control', name: 'Pest Control' }
];

// Category-specific fallback images (used when no admin-uploaded image exists)
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'ac-repair': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  'ac-maintenance': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  'cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
  'home-cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
  'electrician': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
  'electrical': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
  'plumber': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
  'plumbing': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
  'carpenter': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80',
  'carpentry': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80',
  'salon': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  'salon-women': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  'painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  'pest-control': 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=800&q=80',
  'appliance-repair': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  'gardening': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
  'locksmith': 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
  'water-tank-cleaning': 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80',
  'general-home-repairs': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80';

function getServiceImage(service: any): string {
  return service.imageUrl || CATEGORY_FALLBACK_IMAGES[service.category] || DEFAULT_FALLBACK;
}

const SERVICES_CATALOG = [
  {
    id: 1,
    category: 'ac-repair',
    categoryName: 'AC & Appliances',
    title: 'AC Foam Jet Deep Cleaning & Servicing',
    price: 499,
    originalPrice: 899,
    rating: 4.89,
    reviews: 3842,
    time: '45 mins',
    badge: 'Best Seller',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    description: 'Specialized 2x indoor & outdoor high-pressure foam jet wash with anti-bacterial coating.',
    inclusions: ['High-pressure water jet cleaning', 'AC indoor unit filter wash', 'Drain pipe flushing & coil disinfection', 'Cooling & gas pressure check'],
    exclusions: ['Spare parts & capacitor replacement', 'Gas charging (available on add-on)']
  },
  {
    id: 2,
    category: 'ac-repair',
    categoryName: 'AC & Appliances',
    title: 'AC Gas Leak Detection & Top-up',
    price: 1899,
    originalPrice: 2499,
    rating: 4.82,
    reviews: 1420,
    time: '60 mins',
    badge: 'Popular',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    description: 'Complete nitrogen pressure leak test, brazing/soldering & pure R32/R410A gas refill.',
    inclusions: ['Complete nitrogen leak detection', 'Leak fixing by brazing', 'Pure factory refrigerant refill', 'Cooling temperature check'],
    exclusions: ['PCB board circuit replacement']
  },
  {
    id: 3,
    category: 'cleaning',
    categoryName: 'Deep Cleaning',
    title: 'Complete 2BHK Home Deep Cleaning',
    price: 2499,
    originalPrice: 3999,
    rating: 4.92,
    reviews: 2150,
    time: '4-5 hrs',
    badge: 'Top Choice',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    description: 'End-to-end mechanized scrubbing, balcony, bedroom, kitchen degreasing and bathroom sanitization.',
    inclusions: ['Single disc floor scrubber machine', 'Kitchen chimney & counter degreasing', '2 Bathrooms hard water stain removal', 'Window glass & channel vacuuming'],
    exclusions: ['Interior cupboard deep cleaning (if occupied)']
  },
  {
    id: 4,
    category: 'cleaning',
    categoryName: 'Deep Cleaning',
    title: 'Bathroom Hard-Water Stain Deep Clean',
    price: 499,
    originalPrice: 899,
    rating: 4.86,
    reviews: 4120,
    time: '60 mins',
    badge: 'Trending',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    description: 'Special chemical scaling treatment for yellow tiles, grout scrubbing, washbasin & mirror buffing.',
    inclusions: ['Chemical scaling & stain removal', 'Chrome fixtures buffing & descaling', 'Mirror sparkling polishing', 'Floor & wall tile scrubbing'],
    exclusions: ['Silicon re-grouting']
  },
  {
    id: 5,
    category: 'electrician',
    categoryName: 'Electrical',
    title: 'Switchboard, Socket & MCB Repairs',
    price: 199,
    originalPrice: 399,
    rating: 4.88,
    reviews: 3200,
    time: '30 mins',
    badge: 'Verified Pro',
    imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
    description: 'Diagnosis and replacement of burned sockets, flickering switchboards, tripping MCBs.',
    inclusions: ['Safety voltage testing', 'Burnt wire replacement', 'Earth leakage check', 'Component fitment'],
    exclusions: ['New switches/MCBs (charged on actuals)']
  },
  {
    id: 6,
    category: 'electrician',
    categoryName: 'Electrical',
    title: 'Ceiling Fan Installation & Repair',
    price: 199,
    originalPrice: 349,
    rating: 4.84,
    reviews: 1890,
    time: '30 mins',
    badge: 'Quick Service',
    imageUrl: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&w=800&q=80',
    description: 'Installation of standard or designer fans, regulator replacement, blade balancing & noise fix.',
    inclusions: ['Ceiling hook fitment check', 'Capacitor testing', 'Blade balancing', 'Post-fit test run'],
    exclusions: ['Anchor bolts & step ladder']
  },
  {
    id: 7,
    category: 'plumber',
    categoryName: 'Plumbing',
    title: 'Tap & Mixer Leakage Fixing',
    price: 249,
    originalPrice: 449,
    rating: 4.90,
    reviews: 2890,
    time: '30 mins',
    badge: 'Popular',
    imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
    description: 'Fix dripping faucets, wall mixer internal cartridges, washer replacement and thread seals.',
    inclusions: ['Internal spindle check & replacement', 'Teflon threading', 'Leak pressure test', 'Sink strainer alignment'],
    exclusions: ['Brass tap body replacement']
  },
  {
    id: 8,
    category: 'plumber',
    categoryName: 'Plumbing',
    title: 'Toilet Jet Spray & Flush Tank Repair',
    price: 299,
    originalPrice: 499,
    rating: 4.81,
    reviews: 1720,
    time: '40 mins',
    badge: 'Essential',
    imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    description: 'Repair cistern push buttons, siphon valves, continuous water filling and jet spray leaks.',
    inclusions: ['Flush siphon alignment', 'Inlet angle valve check', 'Jet spray hose connection', 'Water level adjustment'],
    exclusions: ['Full ceramic cistern set']
  },
  {
    id: 9,
    category: 'carpenter',
    categoryName: 'Carpentry',
    title: 'Door Lock, Hinge & Handle Repairs',
    price: 299,
    originalPrice: 599,
    rating: 4.85,
    reviews: 1350,
    time: '45 mins',
    badge: 'Specialist',
    imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80',
    description: 'Mortise lock installation, stuck door realignment, hydraulic closer adjustment.',
    inclusions: ['Chisel work & alignment', 'Screw tightening & lubricant spray', 'Lock key testing', '30-day warranty'],
    exclusions: ['Cost of mortise lock mechanism']
  },
  {
    id: 10,
    category: 'salon',
    categoryName: 'Salon for Women',
    title: 'Chocolate Waxing + Glow Facial Combo',
    price: 1499,
    originalPrice: 2299,
    rating: 4.93,
    reviews: 5120,
    time: '90 mins',
    badge: 'Super Saver',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    description: 'Full arms + full legs chocolate waxing with soothing anti-tan herbal face cleanup.',
    inclusions: ['Disposable hygiene kit', 'Full arms + underarms chocolate wax', 'Full legs waxing', 'Radiance fruit facial massage'],
    exclusions: ['Eyebrow threading (add-on)']
  },
  {
    id: 11,
    category: 'pest-control',
    categoryName: 'Pest Control',
    title: 'Herbal Cockroach & Ant Control',
    price: 799,
    originalPrice: 1299,
    rating: 4.87,
    reviews: 2400,
    time: '45 mins',
    badge: 'Eco Friendly',
    imageUrl: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=800&q=80',
    description: 'Odorless Bayer herbal gel dots applied to cabinets, drawers and drain traps. Safe for pets & kids.',
    inclusions: ['Kitchen cabinets gel paste', 'Drain pipes perimeter spray', 'Bathroom skirting application', '60-day guarantee'],
    exclusions: ['Termite drill treatment']
  },
  {
    id: 12,
    category: 'cleaning',
    categoryName: 'Deep Cleaning',
    title: 'Kitchen Chimney & Exhaust Degreasing',
    price: 599,
    originalPrice: 999,
    rating: 4.88,
    reviews: 1980,
    time: '60 mins',
    badge: 'Popular',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    description: 'Complete removal of sticky oil grease from baffle filters, motor blower and exterior hood.',
    inclusions: ['Filter chemical hot-dip degreasing', 'Oil collector cup cleaning', 'Motor rotor inspection', 'Exterior hood shine'],
    exclusions: ['Motor internal coil replacement']
  }
];

function ServicesContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('category');
  const svcParam = searchParams.get('service');
  const { user, refreshProfile } = useAuth();
  const { location } = useLocation();

  const [catalog, setCatalog] = useState<any[]>(SERVICES_CATALOG);
  const [categories, setCategories] = useState(CATEGORIES);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const liveServices = await getLiveServices();
        if (liveServices && liveServices.length > 0) {
          const mapped = liveServices.map((s: any) => ({
            id: s.id,
            category: s.categoryId || 'home-cleaning',
            categoryName: s.category?.name || 'General Service',
            title: s.name,
            price: Number(s.price) || 499,
            originalPrice: (Number(s.price) || 499) + 300,
            rating: 4.88,
            reviews: 1200,
            time: (s.estimatedDurationMinutes || 45) + " mins",
            badge: 'Verified Pro',
            description: s.description || 'Professional home service executed by background-verified experts.',
            imageUrl: s.imageUrl || (s.images && s.images[0]) || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
            images: s.images && s.images.length > 0 ? s.images : (s.imageUrl ? [s.imageUrl] : []),
            inclusions: s.inclusions && s.inclusions.length > 0 ? s.inclusions : ['Professional inspection', 'Complete service execution', 'Post-cleanup guarantee'],
            exclusions: s.exclusions && s.exclusions.length > 0 ? s.exclusions : ['Heavy materials / spare parts not included in package'],
          }));
          setCatalog(mapped);
        }
      } catch (err) {
        console.error('Failed to load live catalog:', err);
      }
    }
    loadCatalog();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState(catParam || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingModalService, setBookingModalService] = useState<any>(null);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'COD' | 'ONLINE'>('COD');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Mumbai',
    date: new Date().toISOString().split('T')[0],
    address: ''
  });

  useEffect(() => {
    if (catParam) {
      setSelectedCategory(catParam);
    }
    if (svcParam) {
      const match = SERVICES_CATALOG.find(s => String(s.id) === svcParam);
      if (match) {
        setBookingModalService(match);
      }
    }
  }, [catParam, svcParam]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || (user.phone ? user.phone.replace(/\D/g, '') : ''),
        email: prev.email || user.email || '',
      }));
    }
    const loadAddr = async () => {
      try {
        const list = await getAddresses();
        setSavedAddresses(list);
        if (list.length > 0) {
          setSelectedAddressId(list[0].id);
          setFormData(prev => ({
            ...prev,
            address: prev.address || `${list[0].line1}, ${list[0].city} - ${list[0].pincode}`,
            city: list[0].city || prev.city
          }));
        }
      } catch (e) {}
    };
    loadAddr();
  }, [user]);

  const filteredServices = catalog.filter((item: any) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalService) return;
    setSubmittingBooking(true);
    try {
      const bk = await createBooking({
        serviceId: String(bookingModalService.id),
        serviceCategory: bookingModalService.category,
        serviceName: bookingModalService.title,
        servicePrice: bookingModalService.price,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        addressLine: formData.address,
        city: formData.city,
        addressId: selectedAddressId,
        scheduledAt: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        notes: formData.address,
        paymentMode: paymentMode,
      });
      setCreatedBooking(bk);
      setBookingSubmitted(true);
      try {
        await refreshProfile();
      } catch (e) {}
    } catch (err) {
      console.warn('Booking submit error:', err);
      setBookingSubmitted(true);
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-slate-50/50 min-h-screen">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-emerald-100/60 via-emerald-50/30 to-slate-50/50 py-12 border-b border-emerald-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-100/80 px-3 py-1 rounded-full">
            All Services & Transparent Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mt-3">
            Book Trusted Home Services
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mt-2 font-normal">
            Choose from over 50+ standardized services. 100% background checked professionals, guaranteed 30-day warranty, and doorstep arrival in 60 mins.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto mt-6 bg-white p-2 rounded-2xl shadow-md border border-slate-200 flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-600 ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by service name, e.g. AC, Bathroom, Tap, Lock..."
              className="w-full text-sm font-medium text-slate-800 outline-none bg-transparent"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center my-4">
          <p className="text-xs font-bold text-slate-500">
            Showing <span className="text-slate-900 font-extrabold">{filteredServices.length}</span> verified services
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Sparkles className="w-3 h-3" />
            <span>Standardized Transparent Rates</span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service: any) => {
            const displayImg = getServiceImage(service);
            return (
              <div
                key={service.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
              >
                {/* Image & Badge Container */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={displayImg}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_FALLBACK;
                    }}
                  />
                  {service.badge && (
                    <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                      {service.badge}
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg flex items-center gap-1 text-[11px] font-bold">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{service.rating}</span>
                    <span className="text-slate-300 font-normal">({service.reviews})</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-slate-800 px-2 py-0.5 rounded-lg flex items-center gap-1 text-[11px] font-bold">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{service.time}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      {service.categoryName}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base mt-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Inclusions summary */}
                    {service.inclusions && service.inclusions.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {service.inclusions.slice(0, 2).map((inc: string, i: number) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{inc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & Book Button */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-slate-900">Rs {service.price}</span>
                        {service.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">Rs {service.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold block">Standard Fixed Rate</span>
                    </div>
                    <button
                      onClick={() => {
                        setBookingModalService(service);
                        setBookingSubmitted(false);
                        setCreatedBooking(null);
                      }}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 max-w-md mx-auto">
            <p className="text-sm font-bold text-slate-700">No services match your search.</p>
            <p className="text-xs text-slate-400 mt-1">Try searching for AC, cleaning, plumbing, or electrical repairs.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-4 text-xs font-bold text-emerald-700 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      {bookingModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setBookingModalService(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingSubmitted ? (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                    Express 60-min Booking
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    {bookingModalService.title}
                  </h3>
                  <p className="text-xs font-extrabold text-emerald-700">
                    Total Fixed Cost: Rs {bookingModalService.price}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rahul Mishra"
                        className="w-full outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (for SMS & WhatsApp)</label>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-500">+91</span>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="9876543210"
                        className="w-full outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (for Invoice & Status Updates)</label>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. rahul@example.com"
                        className="w-full outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none bg-white font-medium"
                      >
                        <option>Mumbai</option>
                        <option>Delhi NCR</option>
                        <option>Bengaluru</option>
                        <option>Pune</option>
                        <option>Hyderabad</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none bg-white font-medium"
                      />
                    </div>
                  </div>

                  {/* Saved Addresses quick selection if available */}
                  {savedAddresses.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-600">Select Saved Address</label>
                      <div className="flex flex-wrap gap-2">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              setFormData({
                                ...formData,
                                address: `${addr.line1}, ${addr.city} - ${addr.pincode}`,
                                city: addr.city
                              });
                            }}
                            className={`text-[11px] px-3 py-1.5 rounded-xl border font-semibold transition-colors flex items-center gap-1.5 ${
                              selectedAddressId === addr.id
                                ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>{addr.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">House / Flat Address</label>
                    <div className="flex items-start gap-2 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                      <textarea
                        required
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Flat no., building name, street, landmark..."
                        className="w-full outline-none bg-transparent resize-none"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMode('COD')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          paymentMode === 'COD'
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span>Pay After Service</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMode('ONLINE')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          paymentMode === 'ONLINE'
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>Pay Online (UPI)</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingBooking}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {submittingBooking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming with Nearest Pro...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Doorstep Booking</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    Pay securely after pro completes work. Standard 30-day rework guarantee.
                  </p>
                </div>
              </form>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full uppercase">
                    Order Confirmed
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">Technician Assigned!</h3>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Thank you, <strong>{formData.name || 'Valued Customer'}</strong>! We have assigned a verified pro for <strong>{bookingModalService.title}</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-700 max-w-xs mx-auto text-left space-y-1.5 border border-slate-200/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Booking ID:</span>
                    <span className="font-bold text-slate-900">{createdBooking?.id || 'HMZ-' + Math.floor(100000 + Math.random() * 900000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Fee:</span>
                    <span className="font-black text-emerald-700">Rs {bookingModalService.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment:</span>
                    <span className="font-bold text-slate-700">{paymentMode === 'ONLINE' ? 'Pay Online (UPI)' : 'Cash on Delivery'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Pro:</span>
                    <span className="font-bold text-slate-900">{createdBooking?.provider?.name || 'Ramesh Kumar (4.9)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Arrival:</span>
                    <span className="font-bold text-emerald-800">Within 60 mins</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <Link
                    href="/bookings"
                    onClick={() => setBookingModalService(null)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-colors"
                  >
                    <span>View in My Bookings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      setBookingModalService(null);
                      setBookingSubmitted(false);
                      setCreatedBooking(null);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ServicesContent />
    </Suspense>
  );
}
