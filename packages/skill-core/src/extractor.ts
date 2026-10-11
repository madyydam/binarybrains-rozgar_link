import { normalisePhrase } from './normalise.js';
import { CANONICAL_SKILLS } from './taxonomy.js';

export interface ExtractedSkill {
  skillId: string;
  name: string;
  category: string;
  matchedSnippet: string;
  confidence: number;
}

/**
 * Extracts skills from free text (resume, bio, or description).
 * Returns suggested canonical skills for candidate confirmation.
 */
export function extractSkillsFromText(text: string): ExtractedSkill[] {
  if (!text) return [];

  const normText = normalisePhrase(text);
  const found = new Map<string, ExtractedSkill>();

  for (const skill of CANONICAL_SKILLS) {
    // 1. Check skill canonical name
    const normName = normalisePhrase(skill.name);
    if (normText.includes(normName)) {
      found.set(skill.id, {
        skillId: skill.id,
        name: skill.name,
        category: skill.category,
        matchedSnippet: skill.name,
        confidence: 0.95
      });
      continue;
    }

    // 2. Check aliases
    for (const alias of skill.aliases) {
      const normAlias = normalisePhrase(alias);
      if (normAlias.length > 3 && normText.includes(normAlias)) {
        found.set(skill.id, {
          skillId: skill.id,
          name: skill.name,
          category: skill.category,
          matchedSnippet: alias,
          confidence: 0.90
        });
        break;
      }
    }
  }

  return Array.from(found.values());
}
