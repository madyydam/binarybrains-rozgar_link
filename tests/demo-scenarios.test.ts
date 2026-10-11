import { describe, expect, it } from 'vitest';
import { evaluateOpportunity, Rule } from '@rozgarlink/eligibility-engine';
import { rankEligibleOpportunities, scoreEligibleOpportunity } from '@rozgarlink/ranking-engine';
import { SkillService } from '@rozgarlink/skill-core';
import { analyzeSkillGaps, buildLearningPathway } from '@rozgarlink/pathway';
import { CandidateFacts, CandidatePreferences, CandidateSkillCredit, EligibleOpportunity } from '@rozgarlink/shared-types';
import { SEED_COURSES, SEED_SKILLS, SEED_ALIASES, SEED_OPPORTUNITIES } from '../db/seeds/data.js';

describe('Demo Scenarios A-I (PRD Section 19)', () => {
  // Scenario A: Asha moves district from Pune to Satara
  it('Scenario A: District change flips residence-restricted roles to Not eligible live', () => {
    const oppPuneOnly: Rule = {
      id: 'r-pune-only',
      type: 'RESIDENCE_DISTRICT',
      operator: 'in',
      value: ['Pune', 'Nashik'],
      label: 'Open to residents of Pune or Nashik',
      requiresVerification: false,
      version: 1
    };

    // Asha in Pune -> PASS (Eligible)
    const ashaInPune: CandidateFacts = {
      state: 'Maharashtra',
      district: 'Pune',
      qualifications: [{ ordinal: 4, verified: true }],
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };
    expect(evaluateOpportunity([oppPuneOnly], ashaInPune).status).toBe('ELIGIBLE');

    // Asha moves to Satara -> FAIL (Not Eligible) with exact reason!
    const ashaInSatara: CandidateFacts = {
      ...ashaInPune,
      district: 'Satara'
    };
    const resSatara = evaluateOpportunity([oppPuneOnly], ashaInSatara);
    expect(resSatara.status).toBe('NOT_ELIGIBLE');
    expect(resSatara.results[0].candidateValue).toBe('Satara');
    expect(resSatara.results[0].label).toContain('Pune or Nashik');
  });

  // Scenario B: Rahul adds a Diploma
  it('Scenario B: Rahul adds a Diploma -> Diploma-required roles become eligible', () => {
    const oppRequiresDiploma: Rule = {
      id: 'r-diploma',
      type: 'QUAL_MIN_LEVEL',
      operator: 'gte',
      value: 5, // Diploma
      label: 'Requires at least a Diploma',
      requiresVerification: false,
      version: 1
    };

    // Rahul with 12th pass (Level 3) -> NOT_ELIGIBLE
    const rahul12th: CandidateFacts = {
      state: 'Maharashtra',
      qualifications: [{ ordinal: 3, verified: true }],
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };
    expect(evaluateOpportunity([oppRequiresDiploma], rahul12th).status).toBe('NOT_ELIGIBLE');

    // Rahul gains a Diploma (Level 5) -> ELIGIBLE!
    const rahulDiploma: CandidateFacts = {
      state: 'Maharashtra',
      qualifications: [{ ordinal: 5, verified: true }],
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };
    expect(evaluateOpportunity([oppRequiresDiploma], rahulDiploma).status).toBe('ELIGIBLE');
  });

  // Scenario C: Rahul writes "tally prime, gst returns"
  it('Scenario C: "tally prime, gst returns" resolves to Accounting software & Tax filing via dictionary', async () => {
    const service = new SkillService();
    const extracted = await service.extractSkillsFromText('tally prime, gst returns', SEED_SKILLS, SEED_ALIASES);

    expect(extracted.length).toBe(2);
    expect(extracted.map((e) => e.skillId)).toContain('SK-ACCOUNTING-SW');
    expect(extracted.map((e) => e.skillId)).toContain('SK-TAX-FILING');
  });

  // Scenario D: Meena sets commute importance to high
  it('Scenario D: Commute importance reorders eligible matches without hiding any', () => {
    const oppLocal = {
      id: 'OP-LOCAL',
      title: 'Local Kolhapur Workshop',
      district: 'Kolhapur',
      preferenceAttrs: { pay: { min: 10000 }, shift: 'day' },
      rulesVersion: 1,
      eligibilityResult: { status: 'ELIGIBLE', results: [] }
    } as unknown as EligibleOpportunity;

    const oppFarHighPay = {
      id: 'OP-FAR',
      title: 'Distant Mumbai Factory',
      district: 'Mumbai',
      preferenceAttrs: { pay: { min: 35000 }, shift: 'day' },
      rulesVersion: 1,
      eligibilityResult: { status: 'ELIGIBLE', results: [] }
    } as unknown as EligibleOpportunity;

    const items = [
      { opportunity: oppLocal, skills: [] },
      { opportunity: oppFarHighPay, skills: [] }
    ];

    // Commute high: Local ranks first
    const prefsCommuteHigh: CandidatePreferences = {
      commuteKm: 10,
      minPay: 10000,
      shift: 'day',
      workType: ['full-time'],
      sector: [],
      weights: { commute: 0.9, pay: 0.05, shift: 0.025, workType: 0.025 }
    };
    const ranked1 = rankEligibleOpportunities(items, [], prefsCommuteHigh, 'Kolhapur');
    expect(ranked1[0].opportunityId).toBe('OP-LOCAL');

    // Pay high: Far ranks first, nothing hidden!
    const prefsPayHigh: CandidatePreferences = {
      commuteKm: 10,
      minPay: 30000,
      shift: 'day',
      workType: ['full-time'],
      sector: [],
      weights: { commute: 0.05, pay: 0.9, shift: 0.025, workType: 0.025 }
    };
    const ranked2 = rankEligibleOpportunities(items, [], prefsPayHigh, 'Kolhapur');
    expect(ranked2.length).toBe(2); // Nothing is hidden
    expect(ranked2[0].opportunityId).toBe('OP-FAR'); // Reordered
  });

  // Scenario E: Candidate with perfect skills but too old
  it('Scenario E: Candidate too old -> NOT_ELIGIBLE with exact reason "Age 32 years", rank not computed', () => {
    const ageRule: Rule = {
      id: 'r-age',
      type: 'AGE_RANGE',
      operator: 'between',
      value: { min: 18, max: 30 },
      label: 'Age limit 18 to 30 years',
      requiresVerification: false,
      version: 1,
      referenceDate: '2027-01-01'
    };

    // Candidate born in 1995 -> 32 years old
    const candidate32: CandidateFacts = {
      state: 'Maharashtra',
      dob: '1995-01-01',
      qualifications: [{ ordinal: 4, verified: true }],
      certifications: [],
      experienceMonths: {},
      attributes: {}
    };

    const res = evaluateOpportunity([ageRule], candidate32);
    expect(res.status).toBe('NOT_ELIGIBLE');
    expect(res.results[0].candidateValue).toBe('32 years');
    expect(res.results[0].requiredValue).toBe('18 to 30 years');
  });

  // Scenario F: Mark Interested on role needing two missing skills
  it('Scenario F: Interested role with 2 missing skills generates 2-step pathway with prerequisites', () => {
    const missing = ['SK-PANEL-FIT', 'SK-FAULT-FIND'];
    const pathway = buildLearningPathway(missing, SEED_COURSES, []);

    expect(pathway.steps.length).toBe(2);
    expect(pathway.steps[0].resource.id).toBe('COURSE-SAFETY'); // Prerequisite first
    expect(pathway.steps[1].resource.id).toBe('COURSE-PANEL-WIRING'); // Main course
    expect(pathway.totalHours).toBe(50);
  });

  // Scenario G: Missing licence data
  it('Scenario G: Missing driving licence data appears in Need more information', () => {
    const licenceRule: Rule = {
      id: 'r-lic',
      type: 'CERT_REQUIRED',
      operator: 'has',
      value: { code: 'DRIVING_LICENCE', name: 'Valid Driving Licence' },
      label: 'Requires valid driving licence',
      requiresVerification: false,
      version: 1
    };

    const candidateNoLicence: CandidateFacts = {
      state: 'Maharashtra',
      certifications: [], // Empty certifications!
      qualifications: [],
      experienceMonths: {},
      attributes: {}
    };

    const res = evaluateOpportunity([licenceRule], candidateNoLicence);
    expect(res.status).toBe('NEEDS_INFO');
    expect(res.results[0].outcome).toBe('UNKNOWN');
    expect(res.results[0].missingField).toBe('certifications');
  });

  // Scenario H: AI service switched off
  it('Scenario H: AI disabled leaves dictionary and eligibility completely intact', async () => {
    const service = new SkillService({ aiEnabled: false });

    // Dictionary resolves
    const res = await service.resolvePhrase('tally prime', SEED_SKILLS, SEED_ALIASES);
    expect(res.matchedSkillId).toBe('SK-ACCOUNTING-SW');
    expect(res.credit).toBe(1.0);

    // Non-dictionary returns none cleanly
    const nonDict = await service.resolvePhrase('unknown random phrase', SEED_SKILLS, SEED_ALIASES);
    expect(nonDict.credit).toBe(0);
  });
});
