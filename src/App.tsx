import { useState } from 'react';
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

export default function App() {
  const [state, setState] = useState<State>({ status: 'idle' });

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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">ESID Lookup</h1>
        <p className="text-sm text-slate-500 mb-6">Search by address to find Electric Service Identifier details</p>

        <AddressSearch onSelect={handleSelect} />

        {state.status === 'loading' && (
          <p className="mt-4 text-sm text-slate-500 text-center">Loading…</p>
        )}
        {state.status === 'not_found' && (
          <p className="mt-4 text-sm text-amber-600 text-center">No record found for that address.</p>
        )}
        {state.status === 'error' && (
          <p className="mt-4 text-sm text-red-600 text-center">{state.message}</p>
        )}
        {state.status === 'success' && (
          <EsidCard result={state.result} />
        )}
      </div>
    </div>
  );
}
