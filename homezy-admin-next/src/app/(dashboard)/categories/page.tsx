"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, Trash2, Edit2, X, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { Category } from "@/types/models";
import ImageUpload from "@/components/ui/ImageUpload";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [saving, setSaving] = useState(false);

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/categories");
      return data;
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setIconUrl("");
    setDisplayOrder(String((categories?.length ?? 0) + 1));
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIconUrl(cat.iconUrl || "");
    setDisplayOrder(String(cat.displayOrder));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setName("");
    setIconUrl("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingCategory) {
        await apiClient.patch(`/admin/categories/${editingCategory.id}`, {
          name: name.trim(),
          iconUrl: iconUrl.trim() || undefined,
          displayOrder: parseInt(displayOrder, 10) || 0,
        });
        toast.success("Category updated successfully!");
      } else {
        await apiClient.post("/admin/categories", {
          name: name.trim(),
          iconUrl: iconUrl.trim() || undefined,
          displayOrder: parseInt(displayOrder, 10) || 0,
        });
        toast.success("Category created with icon!");
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      closeModal();
    } catch {
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this service category?")) return;
    try {
      await apiClient.delete(`/admin/categories/${id}`);
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Service Categories & Icons</h1>
          <p className="text-xs text-slate-500 mt-1">Configure service category icons, customer offerings, and display ordering.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : categories?.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-slate-400 gap-2">
          <Layers className="w-8 h-8 text-slate-300" />
          <p className="text-sm">No categories yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories?.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group relative">
              {/* Icon area */}
              <div className="h-24 w-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                {cat.iconUrl ? (
                  <img src={cat.iconUrl} alt={cat.name} className="w-14 h-14 object-contain" />
                ) : (
                  <Layers className="w-8 h-8 text-emerald-300" />
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-bold text-slate-900 text-xs text-center truncate">{cat.name}</h3>
                <p className="text-[10px] text-slate-400 text-center mt-0.5">Order #{cat.displayOrder}</p>
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 rounded-2xl">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-white transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 rounded-xl bg-rose-500 text-white hover:bg-rose-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCategory ? "Edit Category" : "New Service Category"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AC Maintenance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category Icon</label>
                <ImageUpload
                  value={iconUrl}
                  onChange={setIconUrl}
                  folder="categories"
                  label="Category Icon"
                  aspectRatio="square"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  <Check className="w-3.5 h-3.5" />
                  {saving ? "Saving..." : editingCategory ? "Update" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
