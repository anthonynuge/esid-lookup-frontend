import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LookupResult } from '@/types';

const matchLabels: Record<LookupResult['match_type'], { label: string; className: string }> = {
  exact: { label: 'Exact match', className: 'bg-green-100 text-green-800' },
  fuzzy: { label: 'Fuzzy match', className: 'bg-yellow-100 text-yellow-800' },
  esiid: { label: 'ESI ID', className: 'bg-blue-100 text-blue-800' },
};

interface Props {
  result: LookupResult;
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm py-1 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 mr-4">{label}</span>
      <span className="text-slate-900 font-medium text-right">{value}</span>
    </div>
  );
}

export function EsidCard({ result }: Props) {
  const match = matchLabels[result.match_type];

  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-mono text-base break-all">{result.esiid}</CardTitle>
          <Badge className={match.className}>{match.label}</Badge>
        </div>
        <p className="text-sm text-slate-600">{result.full_address}</p>
      </CardHeader>
      <CardContent>
        <Row label="Status" value={result.status} />
        <Row label="Premise Type" value={result.premise_type} />
        <Row label="Utility Provider" value={result.tdsp_name} />
        <Row label="Load Zone" value={result.load_zone} />
        {result.similarity_score != null && (
          <Row label="Similarity" value={`${(result.similarity_score * 100).toFixed(1)}%`} />
        )}
      </CardContent>
    </Card>
  );
}
