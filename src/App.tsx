import { useState, useRef } from 'react';
import { AddressSearch } from './components/AddressSearch';
import { EsidCard } from './components/EsidCard';
import { lookupByEsiId } from './lib/api';
import type { LookupResult } from './types';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; result: LookupResult }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

const STATS = [
  { value: '13M+', label: 'ESID Records' },
  { value: '4', label: 'Texas TDSPs' },
  { value: '24hr', label: 'Data Refresh Cycle' },
  { value: '<100ms', label: 'Avg. Response Time' },
] as const;

export default function App() {
  const [state, setState] = useState<State>({ status: 'idle' });
  const panelRef = useRef<HTMLDivElement>(null);

  function scrollToPanel() {
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function handleSelect(esiId: string) {
    setState({ status: 'loading' });
    try {
      const res = await lookupByEsiId(esiId);
      if (res.data) {
        setState({ status: 'success', result: res.data });
      } else {
        setState({ status: 'not_found' });
      }
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />
      <section className="relative min-h-screen flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12 lg:gap-16 max-w-[1440px] mx-auto px-4">
        {/* Left: copy + stats */}
        <div className="lg:flex-1 lg:pt-8 max-w-[600px]">
          <div className="inline-flex items-center rounded-md border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white mb-8">
            Powered by ERCOT real-time data
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Find Your Texas <span className="text-red-500">Electric</span> Service Identifier
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mb-8">
            Enter your service address to instantly locate your ESID and utility provider information.
            Our system synchronizes daily with ERCOT to ensure data accuracy across all Texas service territories.
          </p>
          <div className="flex flex-wrap gap-3 mb-14">
            <button
              type="button"
              onClick={scrollToPanel}
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
            >
              Lookup My ESID
            </button>
            <button
              type="button"
              onClick={scrollToPanel}
              className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/5 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
            >
              View Architecture
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl md:text-3xl font-bold text-white">{value}</div>
                <div className="text-sm text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: glass search + results */}
        <div ref={panelRef} className="lg:w-[600px] lg:shrink-0 flex flex-col ">
          <AddressSearch onSelect={handleSelect} />
          <div className="mt-4 min-h-[320px] flex flex-col justify-start">
            {state.status === 'loading' && (
              <p className="text-sm text-slate-400 text-center py-8">Loading…</p>
            )}
            {state.status === 'not_found' && (
              <p className="text-sm text-amber-400 text-center py-8">No record found for that address.</p>
            )}
            {state.status === 'error' && (
              <p className="text-sm text-red-400 text-center py-8">{state.message}</p>
            )}
            {state.status === 'success' && <EsidCard result={state.result} />}
          </div>
        </div>
      </section>
    </div>
  );
}
