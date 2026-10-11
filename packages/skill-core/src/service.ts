import { normalisePhrase } from './normalise.js';

export interface SeedSkillItem {
  id: string;
  canonicalName: string;
  category: string;
  embedding?: number[];
}

export interface SeedAliasItem {
  skillId: string;
  phraseNorm: string;
  language?: string;
}

export class SkillService {
  private aiEnabled: boolean;

  constructor(options?: { aiEnabled?: boolean }) {
    this.aiEnabled = options?.aiEnabled !== false;
  }

  async resolvePhrase(
    phrase: string,
    skills: SeedSkillItem[],
    aliases: SeedAliasItem[]
  ): Promise<{ matchedSkillId?: string; credit: number; relationType: 'same' | 'related' | 'none' }> {
    const norm = normalisePhrase(phrase);
    if (!norm) return { credit: 0, relationType: 'none' };

    // 1. Check exact aliases
    for (const a of aliases) {
      if (normalisePhrase(a.phraseNorm) === norm) {
        return { matchedSkillId: a.skillId, credit: 1.0, relationType: 'same' };
      }
    }

    // 2. Check canonical names
    for (const s of skills) {
      if (normalisePhrase(s.canonicalName) === norm || normalisePhrase(s.id) === norm) {
        return { matchedSkillId: s.id, credit: 1.0, relationType: 'same' };
      }
    }

    // 3. Substring match
    for (const a of aliases) {
      const aNorm = normalisePhrase(a.phraseNorm);
      if (aNorm.length >= 3 && (norm.includes(aNorm) || aNorm.includes(norm))) {
        return { matchedSkillId: a.skillId, credit: 1.0, relationType: 'same' };
      }
    }

    return { credit: 0, relationType: 'none' };
  }

  async extractSkillsFromText(
    text: string,
    skills: SeedSkillItem[],
    aliases: SeedAliasItem[]
  ): Promise<{ skillId: string; name?: string }[]> {
    const normText = normalisePhrase(text);
    const matched = new Set<string>();

    for (const a of aliases) {
      const aNorm = normalisePhrase(a.phraseNorm);
      if (aNorm.length >= 3 && normText.includes(aNorm)) {
        matched.add(a.skillId);
      }
    }

    for (const s of skills) {
      const sNorm = normalisePhrase(s.canonicalName);
      if (sNorm.length >= 3 && normText.includes(sNorm)) {
        matched.add(s.id);
      }
    }

    return Array.from(matched).map((id) => ({ skillId: id }));
  }
}
