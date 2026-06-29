export interface SearchResult {
  esiid: string;
  street: string | null;
  unit: string | null;
  city: string;
  state: string;
  zip_code: string;
  tdsp_name: string | null;
}

export interface SearchResponse {
  success: true;
  data: SearchResult[];
}

export type MatchType = 'exact' | 'fuzzy' | 'esiid';

export interface LookupResult {
  esiid: string;
  match_type: MatchType;
  similarity_score?: number | null;
  address: {
    street: string | null;
    unit: string | null;
    city: string;
    state: string;
    zip_code: string;
  };
  // null only when the row has no resolvable TDSP at all
  delivery_company: {
    duns: string | null;
    dc_code: string | null;
    name: string | null;
    region: string | null;
  } | null;
  congestion_zone: {
    load_zone: string | null;   // raw, e.g. 'LZ_HOUSTON' — strip 'LZ_' for display
    confidence: string | null;
  };
  premise: {
    status: string;
    premise_type: string | null;
    power_region: string | null;
    ams: boolean | null;
    switch_hold: boolean | null;
    county: string | null;
  };
  last_updated: string | null;
}

export interface LookupResponse {
  success: boolean;
  cached: boolean;
  timestamp: string;
  data: LookupResult | null;
}
