"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles, Plus, Trash2, Clock, IndianRupee, X, Search, Edit2,
  ToggleLeft, ToggleRight, Camera,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { Service, Category } from "@/types/models";
import ImageUpload from "@/components/ui/ImageUpload";

// ── FORM STATE HELPERS ──────────────────────────────────────────────────────
const BLANK_FORM = {
  categoryId: "",
  name: "",
  description: "",
  price: "",
  duration: "60",
  imageUrl: "",
  photo1: "",
  photo2: "",
  photo3: "",
};

type FormState = typeof BLANK_FORM;

// ── COMPONENT ────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["admin", "services"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/services");
      return data;
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/categories");
      return data;
    },
  });

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!services) return [];
    return services.filter((s) => {
      const matchCat = catFilter === "all" || s.categoryId === catFilter;
      const matchSearch =
        !search.trim() ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, search, catFilter]);

  // ── Open Modals ────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingService(null);
    setForm(BLANK_FORM);
    setShowModal(true);
  };

  const openEdit = (svc: Service) => {
    setEditingService(svc);
    const imgs: string[] = (svc as unknown as Record<string, unknown>).images as string[] || [];
    setForm({
      categoryId: svc.categoryId || "",
      name: svc.name,
      description: svc.description || "",
      price: String(svc.price),
      duration: String(svc.estimatedDurationMinutes || 60),
      imageUrl: svc.imageUrl || "",
      photo1: imgs[0] || "",
      photo2: imgs[1] || "",
      photo3: imgs[2] || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setForm(BLANK_FORM);
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId || !form.name.trim() || !form.price) return;
    setSaving(true);
    try {
      const gallery = [form.photo1.trim(), form.photo2.trim(), form.photo3.trim()].filter(Boolean);
      const payload = {
        categoryId: form.categoryId,
        name: form.name.trim(),
        description: form.description.trim() || `Professional ${form.name.trim()} by verified experts.`,
        price: parseFloat(form.price),
        estimatedDurationMinutes: parseInt(form.duration, 10) || 60,
        imageUrl: form.imageUrl.trim() || gallery[0] || undefined,
        images: gallery.length ? gallery : undefined,
        inclusions: ["Professional Inspection", "Service Execution", "30-Day Guarantee"],
        exclusions: ["Spare parts (billed separately)"],
      };

      if (editingService) {
        await apiClient.patch(`/admin/services/${editingService.id}`, payload);
        toast.success("Service updated successfully!");
      } else {
        await apiClient.post("/admin/services", payload);
        toast.success("Service created and published!");
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      closeModal();
    } catch {
      toast.error("Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle Active ──────────────────────────────────────────────────────────
  const handleToggleActive = async (svc: Service) => {
    const next = !(svc.isActive ?? true);
    try {
      await apiClient.patch(`/admin/services/${svc.id}`, { isActive: next });
      toast.success(next ? "Service activated" : "Service paused");
      queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
    } catch {
      toast.error("Failed to update service status");
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service? This cannot be undone.")) return;
    try {
      await apiClient.delete(`/admin/services/${id}`);
      toast.success("Service removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
    } catch {
      toast.error("Failed to delete service");
    }
  };

  // ── Set individual form fields ────────────────────────────────────────────
  const setField = (k: keyof FormState) => (val: string) =>
    setForm((prev) => ({ ...prev, [k]: val }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Services Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure SKUs, pricing, photos and active status. Inactive services are hidden from the consumer app.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service SKU</span>
        </button>
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCatFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              catFilter === "all"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400"
            }`}
          >
            All
          </button>
          {categories?.map((c) => (
            <button
              key={c.id}
              onClick={() => setCatFilter(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                catFilter === c.id
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
          <Sparkles className="w-8 h-8 text-slate-300" />
          <p className="text-sm font-medium">No services match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((svc) => {
            const isActive = svc.isActive ?? true;
            return (
              <div
                key={svc.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col justify-between transition-opacity ${
                  !isActive ? "opacity-60 border-slate-200" : "border-slate-200"
                }`}
              >
                {/* Photo */}
                {svc.imageUrl ? (
                  <div className="h-36 w-full relative bg-slate-100 overflow-hidden">
                    <img src={svc.imageUrl} alt={svc.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                      {svc.category?.name || "Category"}
                    </span>
                    {!isActive && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                        Paused
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-20 w-full bg-emerald-50 flex items-center justify-between px-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-emerald-800 font-semibold shadow-sm">
                      {svc.category?.name || "Category"}
                    </span>
                    <Camera className="w-6 h-6 text-emerald-300" />
                  </div>
                )}

                {/* Info */}
                <div className="p-4 space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{svc.name}</h3>
                    <span className="text-sm font-black text-emerald-600">₹{svc.price}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{svc.description}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100 gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{svc.estimatedDurationMinutes} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Toggle active */}
                    <button
                      onClick={() => handleToggleActive(svc)}
                      title={isActive ? "Pause service" : "Activate service"}
                      className={`p-1.5 rounded-lg transition ${
                        isActive
                          ? "text-emerald-500 hover:bg-emerald-50"
                          : "text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      {isActive ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => openEdit(svc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(svc.id)}
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
      )}

      {/* ── ADD / EDIT MODAL ───────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
              <h3 className="font-black text-slate-900 text-base">
                {editingService ? `Edit: ${editingService.name}` : "Add New Service SKU"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <form id="service-form" onSubmit={handleSave} className="space-y-5">
                {/* Category + Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
                    <select
                      required
                      value={form.categoryId}
                      onChange={(e) => setField("categoryId")(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Select Category...</option>
                      {categories?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Service Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AC Deep Cleaning"
                      value={form.name}
                      onChange={(e) => setField("name")(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe the service, equipment used, and what customers can expect..."
                    value={form.description}
                    onChange={(e) => setField("description")(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Price + Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="499"
                      value={form.price}
                      onChange={(e) => setField("price")(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={form.duration}
                      onChange={(e) => setField("duration")(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Cover Photo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Cover Photo <span className="text-slate-400 font-normal">(shown on cards)</span>
                  </label>
                  <ImageUpload
                    value={form.imageUrl}
                    onChange={setField("imageUrl")}
                    folder="services"
                    label="Cover Photo"
                    aspectRatio="card"
                  />
                </div>

                {/* Gallery Photos */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                  <p className="text-xs font-bold text-slate-700">
                    Showcase Gallery <span className="text-slate-400 font-normal">(shown in app detail slider)</span>
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium mb-1">Photo 1 — Inspection</p>
                      <ImageUpload value={form.photo1} onChange={setField("photo1")} folder="services/gallery" aspectRatio="square" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium mb-1">Photo 2 — Process</p>
                      <ImageUpload value={form.photo2} onChange={setField("photo2")} folder="services/gallery" aspectRatio="square" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium mb-1">Photo 3 — Result</p>
                      <ImageUpload value={form.photo3} onChange={setField("photo3")} folder="services/gallery" aspectRatio="square" />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal footer */}
            <div className="border-t px-6 py-4 flex items-center justify-end gap-3 shrink-0 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="service-form"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : editingService ? "Update Service" : "Publish Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
