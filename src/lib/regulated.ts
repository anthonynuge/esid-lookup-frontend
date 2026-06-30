// Texas non-deregulated ("regulated") electric areas.
//
// Premises served by municipal utilities and electric co-ops opted OUT of the ERCOT
// competitive market, so they have no competitive-market ESID and will never appear
// in this directory. When a search comes back empty, that's often the real reason
// (not a typo) — this powers a helpful "you may be in a regulated area" hint.
//
// Matching is best-effort and intentionally hedged in the UI copy:
//   - city-name match (from the typed address) is the stronger signal
//   - ZIP-prefix match is a softer hint — ZIPs don't align perfectly to utility
//     service boundaries, so only the clearly municipal-dominated metros (Austin,
//     San Antonio) carry ZIP prefixes; everything else is city-name only to avoid
//     false positives in mixed/competitive areas.

export interface RegulatedArea {
  /** The utility that serves it, e.g. "Austin Energy". */
  provider: string;
  /** Human area label, e.g. "Austin". */
  area: string;
  /** Uppercase city tokens to look for in the typed address. */
  cityPatterns: string[];
  /** Leading ZIP digits strongly associated with this provider (may be empty). */
  zipPrefixes: string[];
}

// The largest/most-recognizable Texas municipal utilities. Co-ops are too numerous
// and dispersed to enumerate — the generic copy covers them.
export const REGULATED_AREAS: RegulatedArea[] = [
  { provider: 'Austin Energy', area: 'Austin', cityPatterns: ['AUSTIN'], zipPrefixes: ['787'] },
  { provider: 'CPS Energy', area: 'San Antonio', cityPatterns: ['SAN ANTONIO'], zipPrefixes: ['782'] },
  { provider: 'Brownsville Public Utilities Board', area: 'Brownsville', cityPatterns: ['BROWNSVILLE'], zipPrefixes: [] },
  { provider: 'Denton Municipal Electric', area: 'Denton', cityPatterns: ['DENTON'], zipPrefixes: [] },
  { provider: 'New Braunfels Utilities', area: 'New Braunfels', cityPatterns: ['NEW BRAUNFELS'], zipPrefixes: [] },
  { provider: 'Georgetown Utility Systems', area: 'Georgetown', cityPatterns: ['GEORGETOWN'], zipPrefixes: [] },
  { provider: 'Garland Power & Light', area: 'Garland', cityPatterns: ['GARLAND'], zipPrefixes: [] },
  { provider: 'Bryan Texas Utilities', area: 'Bryan', cityPatterns: ['BRYAN'], zipPrefixes: [] },
];

/**
 * Best-effort guess at whether an empty result is because the address sits in a
 * regulated (municipal/co-op) area. Returns the matched area, or null. City-name
 * match wins; ZIP prefix is a fallback hint.
 */
export function detectRegulatedArea(rawQuery: string, zip?: string): RegulatedArea | null {
  const q = rawQuery.toUpperCase();
  for (const a of REGULATED_AREAS) {
    if (a.cityPatterns.some((c) => q.includes(c))) return a;
  }
  if (zip) {
    for (const a of REGULATED_AREAS) {
      if (a.zipPrefixes.some((p) => zip.startsWith(p))) return a;
    }
  }
  return null;
}
