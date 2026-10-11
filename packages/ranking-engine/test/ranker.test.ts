import { describe, expect, it } from 'vitest';
import { scoreEligibleOpportunity, DEFAULT_WEIGHTS } from '../src/ranker.js';
import { CandidatePreferences, CandidateSkillCredit, EligibleOpportunity, OpportunitySkill } from '@rozgarlink/shared-types';

describe('Ranking Engine', () => {
  const dummyOpp: EligibleOpportunity = {
    id: 'opp-1',
    title: 'Solar Installation Technician',
    state: 'Maharashtra',
    district: 'Pune',
    status: 'open',
    closesOn: '2026-12-31',
    preferenceAttrs: {
      pay: { min: 15000, max: 25000 },
      shift: 'day',
      workType: 'full-time'
    },
    rulesVersion: 1
  };

  const oppSkills: OpportunitySkill[] = [
    { skillId: 'solar-pv-install', importance: 'required', minProficiency: 3 },
    { skillId: 'basic-electrical', importance: 'required', minProficiency: 2 },
    { skillId: 'safety-compliance', importance: 'preferred', minProficiency: 2 }
  ];

  it('ranks higher with exact skills vs related skills', () => {
    const prefs: CandidatePreferences = {
      commuteKm: 25,
      expectedPayMin: 18000,
      shift: 'day',
      workType: 'full-time'
    };

    // Candidate 1: Exact matches
    const cand1Skills: CandidateSkillCredit[] = [
      { skillId: 'solar-pv-install', credit: 1.0, relationType: 'same', confirmed: true, candidateProficiency: 4 },
      { skillId: 'basic-electrical', credit: 1.0, relationType: 'same', confirmed: true, candidateProficiency: 3 },
      { skillId: 'safety-compliance', credit: 1.0, relationType: 'same', confirmed: true, candidateProficiency: 2 }
    ];

    // Candidate 2: Partial matches
    const cand2Skills: CandidateSkillCredit[] = [
      { skillId: 'solar-pv-install', credit: 0.75, relationType: 'related', confirmed: true, candidateProficiency: 2 },
      { skillId: 'basic-electrical', credit: 0.70, relationType: 'related', confirmed: true, candidateProficiency: 2 },
      { skillId: 'safety-compliance', credit: 0.0, relationType: 'none', confirmed: true, candidateProficiency: 0 }
    ];

    const res1 = scoreEligibleOpportunity(dummyOpp, cand1Skills, prefs, 'Pune', oppSkills);
    const res2 = scoreEligibleOpportunity(dummyOpp, cand2Skills, prefs, 'Pune', oppSkills);

    expect(res1.score).toBeGreaterThan(res2.score);
    expect(res1.components.skillFit).toBe(1.0);
    expect(res2.components.skillFit).toBeLessThan(0.8);
  });

  it('caps unconfirmed AI skills at 0.5', () => {
    const prefs: CandidatePreferences = {};
    const unconfirmedSkills: CandidateSkillCredit[] = [
      { skillId: 'solar-pv-install', credit: 1.0, relationType: 'same', confirmed: false, candidateProficiency: 3 },
      { skillId: 'basic-electrical', credit: 1.0, relationType: 'same', confirmed: false, candidateProficiency: 3 }
    ];

    const res = scoreEligibleOpportunity(dummyOpp, unconfirmedSkills, prefs, 'Pune', oppSkills);
    // Even though credit was 1.0, unconfirmed cap is 0.5
    expect(res.components.skillFit).toBeLessThanOrEqual(0.5);
  });

  it('applies commute distance falloff correctly', () => {
    const prefs: CandidatePreferences = { commuteKm: 15 };
    const skills: CandidateSkillCredit[] = [
      { skillId: 'solar-pv-install', credit: 1.0, relationType: 'same', confirmed: true, candidateProficiency: 3 }
    ];

    // In Pune (0 km away)
    const resPune = scoreEligibleOpportunity(dummyOpp, skills, prefs, 'Pune', oppSkills);
    // In Nashik (~160 km away, far beyond 15*2 km)
    const resNashik = scoreEligibleOpportunity(dummyOpp, skills, prefs, 'Nashik', oppSkills);

    expect(resPune.components.distanceKm).toBe(0);
    expect(resPune.components.commuteFit).toBe(1.0);
    expect(resNashik.components.commuteFit).toBe(0.0);
    expect(resPune.score).toBeGreaterThan(resNashik.score);
  });
});
