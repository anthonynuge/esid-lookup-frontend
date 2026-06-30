import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { searchAddresses } from '@/lib/api';
import { formatStreet, formatZip, formatFullAddress, parseAddressQuery } from '@/lib/utils';
import { detectRegulatedArea } from '@/lib/regulated';
import type { SearchResult } from '@/types';
import { MapPin, X } from 'lucide-react';

interface Props {
  onSelect: (esiId: string) => void;
  /** Enter pressed with no suggestion to pick (empty results) — raw query text. */
  onSubmit?: (raw: string) => void;
}

// Min street chars before searching. A ZIP scopes the query (cheap, >=2);
// un-scoped street-prefix search must be selective enough to stay fast (>=4).
const MIN_WITH_ZIP = 2;
const MIN_NO_ZIP = 4;

export function AddressSearch({ onSelect, onSubmit }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  const { street, zip } = parseAddressQuery(query);
  const minLen = zip ? MIN_WITH_ZIP : MIN_NO_ZIP;

  useEffect(() => {
    addressRef.current?.focus();
  }, []);

  const runSearch = useCallback(async (raw: string) => {
    const parsed = parseAddressQuery(raw);
    const min = parsed.zip ? MIN_WITH_ZIP : MIN_NO_ZIP;
    if (parsed.street.length < min) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await searchAddresses(parsed.street, 10, parsed.zip);
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
    if (selected) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runSearch(query), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, selected, runSearch]);

  function pick(item: SearchResult) {
    // Replace the input with the full picked address (street, city, state ZIP).
    setQuery(formatFullAddress(item));
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

  // Enter with nothing to pick: close the dropdown and hand the raw query up so the
  // app can show a regulated-area / not-found card.
  function submit() {
    setResults([]);
    setOpen(false);
    setSelected(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    onSubmit?.(query);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      // Allow Enter even when the dropdown is closed/empty so users can submit a
      // regulated-area address that returns no suggestions.
      if (street.length < minLen) return;
      e.preventDefault();
      if (activeIndex >= 0) pick(results[activeIndex]);
      else if (results.length > 0) pick(results[0]); // auto-pick top suggestion
      else submit();
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/20 bg-white/5 p-6 shadow-xl backdrop-blur-xl z-10">
      <h2 className="text-lg font-semibold text-white mb-4">Service Address</h2>
      <div className="flex flex-col gap-3 w-full">
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
              placeholder="Start typing an address (add a ZIP to narrow)…"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={open}
              className="h-11 pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus-visible:ring-white/30"
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
            Try &quot;1234 Main&quot; or include a ZIP: &quot;1234 Main 75202&quot;.
          </p>
          {(loading || open) && street.length >= minLen && (
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
                <li className="px-4 py-3 text-sm">
                  <p className="text-slate-300">
                    No match for <span className="font-medium text-white">&quot;{street}&quot;</span>
                    {zip ? ` in ${zip}` : ''}.
                  </p>
                  {(() => {
                    const reg = detectRegulatedArea(query, zip);
                    return reg ? (
                      <p className="mt-2 text-slate-400 leading-relaxed">
                        This looks like <span className="text-white">{reg.area}</span>, served by{' '}
                        <span className="text-white">{reg.provider}</span> — a regulated utility
                        outside Texas&apos;s deregulated market, so its addresses don&apos;t have a
                        competitive ESID and won&apos;t appear here.
                      </p>
                    ) : (
                      <p className="mt-2 text-slate-400 leading-relaxed">
                        If your address is served by a municipal utility or electric co-op — like{' '}
                        <span className="text-white">Austin (Austin Energy)</span> or{' '}
                        <span className="text-white">San Antonio (CPS Energy)</span> — it isn&apos;t
                        part of Texas&apos;s deregulated market and won&apos;t be listed. Otherwise,
                        check the spelling or add your ZIP.
                      </p>
                    );
                  })()}
                </li>
              ) : (
                results.map((item, i) => (
                  <li
                    key={item.esiid}
                    onMouseDown={() => pick(item)}
                    className={`cursor-pointer px-4 py-2.5 text-sm hover:bg-white/10 ${i === activeIndex ? 'bg-white/10' : ''}`}
                  >
                    <span className="font-medium text-white">{formatStreet(item.street, item.unit)}</span>
                    <span className="text-slate-400 ml-1">
                      {item.city}, {formatZip(item.zip_code)}
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
