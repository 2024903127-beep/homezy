'use client';

import React from 'react';
import { Settings, Shield, Bell, Database, Server, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('System configuration saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System & Platform Config</h1>
        <p className="text-xs text-slate-500 mt-1">Platform commission rates, automatic dispatch radius, and gateway endpoints.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
            <Settings className="w-4 h-4 text-emerald-600" />
            <span>Dispatch & Matchmaking Rules</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Dispatch Radius (km)</label>
              <input
                type="number"
                defaultValue="15"
                className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Provider Accept Timeout (secs)</label>
              <input
                type="number"
                defaultValue="45"
                className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Commission & Take Rate</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Platform Commission Fee (%)</label>
            <input
              type="number"
              defaultValue="15"
              className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition"
        >
          Save Platform Rules
        </button>
      </form>
    </div>
  );
}
