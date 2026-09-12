'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Layers, Plus, Trash2, Edit2, X, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { Category } from '@/types/models';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [saving, setSaving] = useState(false);

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/categories');
      return data;
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setIconUrl('');
    setDisplayOrder(String((categories?.length ?? 0) + 1));
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIconUrl(cat.iconUrl || '');
    setDisplayOrder(String(cat.displayOrder));
    setShowModal(true);
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
        toast.success('Category updated successfully!');
      } else {
        await apiClient.post('/admin/categories', {
          name: name.trim(),
          iconUrl: iconUrl.trim() || undefined,
          displayOrder: parseInt(displayOrder, 10) || 0,
        });
        toast.success('Category created with service icon!');
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setShowModal(false);
      setName('');
      setIconUrl('');
      setDisplayOrder('0');
      setEditingCategory(null);
    } catch {
      toast.error('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this service category?')) return;
    try {
      await apiClient.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    } catch {
      toast.error('Failed to delete category');
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((cat) => (
          <div key={cat.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-300 transition">
            <div className="flex items-center gap-3">
              {cat.iconUrl ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                  <img src={cat.iconUrl} alt={cat.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {cat.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                <span className="text-[10px] text-slate-400 font-mono">Order: #{cat.displayOrder}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => openEditModal(cat)}
                className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                title="Edit Category & Icon"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDelete(cat.id)}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCategory ? 'Edit Service Category & Icon' : 'Add Service Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water Tank Cleaning"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Service Icon / Thumbnail URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or icon link"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                {iconUrl ? (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 rounded-xl border">
                    <img src={iconUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border" />
                    <span className="text-[11px] text-emerald-600 font-semibold">Icon Preview Loaded</span>
                  </div>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Display Priority Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 mt-2"
              >
                {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Save Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
