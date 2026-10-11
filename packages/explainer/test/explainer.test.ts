import { describe, expect, it } from 'vitest';
import { explainMatch } from '../src/explainer.js';
import { RuleResult } from '@rozgarlink/shared-types';

describe('Explainer Package', () => {
  it('explains NOT_ELIGIBLE with failed rules sorted by candidate effort to fix', () => {
    const rules: RuleResult[] = [
      {
        ruleId: 'r-age',
        type: 'AGE_RANGE',
        outcome: 'FAIL',
        label: 'Age between 18 and 30',
        candidateValue: '34 years',
        requiredValue: '18 to 30 years'
      },
      {
        ruleId: 'r-qual',
        type: 'QUAL_MIN_LEVEL',
        outcome: 'FAIL',
        label: 'Minimum Diploma required',
        candidateValue: '10th pass',
        requiredValue: 'Diploma'
      }
    ];

    const res = explainMatch({
      status: 'NOT_ELIGIBLE',
      ruleResults: rules,
      locale: 'en'
    });

    expect(res.status).toBe('NOT_ELIGIBLE');
    expect(res.failedRules.length).toBe(2);
    // Qualification should appear before Age because effort priority for QUAL is higher
    expect(res.failedRules[0].label).toContain('Diploma');
    expect(res.failedRules[1].label).toContain('Age');
    expect(res.points[0]).toContain('Your profile: 10th pass');
  });

  it('generates Marathi and Hindi translations properly', () => {
    const rules: RuleResult[] = [
      {
        ruleId: 'r-1',
        type: 'QUAL_MIN_LEVEL',
        outcome: 'FAIL',
        label: 'Diploma आवश्यक',
        candidateValue: '10th pass',
        requiredValue: 'Diploma'
      }
    ];

    const resHi = explainMatch({ status: 'NOT_ELIGIBLE', ruleResults: rules, locale: 'hi' });
    expect(resHi.headline).toBe('पात्र नहीं');
    expect(resHi.points[0]).toContain('आपकी प्रोफ़ाइल: 10th pass');

    const resMr = explainMatch({ status: 'NOT_ELIGIBLE', ruleResults: rules, locale: 'mr' });
    expect(resMr.headline).toBe('अपात्र');
    expect(resMr.points[0]).toContain('तुमची प्रोफाइल: 10th pass');
  });

  it('explains ELIGIBLE with skill and commute details', () => {
    const res = explainMatch({
      status: 'ELIGIBLE',
      ruleResults: [],
      components: {
        skillFit: 1.0,
        preferenceFit: 0.85,
        proficiencyFit: 0.9,
        commuteFit: 1.0,
        payFit: 1.0,
        shiftFit: 1.0,
        workTypeFit: 1.0,
        sectorFit: 0.5,
        distanceKm: 8.5
      },
      matchedSkillNames: ['Solar PV', 'Basic Electrical'],
      totalRequiredSkills: 2,
      locale: 'en',
      district: 'Pune'
    });

    expect(res.status).toBe('ELIGIBLE');
    expect(res.points.some((p) => p.includes('Strong skill fit'))).toBe(true);
    expect(res.points.some((p) => p.includes('9 km'))).toBe(true);
  });
});
