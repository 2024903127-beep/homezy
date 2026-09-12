'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  Phone, 
  FileText, 
  XCircle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw,
  User,
  ShieldCheck,
  Star
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { Booking, getBookingHistory, cancelBooking, getInvoiceDownloadUrl } from '@/lib/api';

export default function BookingsPage() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getBookingHistory();
      setBookings(data);
    } catch (e) {
      console.warn('Failed fetching booking history:', e);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    fetchBookings();
    // Auto-refresh every 10 seconds for real-time tracking on web
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this doorstep booking?')) return;
    setCancellingId(id);
    try {
      await cancelBooking(id);
      await fetchBookings();
    } catch (e) {
      alert('Could not cancel booking. Please contact support.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'PENDING':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: 'Order Confirmed - Dispatching Pro',
          icon: Clock
        };
      case 'REQUESTED':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          label: 'Matching Partner',
          icon: Clock
        };
      case 'ASSIGNED':
        return {
          bg: 'bg-sky-100 text-sky-800 border-sky-200',
          label: 'Pro Assigned & On The Way',
          icon: CheckCircle2
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          label: 'Service In Progress',
          icon: RefreshCw
        };
      case 'COMPLETED':
        return {
          bg: 'bg-green-100 text-green-900 border-green-200',
          label: 'Service Completed',
          icon: CheckCircle2
        };
      case 'CANCELLED':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          label: 'Booking Cancelled',
          icon: XCircle
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          label: status,
          icon: AlertCircle
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200/80 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>Customer Web Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              My Service Bookings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status, technician contact, and tax invoices synced with the mobile app.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBookings}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
              title="Refresh bookings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <span>Book New Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-emerald-950">You are viewing demo bookings</h3>
                <p className="text-[11px] text-emerald-800">Sign in with your mobile number to view and track your live account orders.</p>
              </div>
            </div>
            <button
              onClick={() => openAuthModal()}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              Sign In with OTP
            </button>
          </div>
        )}

        {/* Bookings List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-semibold">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900">No Bookings Yet</h3>
            <p className="text-xs text-slate-500">
              You haven\'t placed any service bookings yet. Experience doorstep AC cleaning, plumbing, and deep home cleaning today!
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => {
              const badge = getStatusBadge(b.status);
              const BadgeIcon = badge.icon;
              const isCompleted = b.status === 'COMPLETED';
              const isCancelled = b.status === 'CANCELLED';

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 hover:border-emerald-200 shadow-xs hover:shadow-md transition-all space-y-5"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-900">
                        Order #{b.id}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Booked on {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Main Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Left: Service Info */}
                    <div className="md:col-span-7 space-y-2">
                      <h3 className="text-base font-extrabold text-slate-900">
                        {b.service?.name || 'Verified Doorstep Service'}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {b.service?.description || 'Standard high quality service with 30-day rework warranty.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span>Slot: {new Date(b.scheduledAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span>{b.address?.city || 'Mumbai'}</span>
                        </div>
                      </div>

                      {b.address && (
                        <p className="text-[11px] text-slate-400 pt-1">
                          Address: {b.address.line1}, {b.address.line2 ? `${b.address.line2}, ` : ''}{b.address.city} - {b.address.pincode}
                        </p>
                      )}
                    </div>

                    {/* Right: Assigned Pro & Price */}
                    <div className="md:col-span-5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Total Price:</span>
                        <span className="text-base font-black text-slate-900">Rs {b.price}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200/60">
                        <span className="text-slate-500 font-semibold">Payment:</span>
                        <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.2 rounded-full text-[10px]">
                          {b.paymentMode} ({b.paymentStatus})
                        </span>
                      </div>

                      {/* Assigned Pro Card */}
                      {b.provider ? (
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Assigned Partner
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                                {b.provider.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-900">{b.provider.name}</div>
                                <div className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  <span>{b.provider.rating || 4.9}   Verified Pro</span>
                                </div>
                              </div>
                            </div>

                            <a
                              href={`tel:${b.provider.phone}`}
                              className="p-2 bg-white rounded-xl border border-slate-200 text-emerald-700 hover:bg-emerald-50 transition-colors shadow-2xs"
                              title="Call Pro"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 py-1">
                          Auto-assigning nearest verified professional in your area...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Covered under 30-day rework warranty</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Invoice Download Button */}
                      <a
                        href={getInvoiceDownloadUrl(b.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors bg-white shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>PDF Invoice</span>
                      </a>

                      {/* Cancel Button */}
                      {!isCompleted && !isCancelled && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={cancellingId === b.id}
                          className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-xs font-bold text-rose-700 transition-colors"
                        >
                          {cancellingId === b.id ? 'Cancelling...' : 'Cancel Service'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}