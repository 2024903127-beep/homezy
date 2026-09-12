'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, CreditCard, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import apiClient from '@/lib/api';
import { DashboardSummary } from '@/types/models';

export default function FinancePage() {
  const { data: summary } = useQuery<DashboardSummary>({
    queryKey: ['admin', 'dashboard', 'summary'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/dashboard/summary');
      return data;
    },
  });

  const grossGMV = summary?.totalRevenue || 0;
  const platformFee = Math.round(grossGMV * 0.15);
  const providerPayouts = grossGMV - platformFee;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Finance & Provider Settlement</h1>
        <p className="text-xs text-slate-500 mt-1">Platform commissions, customer GMV, and provider payout settlement queue.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Merchandise Value (GMV)</div>
          <div className="text-2xl font-black text-slate-900 mt-2">₹{grossGMV.toLocaleString('en-IN')}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Customer service payments</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Take (15% Commission)</div>
          <div className="text-2xl font-black text-emerald-600 mt-2">₹{platformFee.toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-500 font-medium mt-2">Retained platform net revenue</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Provider Payout Liabilities</div>
          <div className="text-2xl font-black text-blue-600 mt-2">₹{providerPayouts.toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-500 font-medium mt-2">Payable to verified pros</div>
        </div>
      </div>
    </div>
  );
}
