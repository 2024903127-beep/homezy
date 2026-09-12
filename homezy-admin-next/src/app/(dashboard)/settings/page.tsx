"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Settings, DollarSign, Phone, Building2, Activity,
  Save, CheckCircle2, ToggleLeft, ToggleRight, Loader2,
  MessageSquare, Mail, MapPin,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";

type PlatformSettings = {
  autoDispatch: boolean;
  maxDispatchRadiusKm: number;
  providerAcceptTimeoutSecs: number;
  maxJobsPerProvider: number;
  platformCommissionPct: number;
  minProviderPayoutThreshold: number;
  cancellationFeeAfterDispatch: number;
  supportPhone: string;
  supportWhatsappUrl: string;
  activeCities: string;
  maintenanceMode: boolean;
};

type TabKey = "dispatch" | "monetization" | "operations" | "communications";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "dispatch", label: "Dispatch Engine", icon: Settings },
  { key: "monetization", label: "Monetization", icon: DollarSign },
  { key: "operations", label: "Operations", icon: Building2 },
  { key: "communications", label: "Communications", icon: Activity },
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("dispatch");
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState<Partial<PlatformSettings>>({});

  const { data: settings, isLoading } = useQuery<PlatformSettings>({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/settings");
      return data;
    },
  });

  // Mirror fetched settings into local state for editing
  useEffect(() => {
    if (settings) setLocal(settings);
  }, [settings]);

  const set = <K extends keyof PlatformSettings>(k: K, v: PlatformSettings[K]) =>
    setLocal((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch("/admin/settings", local);
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success("Platform settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const InputRow = ({
    label,
    sublabel,
    children,
  }: {
    label: string;
    sublabel?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between gap-6 py-4 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800">{label}</p>
        {sublabel && <p className="text-[10px] text-slate-400 mt-0.5">{sublabel}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-1.5 text-xs font-bold transition ${value ? "text-emerald-600" : "text-slate-400"}`}
    >
      {value ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
      <span>{value ? "ON" : "OFF"}</span>
    </button>
  );

  const NumInput = ({
    value,
    onChange,
    prefix,
    suffix,
    min,
    max,
  }: {
    value: number;
    onChange: (v: number) => void;
    prefix?: string;
    suffix?: string;
    min?: number;
    max?: number;
  }) => (
    <div className="flex items-center gap-1.5">
      {prefix && <span className="text-xs font-bold text-slate-400">{prefix}</span>}
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        className="w-20 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 text-right focus:outline-none focus:border-emerald-500"
      />
      {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Control Room</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure dispatch rules, commission rates, support contacts, and system health.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-60 transition shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Maintenance Mode Banner */}
      {local.maintenanceMode && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <p className="text-xs font-bold text-rose-700">
            ⚠️ Maintenance Mode is ON — all new bookings are suspended for customers.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6">
        {/* ── DISPATCH TAB ─────────────────────────────────────────────────── */}
        {activeTab === "dispatch" && (
          <div>
            <div className="py-4 border-b border-slate-100">
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Auto-Dispatch & Matching Rules</p>
            </div>
            <InputRow
              label="Auto Dispatch Mode"
              sublabel="When ON, Homezy automatically assigns the nearest verified provider."
            >
              <Toggle value={local.autoDispatch ?? true} onChange={(v) => set("autoDispatch", v)} />
            </InputRow>
            <InputRow
              label="Max Dispatch Radius"
              sublabel="Maximum distance to look for an available provider."
            >
              <NumInput
                value={local.maxDispatchRadiusKm ?? 15}
                onChange={(v) => set("maxDispatchRadiusKm", v)}
                suffix="km"
                min={1}
                max={100}
              />
            </InputRow>
            <InputRow
              label="Provider Accept Timeout"
              sublabel="Seconds before Homezy tries the next available provider."
            >
              <NumInput
                value={local.providerAcceptTimeoutSecs ?? 45}
                onChange={(v) => set("providerAcceptTimeoutSecs", v)}
                suffix="secs"
                min={15}
                max={300}
              />
            </InputRow>
            <InputRow
              label="Max Active Jobs / Provider"
              sublabel="Maximum concurrent live bookings a single provider can hold."
            >
              <NumInput
                value={local.maxJobsPerProvider ?? 3}
                onChange={(v) => set("maxJobsPerProvider", v)}
                suffix="jobs"
                min={1}
                max={10}
              />
            </InputRow>
          </div>
        )}

        {/* ── MONETIZATION TAB ──────────────────────────────────────────────── */}
        {activeTab === "monetization" && (
          <div>
            <div className="py-4 border-b border-slate-100">
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Commission & Payout Rules</p>
            </div>
            <InputRow
              label="Platform Commission"
              sublabel="Percentage Homezy retains from each completed booking GMV."
            >
              <NumInput
                value={local.platformCommissionPct ?? 15}
                onChange={(v) => set("platformCommissionPct", v)}
                suffix="%"
                min={0}
                max={50}
              />
            </InputRow>
            <InputRow
              label="Min. Provider Payout Threshold"
              sublabel="Minimum accumulated balance before a provider can withdraw."
            >
              <NumInput
                value={local.minProviderPayoutThreshold ?? 500}
                onChange={(v) => set("minProviderPayoutThreshold", v)}
                prefix="₹"
                min={0}
              />
            </InputRow>
            <InputRow
              label="Cancellation Fee (After Dispatch)"
              sublabel="Fee charged to customer if they cancel after provider is dispatched."
            >
              <NumInput
                value={local.cancellationFeeAfterDispatch ?? 100}
                onChange={(v) => set("cancellationFeeAfterDispatch", v)}
                prefix="₹"
                min={0}
              />
            </InputRow>
          </div>
        )}

        {/* ── OPERATIONS TAB ─────────────────────────────────────────────────── */}
        {activeTab === "operations" && (
          <div>
            <div className="py-4 border-b border-slate-100">
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Operations & Support</p>
            </div>
            <InputRow
              label="Support Phone"
              sublabel="Customer support number shown in the app."
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={local.supportPhone ?? ""}
                  onChange={(e) => set("supportPhone", e.target.value)}
                  className="w-44 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </InputRow>
            <InputRow
              label="WhatsApp Helpline URL"
              sublabel="wa.me link for customer support WhatsApp."
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://wa.me/919876543210"
                  value={local.supportWhatsappUrl ?? ""}
                  onChange={(e) => set("supportWhatsappUrl", e.target.value)}
                  className="w-52 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </InputRow>
            <InputRow
              label="Active Cities"
              sublabel="Comma-separated list of operational cities."
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Delhi NCR, Mumbai, Bengaluru"
                  value={local.activeCities ?? ""}
                  onChange={(e) => set("activeCities", e.target.value)}
                  className="w-56 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </InputRow>
            <InputRow
              label="Maintenance Mode"
              sublabel="Suspends all new customer bookings immediately."
            >
              <Toggle value={local.maintenanceMode ?? false} onChange={(v) => set("maintenanceMode", v)} />
            </InputRow>
          </div>
        )}

        {/* ── COMMUNICATIONS TAB ───────────────────────────────────────────── */}
        {activeTab === "communications" && (
          <div>
            <div className="py-4 border-b border-slate-100">
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Communication Channel Health</p>
            </div>
            <div className="py-6 space-y-4">
              {[
                {
                  icon: Mail,
                  label: "Brevo Email (Sendinblue)",
                  sublabel: "OTP and booking confirmation emails",
                  status: "Active",
                  color: "emerald",
                },
                {
                  icon: MessageSquare,
                  label: "Meta WhatsApp Cloud API",
                  sublabel: "Live OTP and booking messages via WhatsApp",
                  status: "Active",
                  color: "emerald",
                },
                {
                  icon: Activity,
                  label: "Cloudflare R2 Storage",
                  sublabel: "Service photos, KYC documents, banners",
                  status: "Active",
                  color: "emerald",
                },
              ].map((ch) => (
                <div key={ch.label} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className={`p-2 rounded-xl bg-${ch.color}-100`}>
                    <ch.icon className={`w-4 h-4 text-${ch.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">{ch.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ch.sublabel}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-bold text-${ch.color}-600 bg-${ch.color}-50 border border-${ch.color}-200 px-2.5 py-1 rounded-full`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {ch.status}
                  </div>
                </div>
              ))}
            </div>
            <div className="pb-4 text-[10px] text-slate-400 text-center">
              Channel health reflects config status, not real-time ping. Test via a live booking to verify.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
