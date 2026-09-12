'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Phone, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { requestOtp, verifyOtp } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/bookings');
    }
  }, [isAuthenticated, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      await requestOtp(cleanPhone);
      setStep('OTP');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (otp.trim().length < 4) {
      setErrorMsg('Please enter the OTP sent to your phone.');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(phone.replace(/\D/g, ''), otp.trim());
      login(res.token, res.user);
      router.push('/bookings');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 p-2.5 flex items-center justify-center shadow-xs">
            <Image src="/logo.png" alt="Homezy" width={40} height={40} className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-4">
            {step === 'PHONE' ? 'Sign In to Homezy' : 'Verify One-Time Password'}
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            {step === 'PHONE'
              ? 'Enter your mobile number to view bookings and manage your home.'
              : `Enter the 6-digit code sent to +91 ${phone}`
            }
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mobile Number
              </label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus-within:border-emerald-600 transition-colors">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-slate-600">+91</span>
                <input
                  type="tel"
                  required
                  autoFocus
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full outline-none bg-transparent font-semibold tracking-wider text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Standard SMS rates apply. 100% secure.</span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Security OTP Code
              </label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus-within:border-emerald-600 transition-colors">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full outline-none bg-transparent font-bold tracking-widest text-center text-slate-900 text-base"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                Demo code: <strong>123456</strong> or code received via SMS
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Confirm & Enter</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Change mobile number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}