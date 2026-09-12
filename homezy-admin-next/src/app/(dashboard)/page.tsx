'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Wrench,
  CalendarCheck,
  DollarSign,
  AlertCircle,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import apiClient from '@/lib/api';
import { DashboardSummary, BookingsTrendPoint } from '@/types/models';

export default function DashboardOverviewPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/dashboard/summary');
      return data;
    },
    refetchInterval: 15000,
  });

  const { data: trend } = useQuery<BookingsTrendPoint[]>({
    queryKey: ['dashboard', 'trend'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/dashboard/bookings-trend');
      return data;
    },
  });

  const { data: categories } = useQuery<{ category: string; bookings: number }[]>({
    queryKey: ['dashboard', 'categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/dashboard/category-breakdown');
      return data;
    },
  });

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${(summary?.totalRevenue ?? 0).toLocaleString('en-IN')}`,
      change: '+18.4% this week',
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Providers On Duty',
      value: `${summary?.activeProviders ?? 0} / ${summary?.totalProviders ?? 0}`,
      change: `${summary?.pendingVerifications ?? 0} KYC pending`,
      icon: Wrench,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      actionHref: '/providers',
      actionLabel: 'Review KYC',
    },
    {
      title: 'Ongoing Bookings',
      value: `${summary?.ongoingBookings ?? 0}`,
      change: `${summary?.completedBookings ?? 0} completed`,
      icon: CalendarCheck,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      actionHref: '/bookings',
      actionLabel: 'Live Ops',
    },
    {
      title: 'Total Customers',
      value: `${summary?.totalUsers ?? 0}`,
      change: 'Active consumer base',
      icon: Users,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-slate-900/10 border border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight">Urban-Grade Operations Command</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
              Live Realtime
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Dispatch, provider onboarding, and live consumer requests across all service zones.
          </p>
        </div>

        {summary?.pendingVerifications && summary.pendingVerifications > 0 ? (
          <Link
            href="/providers"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition self-start sm:self-auto shrink-0"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{summary.pendingVerifications} Pending Provider KYC</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        ) : null}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">{stat.change}</span>
                  {stat.actionHref && (
                    <Link
                      href={stat.actionHref}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                    >
                      {stat.actionLabel}
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings & Velocity Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">14-Day Booking Velocity</h2>
              <p className="text-xs text-slate-500">Completed and active dispatch volume over time</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Realtime Trend</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2.5} fill="url(#bookingGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Demand by Category</h2>
            <p className="text-xs text-slate-500">Service request breakdown across skills</p>
          </div>

          <div className="h-64 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
