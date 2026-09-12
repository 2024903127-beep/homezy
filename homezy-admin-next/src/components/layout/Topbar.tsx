'use client';

import React from 'react';
import { Bell, Search, RefreshCw, Shield, HelpCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Topbar() {
  const { admin } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Live System Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Gateway Connected
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">|</span>
        <span className="text-xs font-medium text-slate-500 hidden sm:inline">
          PostgreSQL 17 · NestJS v10
        </span>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.location.reload()}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className="relative">
          <button className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>
        </div>

        <div className="h-6 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Secured Session</span>
        </div>
      </div>
    </header>
  );
}
