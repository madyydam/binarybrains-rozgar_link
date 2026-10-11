import { normalisePhrase } from './normalise.js';
import { CANONICAL_SKILLS, SkillDefinition } from './taxonomy.js';

export interface SkillMatchResult {
  skillId: string;
  name: string;
  category: string;
  confidence: number;
  matchType: 'exact_name' | 'exact_alias' | 'substring' | 'fuzzy';
}

export interface SkillRelationCredit {
  targetSkillId: string;
  candidateSkillId: string;
  relationType: 'same' | 'related' | 'none';
  similarity: number;
  credit: number;
  aiAssisted: boolean;
}

// Build index of normalized aliases & names -> skill
const phraseIndex = new Map<string, SkillDefinition>();

for (const skill of CANONICAL_SKILLS) {
  phraseIndex.set(normalisePhrase(skill.id), skill);
  phraseIndex.set(normalisePhrase(skill.name), skill);
  for (const alias of skill.aliases) {
    phraseIndex.set(normalisePhrase(alias), skill);
  }
}

/**
 * Maps a candidate phrase or tag to the canonical skill in taxonomy.
 */
export function lookupSkillPhrase(phrase: string): SkillMatchResult | null {
  const norm = normalisePhrase(phrase);
  if (!norm) return null;

  // 1. Direct dictionary match
  const exact = phraseIndex.get(norm);
  if (exact) {
    const isName = normalisePhrase(exact.name) === norm || normalisePhrase(exact.id) === norm;
    return {
      skillId: exact.id,
      name: exact.name,
      category: exact.category,
      confidence: 1.0,
      matchType: isName ? 'exact_name' : 'exact_alias'
    };
  }

  // 2. Substring match
  for (const skill of CANONICAL_SKILLS) {
    for (const alias of skill.aliases) {
      const aliasNorm = normalisePhrase(alias);
      if (norm.includes(aliasNorm) || aliasNorm.includes(norm)) {
        return {
          skillId: skill.id,
          name: skill.name,
          category: skill.category,
          confidence: 0.88,
          matchType: 'substring'
        };
      }
    }
  }

  return null;
}

/**
 * Computes relation credit between candidate skill and opportunity required skill.
 */
export function computeSkillRelation(
  candidateSkillId: string,
  targetSkillId: string,
  confirmed: boolean = true
): SkillRelationCredit {
  if (candidateSkillId === targetSkillId) {
    let credit = 1.0;
    if (!confirmed) {
      credit = Math.min(credit, 0.5);
    }
    return {
      targetSkillId,
      candidateSkillId,
      relationType: 'same',
      similarity: 1.0,
      credit,
      aiAssisted: false
    };
  }

  const candSkillDef = CANONICAL_SKILLS.find((s) => s.id === candidateSkillId);
  const targetSkillDef = CANONICAL_SKILLS.find((s) => s.id === targetSkillId);

  let similarity = 0;
  if (candSkillDef) {
    const rel = candSkillDef.relatedSkillIds.find((r) => r.id === targetSkillId);
    if (rel) {
      similarity = rel.similarity;
    }
  }
  if (!similarity && targetSkillDef) {
    const rel = targetSkillDef.relatedSkillIds.find((r) => r.id === candidateSkillId);
    if (rel) {
      similarity = rel.similarity;
    }
  }

  if (similarity >= 0.85) {
    let credit = 1.0;
    if (!confirmed) credit = Math.min(credit, 0.5);
    return {
      targetSkillId,
      candidateSkillId,
      relationType: 'same',
      similarity,
      credit,
      aiAssisted: true
    };
  }

  if (similarity >= 0.70) {
    let credit = Math.min(0.85, similarity);
    if (!confirmed) credit = Math.min(credit, 0.5);
    return {
      targetSkillId,
      candidateSkillId,
      relationType: 'related',
      similarity,
      credit,
      aiAssisted: true
    };
  }

  return {
    targetSkillId,
    candidateSkillId,
    relationType: 'none',
    similarity: 0,
    credit: 0,
    aiAssisted: false
  };
}
