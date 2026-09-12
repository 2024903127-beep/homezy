'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Building,
  Home,
  Save
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { useLocation } from '@/lib/locationContext';
import { Navigation } from 'lucide-react';
import { Address, getAddresses, saveAddress, deleteAddress, updateProfile } from '@/lib/api';

export default function ProfilePage() {
  const { user, isAuthenticated, openAuthModal, refreshProfile } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // New Address Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '',
    isDefault: true
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const { detectLocation, isLocating } = useLocation();

  const handleDetectProfileGPS = async () => {
    const detected = await detectLocation();
    if (detected) {
      setNewAddr(prev => ({
        ...prev,
        line1: detected.area || prev.line1,
        line2: detected.formattedAddress || prev.line2,
        city: detected.city || prev.city,
        state: detected.state || prev.state,
        pincode: detected.pincode || prev.pincode,
      }));
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch (e) {
      console.warn('Could not load addresses:', e);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [isAuthenticated]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError('');
    try {
      await updateProfile({ name, email });
      await refreshProfile();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (e: any) {
      setProfileError(e?.response?.data?.message || 'Failed to save — please sign in again and retry.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      await saveAddress(newAddr);
      setShowAddAddress(false);
      setNewAddr({
        label: 'Home',
        line1: '',
        line2: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '',
        isDefault: true
      });
      await loadAddresses();
    } catch (e) {
      alert('Could not save address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Delete this delivery address?')) return;
    try {
      await deleteAddress(id);
      await loadAddresses();
    } catch (e) {
      alert('Could not delete address.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 bg-slate-50/50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Sign in to view your profile</h2>
          <p className="text-xs text-slate-500">
            Manage your personal details, doorstep delivery addresses, and invoice contact info.
          </p>
          <button
            onClick={() => openAuthModal()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs transition-colors shadow-md"
          >
            Sign In with Mobile OTP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Account & Saved Addresses
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your customer profile and locations for 60-min express technician arrival.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                {name ? name.slice(0, 2).toUpperCase() : 'HC'}
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">{name || 'Homezy Customer'}</h2>
                <p className="text-xs text-slate-500">+91 {user?.phone}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full uppercase">
              Verified Customer
            </span>
          </div>

          {profileSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully! ✅</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <span>⚠️ {profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs">
                  <User className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Mishra"
                    className="w-full outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Saved Addresses Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Saved Delivery Addresses</h2>
              <p className="text-xs text-slate-500">Pick where you want home services dispatched.</p>
            </div>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors border border-emerald-200/80"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {/* Add Address Form */}
          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-xs font-bold text-slate-800">Add New Doorstep Address</span>
                  <button
                    type="button"
                    onClick={handleDetectProfileGPS}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-200/80 transition-colors"
                  >
                    <Navigation className={"w-3 h-3 text-emerald-600 " + (isLocating ? "animate-spin" : "")} />
                    <span>{isLocating ? "Detecting GPS..." : "Auto-Detect Current Location"}</span>
                  </button>
                <button type="button" onClick={() => setShowAddAddress(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['Home', 'Office', 'Other'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setNewAddr({ ...newAddr, label: l })}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      newAddr.label === l 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Address Line 1 (Flat, House No, Building)</label>
                <input
                  type="text"
                  required
                  value={newAddr.line1}
                  onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                  placeholder="e.g. Flat 402, Green Meadows"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Address Line 2 (Area, Landmark)</label>
                <input
                  type="text"
                  value={newAddr.line2}
                  onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })}
                  placeholder="e.g. Near Linking Road"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">City</label>
                  <select
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-medium"
                  >
                    <option>Mumbai</option>
                    <option>Delhi NCR</option>
                    <option>Bengaluru</option>
                    <option>Pune</option>
                    <option>Hyderabad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Pin Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    placeholder="400050"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingAddress}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs"
              >
                {savingAddress ? 'Saving Address...' : 'Save & Set Address'}
              </button>
            </form>
          )}

          {/* Addresses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-emerald-50/20 hover:border-emerald-200 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-slate-800 uppercase tracking-wider">
                      {addr.label === 'Office' ? <Building className="w-3.5 h-3.5 text-blue-600" /> : <Home className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{addr.label || 'Home'}</span>
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 font-medium mt-2 leading-relaxed">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ''}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
