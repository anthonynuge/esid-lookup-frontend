import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- display formatting -----------------------------------------------------
// The API returns address components (no assembled string) and the raw load
// zone code; the front end assembles/strips for display.

/** "128 BLACK WALNUT DR" or "128 BLACK WALNUT DR APT 4" */
export function formatStreet(street?: string | null, unit?: string | null): string {
  return [street, unit].filter(Boolean).join(" ");
}

/** 9-digit ZIP -> "77015-1756"; 5-digit -> "77015"; else passthrough. */
export function formatZip(zip?: string | null): string {
  const z = (zip ?? "").replace(/\D/g, "");
  if (z.length === 9) return `${z.slice(0, 5)}-${z.slice(5)}`;
  if (z.length >= 5) return z.slice(0, 5);
  return zip ?? "";
}

/** "128 BLACK WALNUT DR APT 4, HOUSTON, TX 77015-1756" */
export function formatFullAddress(a: {
  street: string | null;
  unit: string | null;
  city: string;
  state: string;
  zip_code: string;
}): string {
  const line1 = formatStreet(a.street, a.unit);
  const cityState = [a.city, `${a.state} ${formatZip(a.zip_code)}`.trim()]
    .filter(Boolean)
    .join(", ");
  return [line1, cityState].filter(Boolean).join(", ");
}

/** "LZ_HOUSTON" -> "Houston" */
export function formatLoadZone(loadZone?: string | null): string | null {
  if (!loadZone) return null;
  const bare = loadZone.replace(/^LZ_/, "");
  return bare.charAt(0).toUpperCase() + bare.slice(1).toLowerCase();
}

/**
 * Split a combined search box into a street prefix and an optional ZIP typed at
 * the end. "1234 Main St 75202" -> { street: "1234 Main St", zip: "75202" };
 * "1234 Main" -> { street: "1234 Main" }. A 5-digit (or ZIP+4) group at the end
 * is treated as the ZIP so it can scope the query instead of the street match.
 */
export function parseAddressQuery(input: string): { street: string; zip?: string } {
  const trimmed = input.trim();
  const m = trimmed.match(/\s(\d{5})(?:-\d{4})?$/);
  if (m && m.index !== undefined) {
    return { street: trimmed.slice(0, m.index).trim(), zip: m[1] };
  }
  return { street: trimmed };
}
