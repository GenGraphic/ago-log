// Most products sold in the EU carry a 2-year legal guarantee.
export const DEFAULT_WARRANTY_MONTHS = 24;

/**
 * Warranty end date (yyyy-mm-dd) from the purchase date and the warranty
 * length, or null while either is incomplete.
 */
export function warrantyExpiry(
  purchaseDate?: string,
  months?: string | number,
): string | null {
  const match = purchaseDate?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const m = typeof months === "number" ? months : parseInt(months ?? "", 10);
  if (!match || !(m > 0)) return null;

  const [, y, mo, d] = match.map(Number);
  // Day 0 of the next month is the last day of the target month, so
  // 31 Jan + 1 month gives 28/29 Feb instead of rolling into March.
  const lastDay = new Date(Date.UTC(y, mo - 1 + m + 1, 0)).getUTCDate();
  const date = new Date(Date.UTC(y, mo - 1 + m, Math.min(d, lastDay)));
  return date.toISOString().slice(0, 10);
}
