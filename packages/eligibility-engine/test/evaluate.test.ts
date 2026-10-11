import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  calculateExactAge,
  evaluateOpportunity,
  evaluateRule
} from '../src/evaluate.js';
import { CandidateFacts, Rule } from '../src/types.js';

describe('Eligibility Engine - Unit Tests', () => {
  it('calculates exact age with birthday boundary correctly', () => {
    // 2000-05-15 vs 2025-05-14 -> 24 years (one day before birthday)
    expect(calculateExactAge('2000-05-15', '2025-05-14')).toBe(24);
    // 2000-05-15 vs 2025-05-15 -> 25 years (exact birthday)
    expect(calculateExactAge('2000-05-15', '2025-05-15')).toBe(25);
    // 2000-05-15 vs 2025-05-16 -> 25 years (day after birthday)
    expect(calculateExactAge('2000-05-15', '2025-05-16')).toBe(25);
  });

  it('QUAL_MIN_LEVEL: passes when candidate has ordinal >= required', () => {
    const rule: Rule = {
      id: 'r-qual-1',
      type: 'QUAL_MIN_LEVEL',
      operator: 'gte',
      value: 5, // Diploma
      label: 'Requires at least a Diploma',
      requiresVerification: false,
      version: 1
    };

    const factsDiploma: CandidateFacts = {
      qualifications: [{ ordinal: 5, verified: true }],
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };
    expect(evaluateRule(rule, factsDiploma).outcome).toBe('PASS');

    const facts12th: CandidateFacts = {
      qualifications: [{ ordinal: 3, verified: true }], // 12th pass
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };
    const res12th = evaluateRule(rule, facts12th);
    expect(res12th.outcome).toBe('FAIL');
    expect(res12th.candidateValue).toBe('12th pass');
    expect(res12th.requiredValue).toBe('Diploma');

    const factsEmpty: CandidateFacts = {
      qualifications: [],
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };
    expect(evaluateRule(rule, factsEmpty).outcome).toBe('UNKNOWN');
  });

  it('QUAL_MIN_LEVEL: requires verification when flag set', () => {
    const rule: Rule = {
      id: 'r-qual-ver',
      type: 'QUAL_MIN_LEVEL',
      operator: 'gte',
      value: 4, // ITI
      label: 'Requires verified ITI',
      requiresVerification: true,
      version: 1
    };

    const factsUnverified: CandidateFacts = {
      qualifications: [{ ordinal: 4, verified: false }],
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };
    expect(evaluateRule(rule, factsUnverified).outcome).toBe('UNKNOWN');

    const factsVerified: CandidateFacts = {
      qualifications: [{ ordinal: 4, verified: true }],
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };
    expect(evaluateRule(rule, factsVerified).outcome).toBe('PASS');
  });

  it('RESIDENCE_STATE: passes for allowed states and fails for others', () => {
    const rule: Rule = {
      id: 'r-state',
      type: 'RESIDENCE_STATE',
      operator: 'in',
      value: ['Maharashtra'],
      label: 'Open to residents of Maharashtra',
      requiresVerification: false,
      version: 1
    };

    expect(evaluateRule(rule, { state: 'Maharashtra', qualifications: [], certifications: [], experienceMonths: {}, attributes: {} }).outcome).toBe('PASS');
    expect(evaluateRule(rule, { state: 'Gujarat', qualifications: [], certifications: [], experienceMonths: {}, attributes: {} }).outcome).toBe('FAIL');
    expect(evaluateRule(rule, { state: undefined, qualifications: [], certifications: [], experienceMonths: {}, attributes: {} }).outcome).toBe('UNKNOWN');
  });

  it('RESIDENCE_DISTRICT: passes for allowed districts and fails for others', () => {
    const rule: Rule = {
      id: 'r-dist',
      type: 'RESIDENCE_DISTRICT',
      operator: 'in',
      value: ['Pune', 'Nashik'],
      label: 'Open to residents of Pune or Nashik',
      requiresVerification: false,
      version: 1
    };

    expect(evaluateRule(rule, { district: 'Pune', qualifications: [], certifications: [], experienceMonths: {}, attributes: {} }).outcome).toBe('PASS');
    expect(evaluateRule(rule, { district: 'Nashik', qualifications: [], certifications: [], experienceMonths: {}, attributes: {} }).outcome).toBe('PASS');
    expect(evaluateRule(rule, { district: 'Satara', qualifications: [], certifications: [], experienceMonths: {}, attributes: {} }).outcome).toBe('FAIL');
    expect(evaluateRule(rule, { district: '', qualifications: [], certifications: [], experienceMonths: {}, attributes: {} }).outcome).toBe('UNKNOWN');
  });

  it('AGE_RANGE: checks exact boundary on reference date', () => {
    const rule: Rule = {
      id: 'r-age',
      type: 'AGE_RANGE',
      operator: 'between',
      value: { min: 18, max: 30 },
      label: 'Age 18 to 30 as on 1 Jan 2027',
      requiresVerification: false,
      version: 1,
      referenceDate: '2027-01-01'
    };

    // Born 1995-01-01 -> 32 on 2027-01-01 -> FAIL (too old)
    const tooOld: CandidateFacts = {
      dob: '1995-01-01',
      qualifications: [],
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };
    const resOld = evaluateRule(rule, tooOld);
    expect(resOld.outcome).toBe('FAIL');
    expect(resOld.candidateValue).toBe('32 years');

    // Born 2005-01-01 -> 22 on 2027-01-01 -> PASS
    const validAge: CandidateFacts = {
      dob: '2005-01-01',
      qualifications: [],
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };
    expect(evaluateRule(rule, validAge).outcome).toBe('PASS');

    // Missing dob -> UNKNOWN
    expect(evaluateRule(rule, { dob: undefined, qualifications: [], certifications: [], experienceMonths: {}, attributes: {} }).outcome).toBe('UNKNOWN');
  });

  it('CERT_REQUIRED: checks valid cert exists and is not expired', () => {
    const rule: Rule = {
      id: 'r-cert',
      type: 'CERT_REQUIRED',
      operator: 'has',
      value: { code: 'FIRE_SAFETY', name: 'Fire Safety Certificate' },
      label: 'Requires Fire Safety Certificate',
      requiresVerification: false,
      version: 1,
      referenceDate: '2027-01-01'
    };

    const hasCert: CandidateFacts = {
      certifications: [{ code: 'FIRE_SAFETY', validTill: '2028-12-31', verified: true }],
      qualifications: [],
      experienceMonths: {},
      attributes: {}
    };
    expect(evaluateRule(rule, hasCert).outcome).toBe('PASS');

    const expiredCert: CandidateFacts = {
      certifications: [{ code: 'FIRE_SAFETY', validTill: '2026-06-01', verified: true }],
      qualifications: [],
      experienceMonths: {},
      attributes: {}
    };
    expect(evaluateRule(rule, expiredCert).outcome).toBe('FAIL');

    const noCert: CandidateFacts = {
      certifications: [{ code: 'FIRST_AID', verified: true }],
      qualifications: [],
      experienceMonths: {},
      attributes: {}
    };
    expect(evaluateRule(rule, noCert).outcome).toBe('FAIL');

    const emptyCerts: CandidateFacts = {
      certifications: [],
      qualifications: [],
      experienceMonths: {},
      attributes: {}
    };
    expect(evaluateRule(rule, emptyCerts).outcome).toBe('UNKNOWN');
  });

  it('EXPERIENCE_MIN: checks required domain experience months', () => {
    const rule: Rule = {
      id: 'r-exp',
      type: 'EXPERIENCE_MIN',
      operator: 'gte',
      value: { domain: 'electrical', months: 12 },
      label: 'Requires 12 months electrical experience',
      requiresVerification: false,
      version: 1
    };

    expect(evaluateRule(rule, { experienceMonths: { electrical: 18 }, qualifications: [], certifications: [], attributes: {} }).outcome).toBe('PASS');
    expect(evaluateRule(rule, { experienceMonths: { electrical: 6 }, qualifications: [], certifications: [], attributes: {} }).outcome).toBe('FAIL');
    expect(evaluateRule(rule, { experienceMonths: {}, qualifications: [], certifications: [], attributes: {} }).outcome).toBe('UNKNOWN');
  });
});

describe('Eligibility Engine - Opportunity Level Evaluation & Laws', () => {
  const rules: Rule[] = [
    {
      id: 'r1',
      type: 'RESIDENCE_STATE',
      operator: 'in',
      value: 'Maharashtra',
      label: 'Resident of Maharashtra',
      requiresVerification: false,
      version: 1
    },
    {
      id: 'r2',
      type: 'QUAL_MIN_LEVEL',
      operator: 'gte',
      value: 4, // ITI
      label: 'At least ITI',
      requiresVerification: false,
      version: 1
    }
  ];

  it('returns ELIGIBLE when all rules pass', () => {
    const facts: CandidateFacts = {
      state: 'Maharashtra',
      qualifications: [{ ordinal: 4, verified: true }],
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };
    const res = evaluateOpportunity(rules, facts);
    expect(res.status).toBe('ELIGIBLE');
    expect(res.results.every((r) => r.outcome === 'PASS')).toBe(true);
  });

  it('returns NOT_ELIGIBLE if any rule fails (even if others pass)', () => {
    const facts: CandidateFacts = {
      state: 'Gujarat', // FAILS state rule
      qualifications: [{ ordinal: 5, verified: true }], // PASSES qual rule
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };
    const res = evaluateOpportunity(rules, facts);
    expect(res.status).toBe('NOT_ELIGIBLE');
    expect(res.results.find((r) => r.ruleId === 'r1')?.outcome).toBe('FAIL');
    expect(res.results.find((r) => r.ruleId === 'r2')?.outcome).toBe('PASS');
  });

  it('returns NEEDS_INFO if no rule fails but at least one is UNKNOWN', () => {
    const facts: CandidateFacts = {
      state: 'Maharashtra', // PASS
      qualifications: [], // UNKNOWN (no qual entered)
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };
    const res = evaluateOpportunity(rules, facts);
    expect(res.status).toBe('NEEDS_INFO');
  });

  it('FAIL takes absolute priority over UNKNOWN', () => {
    const facts: CandidateFacts = {
      state: 'Gujarat', // FAIL
      qualifications: [], // UNKNOWN
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };
    const res = evaluateOpportunity(rules, facts);
    expect(res.status).toBe('NOT_ELIGIBLE');
  });

  it('evaluates all rules without short-circuiting', () => {
    const facts: CandidateFacts = {
      state: 'Gujarat', // FAIL
      qualifications: [{ ordinal: 2, verified: true }], // FAIL
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };
    const res = evaluateOpportunity(rules, facts);
    expect(res.results.length).toBe(2);
    expect(res.results.filter((r) => r.outcome === 'FAIL').length).toBe(2);
  });
});

describe('Eligibility Engine - Property Tests (fast-check)', () => {
  it('Property 1: A FAIL rule NEVER yields ELIGIBLE', () => {
    fc.assert(
      fc.property(
        fc.record({
          state: fc.oneof(fc.constant('Maharashtra'), fc.constant('Gujarat'), fc.constant(undefined)),
          district: fc.oneof(fc.constant('Pune'), fc.constant('Satara'), fc.constant(undefined)),
          dob: fc.oneof(fc.constant('2000-01-01'), fc.constant('1980-01-01'), fc.constant(undefined)),
          qualLevel: fc.integer({ min: 0, max: 7 })
        }),
        ({ state, district, dob, qualLevel }) => {
          const facts: CandidateFacts = {
            state,
            district,
            dob,
            qualifications: qualLevel > 0 ? [{ ordinal: qualLevel, verified: true }] : [],
            certifications: [],
            experienceMonths: {},
            attributes: {}
          };

          const testRules: Rule[] = [
            {
              id: 'r-st',
              type: 'RESIDENCE_STATE',
              operator: 'in',
              value: 'Maharashtra',
              label: 'Maharashtra only',
              requiresVerification: false,
              version: 1
            },
            {
              id: 'r-q',
              type: 'QUAL_MIN_LEVEL',
              operator: 'gte',
              value: 4,
              label: 'Min ITI',
              requiresVerification: false,
              version: 1
            }
          ];

          const res = evaluateOpportunity(testRules, facts);
          const hasFail = res.results.some((r) => r.outcome === 'FAIL');
          if (hasFail) {
            expect(res.status).toBe('NOT_ELIGIBLE');
          }
        }
      )
    );
  });

  it('Property 2: Determinism - 100 executions yield byte-identical results', () => {
    const facts: CandidateFacts = {
      state: 'Maharashtra',
      district: 'Pune',
      dob: '2002-08-10',
      qualifications: [{ ordinal: 4, fieldCode: 'Electrician', verified: true }],
      certifications: [{ code: 'FIRE_SAFETY', verified: true }],
      experienceMonths: { electrical: 12 },
      attributes: {}
    };

    const rules: Rule[] = [
      { id: '1', type: 'RESIDENCE_STATE', operator: 'in', value: 'Maharashtra', label: 'MH', requiresVerification: false, version: 1 },
      { id: '2', type: 'AGE_RANGE', operator: 'between', value: { min: 18, max: 30 }, label: 'Age', requiresVerification: false, version: 1, referenceDate: '2027-01-01' },
      { id: '3', type: 'QUAL_MIN_LEVEL', operator: 'gte', value: 4, label: 'ITI', requiresVerification: false, version: 1 }
    ];

    const baseline = JSON.stringify(evaluateOpportunity(rules, facts));
    for (let i = 0; i < 100; i++) {
      const run = JSON.stringify(evaluateOpportunity(rules, facts));
      expect(run).toBe(baseline);
    }
  });

  it('Property 3: Monotonicity - adding a FAIL rule never turns an opportunity ELIGIBLE', () => {
    const facts: CandidateFacts = {
      state: 'Maharashtra',
      qualifications: [{ ordinal: 4, verified: true }],
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };

    const passingRules: Rule[] = [
      { id: '1', type: 'RESIDENCE_STATE', operator: 'in', value: 'Maharashtra', label: 'MH', requiresVerification: false, version: 1 }
    ];
    expect(evaluateOpportunity(passingRules, facts).status).toBe('ELIGIBLE');

    const failingRule: Rule = {
      id: '2',
      type: 'RESIDENCE_DISTRICT',
      operator: 'in',
      value: 'Nashik',
      label: 'Nashik only',
      requiresVerification: false,
      version: 1
    };

    const withFail = evaluateOpportunity([...passingRules, failingRule], facts);
    expect(withFail.status).not.toBe('ELIGIBLE');
  });
});
