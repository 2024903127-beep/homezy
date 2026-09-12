'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Phone, 
  Mail,
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { requestOtp, verifyOtp } from '@/lib/api';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, authSuccessCallback } = useAuth();
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

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
      await requestOtp(cleanPhone, email.trim() || undefined);
      setStep('OTP');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to send OTP. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanOtp = otp.trim();
    if (cleanOtp.length < 4) {
      setErrorMsg('Please enter the 6-digit OTP sent to your email / phone.');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(phone.replace(/\D/g, ''), cleanOtp);
      login(res.token, res.user);
      closeAuthModal();
      if (authSuccessCallback) {
        authSuccessCallback();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid OTP code. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('PHONE');
    setPhone('');
    setEmail('');
    setOtp('');
    setErrorMsg('');
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200/80 p-2 flex items-center justify-center shadow-xs">
            <Image src="/logo.png" alt="Homezy" width={32} height={32} className="object-contain" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-3">
            {step === 'PHONE' ? 'Sign In / Register' : 'Verify One-Time Password'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {step === 'PHONE' 
              ? 'Access your bookings, track pros, and download invoices.'
              : `Enter the verification code sent to +91 ${phone}`
            }
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mobile Phone Number
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address <span className="text-slate-400 font-normal">(to receive OTP on Gmail)</span>
              </label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus-within:border-emerald-600 transition-colors">
                <Mail className="w-4 h-4 text-emerald-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full outline-none bg-transparent font-normal text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-md text-xs flex items-center justify-center gap-2 transition-all mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Get Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>We never share your number or spam you.</span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                6-Digit Security OTP
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
                Please enter the 6-digit verification code sent to your email / phone.
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
                  <span>Verify & Proceed</span>
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