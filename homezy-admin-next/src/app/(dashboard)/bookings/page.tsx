'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  MapPin,
  IndianRupee,
  Phone,
  Eye,
  UserPlus, FileText,
  X,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { Booking, BookingStatus, Provider } from '@/types/models';

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'Pending Match', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  PROVIDER_ASSIGNED: { label: 'Provider Assigned', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
  PROVIDER_ARRIVED: { label: 'Pro Arrived', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-700' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
};

export default function BookingsOpsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reassigning, setReassigning] = useState(false);
  const [targetProviderId, setTargetProviderId] = useState('');

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['admin', 'bookings', search, statusFilter],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/bookings', {
        params: {
          search: search || undefined,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
        },
      });
      return data;
    },
    refetchInterval: 10000,
  });

  const { data: verifiedProviders } = useQuery<Provider[]>({
    queryKey: ['admin', 'providers', 'verified'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/providers', {
        params: { verificationStatus: 'VERIFIED' },
      });
      return data;
    },
  });

  const handleReassign = async () => {
    if (!selectedBooking || !targetProviderId) return;
    setReassigning(true);
    try {
      await apiClient.patch(`/admin/bookings/${selectedBooking.id}/reassign`, {
        providerId: targetProviderId,
      });
      toast.success('Booking successfully reassigned to provider!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      setSelectedBooking(null);
      setTargetProviderId('');
    } catch {
      toast.error('Failed to reassign provider');
    } finally {
      setReassigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Live Bookings Operations</h1>
          <p className="text-xs text-slate-500 mt-1">Realtime customer orders, dispatch queue, and manual provider assignment.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search customer phone/order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 shadow-sm"
          >
            <option value="ALL">All Order States</option>
            <option value="PENDING">Pending Dispatch</option>
            <option value="PROVIDER_ASSIGNED">Provider Assigned</option>
            <option value="IN_PROGRESS">Work in Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Service & Slot</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Assigned Pro</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Streaming bookings feed...</span>
                    </div>
                  </td>
                </tr>
              ) : bookings && bookings.length > 0 ? (
                bookings.map((b) => {
                  const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{b.service?.name || 'Service'}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {b.scheduledAt ? new Date(b.scheduledAt).toLocaleString() : 'Scheduled Soon'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{b.customer?.name || 'Customer'}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{b.customer?.phone}</div>
                      </td>

                      <td className="px-6 py-4">
                        {b.provider ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">
                              {b.provider.name?.charAt(0) || 'P'}
                            </div>
                            <span className="font-semibold text-slate-800">{b.provider.name}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                            <Clock className="w-3 h-3" />
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">?{b.price}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">{b.paymentMode} · {b.paymentStatus}</div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail & Dispatch Drawer */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Order #{selectedBooking.id.slice(-6)}</h3>
                <p className="text-xs text-slate-400">{selectedBooking.service?.name}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 py-6 space-y-6">
              {/* Status Bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Order Status</div>
                <div className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span>{STATUS_CONFIG[selectedBooking.status]?.label}</span>
                  <span className="text-emerald-600 font-bold">?{selectedBooking.price}</span>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Details</div>
                <div className="font-bold text-slate-900 text-sm">{selectedBooking.customer?.name}</div>
                <div className="text-xs text-slate-600 font-mono">{selectedBooking.customer?.phone}</div>
              </div>

              {/* Invoice Download Action */}
              <a
                href={`http://localhost:4000/v1/bookings/${selectedBooking.id}/invoice`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Download Tax Invoice (PDF)</span>
              </a>

              {/* Provider Assignment Action */}
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <UserPlus className="w-4 h-4" />
                  <span>Manual Dispatch & Reassignment</span>
                </div>

                <select
                  value={targetProviderId}
                  onChange={(e) => setTargetProviderId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Choose verified professional...</option>
                  {verifiedProviders?.map((vp) => (
                    <option key={vp.id} value={vp.id}>
                      {vp.name} ({vp.phone}) {vp.isOnDuty ? '· ON-DUTY' : ''}
                    </option>
                  ))}
                </select>

                <button
                  disabled={!targetProviderId || reassigning}
                  onClick={handleReassign}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 disabled:opacity-40"
                >
                  {reassigning ? 'Dispatching...' : 'Assign & Notify Provider'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
