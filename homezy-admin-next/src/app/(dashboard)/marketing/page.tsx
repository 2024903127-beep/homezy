'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tag, Image as ImageIcon, Plus, Trash2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { Coupon, Banner } from '@/types/models';

export default function MarketingPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'coupons' | 'banners'>('coupons');
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercent, setDiscountPercent] = useState('20');
  const [saving, setSaving] = useState(false);

  const { data: coupons } = useQuery<Coupon[]>({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/coupons');
      return data;
    },
  });

  const { data: banners } = useQuery<Banner[]>({
    queryKey: ['admin', 'banners'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/banners');
      return data;
    },
  });

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSaving(true);
    try {
      await apiClient.post('/admin/coupons', {
        code: code.trim().toUpperCase(),
        description: description.trim() || `${discountPercent}% discount on home services`,
        discountPercent: parseInt(discountPercent, 10) || 10,
        isActive: true,
      });
      toast.success(`Coupon ${code.toUpperCase()} created!`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      setShowCouponModal(false);
      setCode('');
      setDescription('');
    } catch {
      toast.error('Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Marketing & Promotions</h1>
          <p className="text-xs text-slate-500 mt-1">Manage promotional promo codes and app hero banners.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'coupons' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Promo Coupons
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'banners' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Hero Banners
          </button>
        </div>
      </div>

      {activeTab === 'coupons' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCouponModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons?.map((cp) => (
              <div key={cp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {cp.code}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{cp.discountPercent}% OFF</span>
                </div>
                <p className="text-xs text-slate-500">{cp.description}</p>
                <div className="text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>Used {cp.timesUsed} times</span>
                  <span className="text-emerald-600 font-bold">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners?.map((b) => (
            <div key={b.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-24 h-16 rounded-xl bg-slate-100 border flex items-center justify-center text-slate-400 shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-slate-900 text-xs truncate">Banner #{b.id.slice(-6)}</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{b.imageUrl}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">New Coupon</h3>
              <button onClick={() => setShowCouponModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE30"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs font-mono uppercase text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Discount (%)</label>
                <input
                  type="number"
                  required
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 30% discount on all plumbing"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 mt-2"
              >
                {saving ? 'Creating...' : 'Activate Coupon'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
