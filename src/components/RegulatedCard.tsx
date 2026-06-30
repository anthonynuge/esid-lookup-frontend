import { Badge } from '@/components/ui/badge';
import type { RegulatedArea } from '@/lib/regulated';

/**
 * Shown when a user submits (Enter) an address that returns no competitive-market
 * match and looks like a regulated (municipal-utility / co-op) area — e.g. Austin.
 * Informational, not an error: amber accent rather than the red EsidCard accent.
 */
export function RegulatedCard({ area, query }: { area: RegulatedArea; query?: string }) {
  return (
    <div className="mt-6 rounded-xl border border-white/20 bg-white/5 shadow-xl backdrop-blur-xl overflow-hidden">
      <div className="flex">
        <div className="w-1.5 shrink-0 bg-amber-400" aria-hidden />
        <div className="flex-1 min-w-0 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {area.area} is a regulated area
              </h2>
              {query && <p className="text-sm text-slate-400 mt-0.5">{query}</p>}
            </div>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-medium whitespace-nowrap">
              Not deregulated
            </Badge>
          </div>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
            <p>
              This address appears to be served by{' '}
              <span className="font-semibold text-white">{area.provider}</span>, a municipal
              utility. {area.area} is{' '}
              <span className="text-white">not part of Texas&apos;s deregulated electricity market</span>,
              so its premises don&apos;t have a competitive ESID and won&apos;t appear in this directory.
            </p>
            <p className="text-slate-400">
              To start or manage electric service here, contact {area.provider} directly — you
              won&apos;t choose a retail electricity provider in this area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
