'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Search, UserX, UserCheck, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { Customer } from '@/types/models';

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ['admin', 'customers', search],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/users', { params: { search: search || undefined } });
      return data;
    },
  });

  const handleToggleStatus = async (id: string, current: boolean) => {
    try {
      await apiClient.patch(`/admin/users/${id}/status`, { isActive: !current });
      toast.success(`Customer ${!current ? 'activated' : 'suspended'}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
    } catch {
      toast.error('Failed to update customer status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registered Customers</h1>
          <p className="text-xs text-slate-500 mt-1">Consumer userbase, contact details, and account health.</p>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Phone Number</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Joined On</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading customers...</td>
              </tr>
            ) : customers && customers.length > 0 ? (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4 font-bold text-slate-900">{c.name || 'Consumer User'}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">{c.phone}</td>
                  <td className="px-6 py-4 text-slate-500">{c.email || '—'}</td>
                  <td className="px-6 py-4 text-slate-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${c.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {c.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(c.id, c.isActive)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${c.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                    >
                      {c.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
