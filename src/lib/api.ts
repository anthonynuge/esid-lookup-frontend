import type { SearchResponse, LookupResponse } from "../types";

export async function searchAddresses(
  q: string,
  limit = 10,
): Promise<SearchResponse> {
  const res = await fetch(
    `/api/v1/search?q=${encodeURIComponent(q)}&limit=${limit}`,
  );
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json() as Promise<SearchResponse>;
}

export async function lookupByEsiId(esiId: string): Promise<LookupResponse> {
  const res = await fetch(`/api/v1/lookup/${encodeURIComponent(esiId)}`);
  if (!res.ok && res.status !== 404)
    throw new Error(`Lookup failed: ${res.status}`);
  return res.json() as Promise<LookupResponse>;
}
