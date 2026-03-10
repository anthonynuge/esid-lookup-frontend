import { Badge } from '@/components/ui/badge';
import type { LookupResult } from '@/types';

const matchLabels: Record<LookupResult['match_type'], { label: string; className: string }> = {
  exact: { label: 'Exact match', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
  fuzzy: { label: 'Fuzzy match', className: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  esiid: { label: 'ESI ID', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
};

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

export function EsidCard({ result }: { result: LookupResult }) {
  const match = matchLabels[result.match_type];
  const isActive = (result.status || '').toLowerCase() === 'active';

  return (
    <div className="mt-6 rounded-xl border border-white/20 bg-white/5 shadow-xl backdrop-blur-xl overflow-hidden">
      <div className="flex">
        <div className="w-1.5 shrink-0 bg-red-500" aria-hidden />
        <div className="flex-1 min-w-0">
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Electric Service Information</h2>
                <p className="text-sm text-slate-400 mt-0.5">{result.full_address}</p>
              </div>
              <Badge
                className={
                  isActive
                    ? 'bg-green-500/20 text-green-300 border-green-500/30 font-medium'
                    : match.className
                }
              >
                {isActive ? 'Active' : match.label}
              </Badge>
            </div>
          </div>
          <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem label="ESID Number" value={result.esiid} />
            <InfoItem label="Utility Provider (TDSP)" value={result.tdsp_name} />
            <InfoItem label="Service Address" value={result.full_address} />
            <InfoItem label="Premise Type" value={result.premise_type} />
            <InfoItem label="Load Zone" value={result.load_zone} />
            {result.tdsp_doe_code != null && result.tdsp_doe_code !== '' && (
              <InfoItem label="TDSP DOE Code" value={result.tdsp_doe_code} />
            )}
          </div>
          <div className="px-6 py-3 border-t border-white/10 bg-white/5">
            <p className="text-xs text-slate-500">
              Data sourced from ERCOT TDSP ESI ID Extract (Report ID 203). Last synchronized:{' '}
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
