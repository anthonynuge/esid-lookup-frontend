import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { searchAddresses } from '@/lib/api';
import type { SearchResult } from '@/types';
import { MapPin, X } from 'lucide-react';

interface Props {
  onSelect: (esiId: string) => void;
}

export function AddressSearch({ onSelect }: Props) {
  const [zip, setZip] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  const zipValid = /^\d{5}$/.test(zip);

  useEffect(() => {
    if (zipValid) addressRef.current?.focus();
  }, [zipValid]);

  useEffect(() => {
    setQuery('');
    setResults([]);
    setOpen(false);
    setLoading(false);
    setSelected(false);
  }, [zip]);

  const search = useCallback(async (q: string, z: string) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await searchAddresses(q, 10, z);
      setResults(res.data);
      setOpen(true);
      setActiveIndex(-1);
    } catch {
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!zipValid || selected) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query, zip), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, zip, zipValid, selected, search]);

  function pick(item: SearchResult) {
    setQuery(item.full_address);
    setResults([]);
    setOpen(false);
    setLoading(false);
    setSelected(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    onSelect(item.esiid);
  }

  function clearAddress() {
    setQuery('');
    setResults([]);
    setOpen(false);
    setSelected(false);
    addressRef.current?.focus();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      pick(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/20 bg-white/5 p-6 shadow-xl backdrop-blur-xl z-10">
      <h2 className="text-lg font-semibold text-white mb-4">Service Address</h2>
      <div className="flex flex-col gap-3 w-full">
        <Input
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
          placeholder="Enter ZIP code"
          autoComplete="postal-code"
          inputMode="numeric"
          maxLength={5}
          className="h-11 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus-visible:ring-white/30"
        />
        <div className="relative w-full">
          <div className="relative flex items-center">
            <MapPin className="absolute left-3 h-5 w-5 text-slate-400 pointer-events-none" />
            <Input
              ref={addressRef}
              value={query}
              onChange={(e) => {
                setSelected(false);
                setQuery(e.target.value);
              }}
              onKeyDown={handleKey}
              onBlur={() => setOpen(false)}
              placeholder={zipValid ? 'Start typing an address…' : 'Enter ZIP code first'}
              disabled={!zipValid}
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={open}
              className="h-11 pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 disabled:opacity-50 focus-visible:ring-white/30"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={clearAddress}
                className="absolute right-3 p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                aria-label="Clear"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Try: &quot;123 Main&quot;, &quot;Dallas&quot;, &quot;Oncor&quot;, or &quot;Houston&quot; to see example results
          </p>
          {(loading || open) && query.length >= 2 && (
            <ul className="absolute z-50 mt-2 w-full rounded-lg border border-white/20 bg-zinc-900 shadow-xl max-h-64 overflow-auto py-1 scrollbar-dark">
              {loading ? (
                <li className="px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Searching…
                </li>
              ) : results.length === 0 ? (
                <li className="px-4 py-3 text-sm text-slate-400">
                  No addresses found for <span className="font-medium text-white">&quot;{query}&quot;</span> in {zip}
                </li>
              ) : (
                results.map((item, i) => (
                  <li
                    key={item.esiid}
                    onMouseDown={() => pick(item)}
                    className={`cursor-pointer px-4 py-2.5 text-sm hover:bg-white/10 ${i === activeIndex ? 'bg-white/10' : ''}`}
                  >
                    <span className="font-medium text-white">{item.full_address}</span>
                    <span className="text-slate-400 ml-1">
                      {item.city}, {item.zip_code}
                    </span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
