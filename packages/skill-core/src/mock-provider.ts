import { z } from 'zod';
import { normalisePhrase } from './normalise.js';

export interface SkillRef {
  id: string;
  canonicalName: string;
}

export const LlmSkillMatchSchema = z.object({
  phrase: z.string(),
  matches: z.array(
    z.object({
      skillId: z.string(),
      relation: z.enum(['same', 'related', 'unrelated']),
      confidence: z.number().min(0).max(1),
      reason: z.string()
    })
  )
});
export type LlmSkillMatch = z.infer<typeof LlmSkillMatchSchema>;

export interface ExtractedSkill {
  skillId: string;
  relation: 'same' | 'related' | 'unrelated';
  confidence: number;
  reason: string;
  canonicalName?: string;
}

export interface AiProvider {
  extractSkills(text: string, shortlist: SkillRef[]): Promise<ExtractedSkill[]>;
  embed(phrases: string[]): Promise<number[][]>;
}

/**
 * Deterministic hash-based mock embedding generator (128 dimensions).
 * Yields identical unit vectors for identical phrases.
 */
export function generateDeterministicEmbedding(phrase: string, dims = 128): number[] {
  const norm = normalisePhrase(phrase);
  const vec = new Array(dims).fill(0);

  for (let i = 0; i < norm.length; i++) {
    const charCode = norm.charCodeAt(i);
    const pos = (charCode * (i + 1)) % dims;
    vec[pos] += 1 / (1 + (i % 5));
  }

  // Normalise to unit length
  let sumSq = 0;
  for (let i = 0; i < dims; i++) sumSq += vec[i] * vec[i];
  const len = Math.sqrt(sumSq) || 1;

  return vec.map((v) => v / len);
}

/**
 * Deterministic Mock AI Provider.
 * Allows complete offline execution and testing with zero external API dependencies.
 */
export class DeterministicMockAiProvider implements AiProvider {
  async embed(phrases: string[]): Promise<number[][]> {
    return phrases.map((p) => generateDeterministicEmbedding(p));
  }

  async extractSkills(text: string, shortlist: SkillRef[]): Promise<ExtractedSkill[]> {
    const normText = normalisePhrase(text);
    const results: ExtractedSkill[] = [];

    // Semantic keyword mapping rules for demo scenarios
    const keywordMap: Record<string, { skillId: string; relation: 'same' | 'related'; confidence: number; reason: string }> = {
      'tally': { skillId: 'SK-ACCOUNTING-SW', relation: 'same', confidence: 1.0, reason: 'Tally is a standard accounting software' },
      'gst': { skillId: 'SK-TAX-FILING', relation: 'same', confidence: 1.0, reason: 'GST filing corresponds to tax filing' },
      'excel': { skillId: 'SK-SPREADSHEET', relation: 'same', confidence: 1.0, reason: 'Excel is a spreadsheet tool' },
      'power points': { skillId: 'SK-ELEC-WIRING', relation: 'related', confidence: 0.85, reason: 'Domestic power points overlap with electrical wiring' },
      'stitching': { skillId: 'SK-TAILORING', relation: 'same', confidence: 1.0, reason: 'Stitching directly corresponds to tailoring' },
      'wiring': { skillId: 'SK-ELEC-WIRING', relation: 'same', confidence: 1.0, reason: 'Wiring is electrical wiring' },
      'panel': { skillId: 'SK-PANEL-FIT', relation: 'same', confidence: 0.95, reason: 'Panel fitting' },
      'mcb': { skillId: 'SK-ELEC-WIRING', relation: 'related', confidence: 0.85, reason: 'MCB installation is part of electrical wiring' },
      'cnc': { skillId: 'SK-CNC-BASICS', relation: 'same', confidence: 0.95, reason: 'CNC machine operation' }
    };

    for (const [kw, match] of Object.entries(keywordMap)) {
      if (normText.includes(kw)) {
        const canonical = shortlist.find((s) => s.id === match.skillId);
        results.push({
          skillId: match.skillId,
          relation: match.relation,
          confidence: match.confidence,
          reason: match.reason,
          canonicalName: canonical?.canonicalName
        });
      }
    }

    // Also match any direct shortlist names
    for (const item of shortlist) {
      const normCanonical = normalisePhrase(item.canonicalName);
      if (normText.includes(normCanonical) && !results.some((r) => r.skillId === item.id)) {
        results.push({
          skillId: item.id,
          relation: 'same',
          confidence: 0.95,
          reason: `Exact mention of ${item.canonicalName}`,
          canonicalName: item.canonicalName
        });
      }
    }

    return results;
  }
}
