import React from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function DisclaimerPage() {
  return (
    <div className="flex flex-col w-full bg-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Legal & Service Disclaimer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Platform & Service Disclaimer
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Last Updated: September 10, 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Nature of Platform</h2>
            <p>
              Homezy Technologies India Private Limited operates as an aggregator and technology marketplace connecting independent, trained service professionals with consumers seeking home maintenance and wellness services.
            </p>
          </section>

          <section id="warranty" className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. 30-Day Service Warranty Terms</h2>
            <p>
              Homezy provides a standard 30-day rework warranty on eligible repair and cleaning services. This warranty applies strictly to the specific equipment, part, or area serviced by the technician as recorded on the official digital invoice.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Warranty is void if third-party technicians tamper with the serviced equipment after our pro departs.</li>
              <li>Warranty does not cover pre-existing structural defects, deep electrical grid surges, or external physical damage.</li>
              <li>Free re-inspection must be booked via our website or toll-free helpline within 30 calendar days of initial completion.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Damage Protection Guarantee</h2>
            <p>
              In the unlikely event of accidental property damage occurring during service execution, Homezy covers repair or replacement costs up to a maximum limit of Rs 10,000 per incident, subject to incident verification by our inspection team.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Third-Party Parts & Components</h2>
            <p>
              Technicians may provide replacement parts (e.g. capacitors, taps, switches, valves) upon customer consent. Manufacturer warranties for such physical hardware remain governed by respective brand manufacturers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable Indian law, Homezy shall not be liable for indirect, incidental, or consequential damages resulting from platform downtime or acts of God.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
