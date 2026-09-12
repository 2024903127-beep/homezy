'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Wrench,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Phone,
  Mail,
  Shield,
  FileText,
  X,
  Check,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { Provider, VerificationStatus } from '@/types/models';

const STATUS_CONFIG: Record<VerificationStatus, { label: string; bg: string; text: string; icon: any }> = {
  VERIFIED: { label: 'Verified Pro', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle2 },
  PENDING: { label: 'KYC Pending', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Clock },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', icon: XCircle },
  UNVERIFIED: { label: 'Unverified', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', icon: AlertCircle },
};

export default function ProvidersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [acting, setActing] = useState(false);

  const { data: providers, isLoading } = useQuery<Provider[]>({
    queryKey: ['admin', 'providers', search, statusFilter],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/providers', {
        params: {
          search: search || undefined,
          verificationStatus: statusFilter === 'ALL' ? undefined : statusFilter,
        },
      });
      return data;
    },
  });

  const handleVerify = async (id: string) => {
    setActing(true);
    try {
      await apiClient.patch(`/admin/providers/${id}/verify`);
      toast.success('Provider KYC approved and verified!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
      if (selectedProvider?.id === id) {
        setSelectedProvider((prev) => prev ? { ...prev, verificationStatus: 'VERIFIED' } : null);
      }
    } catch {
      toast.error('Failed to verify provider');
    } finally {
      setActing(false);
    }
  };

  const handleReject = async (id: string) => {
    setActing(true);
    try {
      await apiClient.patch(`/admin/providers/${id}/reject`, { reason: 'Document unclear or invalid' });
      toast.success('Provider KYC rejected');
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
      if (selectedProvider?.id === id) {
        setSelectedProvider((prev) => prev ? { ...prev, verificationStatus: 'REJECTED' } : null);
      }
    } catch {
      toast.error('Failed to reject provider');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Service Providers & KYC</h1>
          <p className="text-xs text-slate-500 mt-1">Review documents, approve trade licenses, and monitor online duty status.</p>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search provider name/phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 shadow-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="REJECTED">Rejected</option>
            <option value="UNVERIFIED">Unverified</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Professional</th>
                <th className="px-6 py-4">Assigned Skills</th>
                <th className="px-6 py-4">Live Duty</th>
                <th className="px-6 py-4">KYC Status</th>
                <th className="px-6 py-4">Documents</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading service professionals...</span>
                    </div>
                  </td>
                </tr>
              ) : providers && providers.length > 0 ? (
                providers.map((p) => {
                  const status = STATUS_CONFIG[p.verificationStatus] || STATUS_CONFIG.UNVERIFIED;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                            {p.name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{p.name || 'Unnamed Provider'}</div>
                            <div className="text-slate-400 text-[11px] font-mono mt-0.5">{p.phone}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {p.categories && p.categories.length > 0 ? (
                            p.categories.map((c) => (
                              <span key={c.id} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                                {c.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No categories assigned</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {p.isOnDuty ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Online & On-Duty
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Offline
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${status.bg} ${status.text}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-slate-600 font-semibold">{p.documents?.length || 0} Files</span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedProvider(p)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 px-2.5 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No service providers match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Inspection Drawer / Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 flex flex-col overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-black">
                  {selectedProvider.name?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedProvider.name}</h3>
                  <p className="text-xs text-slate-400">{selectedProvider.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 py-6 space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${STATUS_CONFIG[selectedProvider.verificationStatus]?.bg}`}>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-slate-700" />
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Current Verification State</div>
                    <div className="text-[11px] text-slate-600 font-medium capitalize">
                      {selectedProvider.verificationStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded KYC Documents */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Uploaded KYC Verification Files ({selectedProvider.documents?.length || 0})
                </h4>

                {selectedProvider.documents && selectedProvider.documents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedProvider.documents.map((doc, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 uppercase">{doc.type}</div>
                            <div className="text-[10px] text-slate-400">Uploaded {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recently'}</div>
                          </div>
                        </div>

                        {doc.fileUrl ? (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm"
                          >
                            View File
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No URL</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                    No documents submitted yet.
                  </div>
                )}
              </div>
            </div>

            {/* Decision Bar */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
              <button
                disabled={acting || selectedProvider.verificationStatus === 'REJECTED'}
                onClick={() => handleReject(selectedProvider.id)}
                className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <X className="w-4 h-4" />
                <span>Reject KYC</span>
              </button>

              <button
                disabled={acting || selectedProvider.verificationStatus === 'VERIFIED'}
                onClick={() => handleVerify(selectedProvider.id)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-40"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Verify</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
