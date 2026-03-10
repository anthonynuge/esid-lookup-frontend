export interface SearchResult {
  esiid: string;
  full_address: string;
  city: string;
  state: string;
  zip_code: string;
  tdsp_name: string | null;
}

export interface SearchResponse {
  success: true;
  data: SearchResult[];
}

export interface LookupResult {
  esiid: string;
  full_address: string;
  street: string | null;
  city: string;
  state: string;
  zip_code: string;
  status: string;
  premise_type: string | null;
  tdsp_name: string | null;
  tdsp_doe_code?: string | null;
  load_zone: string | null;
  match_type: 'exact' | 'fuzzy' | 'esiid';
  similarity_score?: number | null;
}

export interface LookupResponse {
  success: boolean;
  cached: boolean;
  timestamp: string;
  data: LookupResult | null;
}
