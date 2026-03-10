import type { SearchResponse, LookupResponse } from "../types";

export async function searchAddresses(
  q: string,
  limit = 10,
  zip?: string,
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  if (zip) params.set('zip', zip);
  const res = await fetch(`/api/v1/search?${params}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json() as Promise<SearchResponse>;
}

export async function lookupByEsiId(esiId: string): Promise<LookupResponse> {
  const res = await fetch(`/api/v1/lookup/${encodeURIComponent(esiId)}`);
  if (!res.ok && res.status !== 404)
    throw new Error(`Lookup failed: ${res.status}`);
  return res.json() as Promise<LookupResponse>;
}
