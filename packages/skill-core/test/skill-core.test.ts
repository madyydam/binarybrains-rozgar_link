import { describe, expect, it } from 'vitest';
import {
  lookupSkillPhrase,
  computeSkillRelation,
  extractSkillsFromText,
  normalisePhrase
} from '@rozgarlink/skill-core';

describe('Skill Core Package', () => {
  it('normalises phrases cleanly', () => {
    expect(normalisePhrase('  MS Excel, (Advanced)!! ')).toBe('ms excel advanced');
  });

  it('maps aliases to canonical skills via dictionary', () => {
    const res1 = lookupSkillPhrase('spreadsheets');
    expect(res1?.skillId).toBe('ms-excel');

    const res2 = lookupSkillPhrase('solar panel fitting');
    expect(res2?.skillId).toBe('solar-pv-install');

    const res3 = lookupSkillPhrase('bijli kam');
    expect(res3?.skillId).toBe('basic-electrical');
  });

  it('computes relation credits with similarity and unconfirmed capping', () => {
    // Exact match, confirmed: credit 1.0
    const exactConfirmed = computeSkillRelation('solar-pv-install', 'solar-pv-install', true);
    expect(exactConfirmed.relationType).toBe('same');
    expect(exactConfirmed.credit).toBe(1.0);

    // Exact match, unconfirmed: capped at 0.5
    const exactUnconfirmed = computeSkillRelation('solar-pv-install', 'solar-pv-install', false);
    expect(exactUnconfirmed.credit).toBe(0.5);

    // Related match (Basic Electrical is related to Solar PV with 0.80 similarity)
    const related = computeSkillRelation('basic-electrical', 'solar-pv-install', true);
    expect(related.relationType).toBe('related');
    expect(related.credit).toBe(0.80);
    expect(related.aiAssisted).toBe(true);

    // Unrelated skills: credit 0
    const unrelated = computeSkillRelation('tally-accounting', 'welding-fabrication', true);
    expect(unrelated.relationType).toBe('none');
    expect(unrelated.credit).toBe(0);
  });

  it('extracts skills from free text resume', () => {
    const bio = 'Experienced technician with knowledge of solar rooftop installation and basic electrical maintenance in Pune.';
    const extracted = extractSkillsFromText(bio);

    expect(extracted.some((s) => s.skillId === 'solar-pv-install')).toBe(true);
    expect(extracted.some((s) => s.skillId === 'basic-electrical')).toBe(true);
  });
});
