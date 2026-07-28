/**
 * Normalizes text for Azerbaijani character-agnostic search matching
 * e.g., "yağı" -> "yagi", "əzmə" -> "ezme", "Çərəz" -> "cerez"
 */
export function normalizeAzText(text: string): string {
  if (!text) return '';
  return text
    .replace(/İ/g, 'i')
    .replace(/Ə/g, 'e')
    .replace(/Ö/g, 'o')
    .replace(/Ü/g, 'u')
    .replace(/Ğ/g, 'g')
    .replace(/Ş/g, 's')
    .replace(/Ç/g, 'c')
    .toLowerCase()
    .replace(/\u0307/g, '') // remove combining dot
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .trim();
}

/**
 * Checks if candidate text matches query with Azerbaijani normalization
 */
export function matchesQuery(candidate: string, query: string): boolean {
  if (!query.trim()) return true;
  const normCandidate = normalizeAzText(candidate);
  const normQuery = normalizeAzText(query);
  return normCandidate.includes(normQuery);
}
