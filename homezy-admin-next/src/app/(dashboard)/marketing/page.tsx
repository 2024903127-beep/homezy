"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tag, Image as ImageIcon, Plus, Trash2, X, Check, ToggleLeft, ToggleRight, Percent, Calendar } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { Coupon, Banner } from "@/types/models";
import ImageUpload from "@/components/ui/ImageUpload";

export default function MarketingPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"coupons" | "banners">("coupons");

  // Coupon form
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercent, setDiscountPercent] = useState("20");
  const [savingCoupon, setSavingCoupon] = useState(false);

  // Banner form
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerDisplayOrder, setBannerDisplayOrder] = useState("1");
  const [savingBanner, setSavingBanner] = useState(false);

  const { data: coupons } = useQuery<Coupon[]>({
    queryKey: ["admin", "coupons"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/coupons");
      return data;
    },
  });

  const { data: banners } = useQuery<Banner[]>({
    queryKey: ["admin", "banners"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/banners");
      return data;
    },
  });

  // ── Coupon handlers ──────────────────────────────────────────────────────
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSavingCoupon(true);
    try {
      await apiClient.post("/admin/coupons", {
        code: code.trim().toUpperCase(),
        description: description.trim() || `${discountPercent}% discount on home services`,
        discountPercent: parseInt(discountPercent, 10) || 10,
        isActive: true,
      });
      toast.success(`Coupon ${code.toUpperCase()} created!`);
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
      setShowCouponModal(false);
      setCode("");
      setDescription("");
    } catch {
      toast.error("Failed to create coupon");
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleToggleCoupon = async (id: string, current: boolean) => {
    try {
      await apiClient.patch(`/admin/coupons/${id}`, { isActive: !current });
      toast.success(!current ? "Coupon activated" : "Coupon deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    } catch {
      toast.error("Failed to update coupon");
    }
  };

  // ── Banner handlers ──────────────────────────────────────────────────────
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerImageUrl.trim()) {
      toast.error("Please upload a banner image first");
      return;
    }
    setSavingBanner(true);
    try {
      await apiClient.post("/admin/banners", {
        imageUrl: bannerImageUrl,
        title: bannerTitle.trim() || undefined,
        subtitle: bannerSubtitle.trim() || undefined,
        displayOrder: parseInt(bannerDisplayOrder, 10) || 1,
        isActive: true,
      });
      toast.success("Banner published to app!");
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      setShowBannerModal(false);
      setBannerImageUrl("");
      setBannerTitle("");
      setBannerSubtitle("");
    } catch {
      toast.error("Failed to create banner");
    } finally {
      setSavingBanner(false);
    }
  };

  const handleToggleBanner = async (id: string, current: boolean) => {
    try {
      await apiClient.patch(`/admin/banners/${id}`, { isActive: !current });
      toast.success(!current ? "Banner activated" : "Banner hidden");
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
    } catch {
      toast.error("Failed to update banner");
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await apiClient.delete(`/admin/banners/${id}`);
      toast.success("Banner removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
    } catch {
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Marketing & Promotions</h1>
          <p className="text-xs text-slate-500 mt-1">Manage promotional promo codes and app hero banners.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("coupons")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === "coupons" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            Promo Coupons
          </button>
          <button
            onClick={() => setActiveTab("banners")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === "banners" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            Hero Banners
          </button>
        </div>
      </div>

      {/* ── COUPONS TAB ────────────────────────────────────────────────────── */}
      {activeTab === "coupons" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCouponModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons?.map((cp) => {
              const active = cp.isActive ?? true;
              return (
                <div key={cp.id} className={`bg-white p-5 rounded-2xl border shadow-sm space-y-3 transition ${!active ? "opacity-60" : "border-slate-200"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {cp.code}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                        <Percent className="w-3 h-3" />
                        {cp.discountPercent}% OFF
                      </span>
                      <button
                        onClick={() => handleToggleCoupon(cp.id, active)}
                        className={`${active ? "text-emerald-500" : "text-slate-400"} hover:scale-110 transition`}
                      >
                        {active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{cp.description}</p>
                  <div className="text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>Used {cp.timesUsed} times</span>
                    <span className={active ? "text-emerald-600 font-bold" : "text-slate-400"}>
                      {active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── BANNERS TAB ────────────────────────────────────────────────────── */
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowBannerModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Banner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners?.length === 0 && (
              <div className="col-span-full flex flex-col items-center py-16 text-slate-400 gap-2">
                <ImageIcon className="w-8 h-8 text-slate-300" />
                <p className="text-sm">No banners yet. Upload one to show on the app home screen.</p>
              </div>
            )}
            {banners?.map((b) => {
              const active = (b as unknown as Record<string, unknown>).isActive as boolean ?? true;
              return (
                <div key={b.id} className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition ${!active ? "opacity-60" : ""}`}>
                  <div className="relative h-32 bg-slate-100">
                    {b.imageUrl ? (
                      <img src={b.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"}`}>
                        {active ? "Live" : "Hidden"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-800 truncate">
                        Banner #{b.id.slice(-6)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">{b.imageUrl}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleBanner(b.id, active)}
                        className={`p-1.5 rounded-lg transition ${active ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}
                      >
                        {active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── COUPON MODAL ───────────────────────────────────────────────────── */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">New Coupon Code</h3>
              <button onClick={() => setShowCouponModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="SUMMER30"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full border rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Discount (%)</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Summer sale discount"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCouponModal(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCoupon}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md disabled:opacity-60"
                >
                  {savingCoupon ? "Creating..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── BANNER MODAL ───────────────────────────────────────────────────── */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Upload App Hero Banner</h3>
              <button onClick={() => setShowBannerModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBanner} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Banner Image *</label>
                <ImageUpload
                  value={bannerImageUrl}
                  onChange={setBannerImageUrl}
                  folder="banners"
                  label="Banner Image"
                  aspectRatio="banner"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title (optional)</label>
                <input
                  type="text"
                  placeholder="Get 20% off on AC Service"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subtitle (optional)</label>
                <input
                  type="text"
                  placeholder="Limited time offer"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Display Order</label>
                <input
                  type="number"
                  value={bannerDisplayOrder}
                  onChange={(e) => setBannerDisplayOrder(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowBannerModal(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBanner}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md disabled:opacity-60"
                >
                  {savingBanner ? "Publishing..." : "Publish Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
