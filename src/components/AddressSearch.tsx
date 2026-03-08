import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { searchAddresses } from '@/lib/api';
import type { SearchResult } from '@/types';

interface Props {
  onSelect: (esiId: string) => void;
}

export function AddressSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setResults([]); setOpen(false); return; }
    try {
      const res = await searchAddresses(q);
      setResults(res.data);
      setOpen(res.data.length > 0);
      setActiveIndex(-1);
    } catch {
      setResults([]); setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, search]);

  function pick(item: SearchResult) {
    setQuery(item.full_address);
    setOpen(false);
    onSelect(item.esiid);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      pick(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="relative w-full">
      <Input
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => setOpen(false)}
        placeholder="Start typing an address…"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-64 overflow-auto">
          {results.map((item, i) => (
            <li
              key={item.esiid}
              onMouseDown={() => pick(item)}
              className={`cursor-pointer px-3 py-2 text-sm hover:bg-slate-100 ${i === activeIndex ? 'bg-slate-100' : ''}`}
            >
              <span className="font-medium">{item.full_address}</span>
              <span className="text-slate-500 ml-1">{item.city}, {item.zip_code}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
