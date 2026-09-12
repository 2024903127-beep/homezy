'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Heart,
  TrendingUp,
  X
} from 'lucide-react';

const JOBS = [
  {
    id: 1,
    title: 'Senior Full Stack Engineer (Next.js & Node)',
    dept: 'Engineering',
    location: 'Mumbai / Remote',
    type: 'Full Time',
    exp: '3-6 Years',
    desc: 'Architect high-throughput dispatch algorithms, real-time tracking, and consumer web applications.'
  },
  {
    id: 2,
    title: 'Product Manager - Partner Experience',
    dept: 'Product',
    location: 'Mumbai (BKC)',
    type: 'Full Time',
    exp: '4-7 Years',
    desc: 'Empower 12,000+ service partners with intuitive mobile workflows, income transparency, and daily dispatch.'
  },
  {
    id: 3,
    title: 'City Operations Manager',
    dept: 'Operations',
    location: 'Bengaluru / Delhi',
    type: 'Full Time',
    exp: '2-5 Years',
    desc: 'Scale regional fulfillment, manage partner training centers, and maintain 98%+ SLA adherence.'
  },
  {
    id: 4,
    title: 'Performance Marketing Lead',
    dept: 'Growth',
    location: 'Mumbai (BKC)',
    type: 'Full Time',
    exp: '3-5 Years',
    desc: 'Lead customer acquisition across Google, Meta, and regional digital channels with high ROAS.'
  },
  {
    id: 5,
    title: 'Quality & Service Excellence Lead',
    dept: 'Operations',
    location: 'Pune / Hyderabad',
    type: 'Full Time',
    exp: '3-6 Years',
    desc: 'Standardize service protocols, conduct pro audits, and drive our 30-day warranty guarantee.'
  }
];

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applied, setApplied] = useState(false);
  const [applicantName, setApplicantName] = useState('');

  return (
    <div className="flex flex-col w-full bg-slate-50/50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-100/60 via-emerald-50/30 to-slate-50/50 py-16 sm:py-20 border-b border-emerald-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-100/80 px-3 py-1 rounded-full">
            We Are Hiring
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mt-3 leading-tight">
            Build the Future of <br className="hidden sm:inline" />
            <span className="text-emerald-600">Home Services in India</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-3 font-normal">
            Join a fast-moving, mission-driven team dedicated to organizing the gig economy and bringing reliable craftsmanship to millions of households.
          </p>
        </div>
      </section>

      {/* Perks Grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">High Ownership & ESOPs</h3>
            <p className="text-xs text-slate-500 mt-1">Generous stock options grant so you build wealth alongside company growth.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Comprehensive Health Cover</h3>
            <p className="text-xs text-slate-500 mt-1">Full medical insurance for you and your immediate family members from Day 1.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Flexible Work Culture</h3>
            <p className="text-xs text-slate-500 mt-1">Hybrid office models, generous annual leave, and latest generation hardware.</p>
          </div>
        </div>

        {/* Job Openings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">Open Positions ({JOBS.length})</h2>
              <p className="text-xs text-slate-500">Apply directly and hear back from hiring managers in 48 hours.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Full-Time Roles
            </span>
          </div>

          <div className="space-y-4">
            {JOBS.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                      {job.dept}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{job.exp}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">{job.title}</h3>
                  <p className="text-xs text-slate-500 max-w-xl">{job.desc}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.type}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setApplied(false);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors self-start md:self-center"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {!applied ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setApplied(true);
                }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">
                    {selectedJob.dept}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    Apply: {selectedJob.title}
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g. Anita Rao"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="anita@example.com"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">LinkedIn Profile or Portfolio URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://linkedin.com/in/..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Years of Experience</label>
                    <select className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none bg-white">
                      <option>1-2 years</option>
                      <option>3-5 years</option>
                      <option>5+ years</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md text-xs transition-colors"
                >
                  Submit Application
                </button>
              </form>
            ) : (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-slate-900">Application Submitted!</h3>
                <p className="text-xs text-slate-600">
                  Thank you, <strong>{applicantName || 'Applicant'}</strong>! Our recruiting team will review your profile and reach out within 2 business days.
                </p>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="bg-emerald-600 text-white font-bold px-6 py-2 rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
