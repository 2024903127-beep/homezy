'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Plus, Trash2, Clock, IndianRupee, X, Image as ImageIcon, Camera } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { Service, Category } from '@/types/models';

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('60');
  const [imageUrl, setImageUrl] = useState('');
  const [photo1, setPhoto1] = useState('');
  const [photo2, setPhoto2] = useState('');
  const [photo3, setPhoto3] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['admin', 'services'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/services');
      return data;
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/categories');
      return data;
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !name.trim() || !price) return;
    setSaving(true);
    try {
      const gallery = [photo1.trim(), photo2.trim(), photo3.trim()].filter(Boolean);
      await apiClient.post('/admin/services', {
        categoryId,
        name: name.trim(),
        description: description.trim() || `Professional ${name.trim()} by verified experts.`,
        price: parseFloat(price),
        estimatedDurationMinutes: parseInt(duration, 10) || 60,
        imageUrl: imageUrl.trim() || gallery[0] || undefined,
        images: gallery.length ? gallery : undefined,
        inclusions: ['Professional Inspection', 'Service Execution', '30-Day Guarantee'],
        exclusions: ['Spare parts (billed separately)'],
      });
      toast.success('Service SKU added with showcase photos!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      setShowModal(false);
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
      setPhoto1('');
      setPhoto2('');
      setPhoto3('');
    } catch {
      toast.error('Failed to create service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await apiClient.delete(`/admin/services/${id}`);
      toast.success('Service removed');
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
    } catch {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Services Catalog & Photo Gallery</h1>
          <p className="text-xs text-slate-500 mt-1">Configure service items, customer rate cards, and 3-photo proof galleries.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service SKU</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services?.map((svc) => (
          <div key={svc.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
            {/* Service card photo */}
            {svc.imageUrl ? (
              <div className="h-36 w-full relative bg-slate-100 overflow-hidden">
                <img
                  src={svc.imageUrl}
                  alt={svc.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                  {svc.category?.name || 'Category'}
                </span>
              </div>
            ) : (
              <div className="h-20 w-full bg-emerald-50 flex items-center justify-between px-4">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-emerald-800 font-semibold shadow-sm">
                  {svc.category?.name || 'Category'}
                </span>
                <ImageIcon className="w-6 h-6 text-emerald-300" />
              </div>
            )}

            <div className="p-4 space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">{svc.name}</h3>
                <span className="text-sm font-black text-emerald-600">₹{svc.price}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{svc.description}</p>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{svc.estimatedDurationMinutes} mins</span>
              </div>

              <button
                onClick={() => handleDelete(svc.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add New Service Item & Photos</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Parent Category</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select Category...</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AC Deep Cleaning"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe service inclusions, equipment used, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="499"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Service Photos Section (3 Photos) */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3 Service Showcase Photos (URL / Cloudinary)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Photos shown in the consumer app detail slider so customers see what you provide.
                </p>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Photo 1 (Main Card & Inspection)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={photo1}
                    onChange={(e) => setPhoto1(e.target.value)}
                    className="w-full border bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Photo 2 (Process / Equipment)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={photo2}
                    onChange={(e) => setPhoto2(e.target.value)}
                    className="w-full border bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Photo 3 (Finished Result / Quality)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={photo3}
                    onChange={(e) => setPhoto3(e.target.value)}
                    className="w-full border bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 mt-2"
              >
                {saving ? 'Saving...' : 'Save & Publish Service'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
