/**
 * Normalises raw skill text:
 * - Lowercase
 * - Strip punctuation except hyphens
 * - Collapse multiple whitespaces
 * - Trim
 */
export function normalisePhrase(phrase: string): string {
  if (!phrase) return '';
  return phrase
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
