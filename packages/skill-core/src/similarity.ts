export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export type SkillRelation = 'same' | 'related' | 'unrelated';

export interface RelationCreditResult {
  relation: SkillRelation;
  credit: number;
}

/**
 * Calculates relation credit based on similarity threshold.
 * same: >= 0.85 -> 1.0
 * related: 0.70 to 0.85 -> min(0.85, similarity)
 * unrelated: < 0.70 -> 0.0
 */
export function calculateRelationCredit(similarity: number): RelationCreditResult {
  if (similarity >= 0.85) {
    return { relation: 'same', credit: 1.0 };
  } else if (similarity >= 0.7) {
    return { relation: 'related', credit: Math.min(0.85, similarity) };
  } else {
    return { relation: 'unrelated', credit: 0.0 };
  }
}
