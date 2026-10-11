import {
  CandidateFacts,
  EligibilityResult,
  Outcome,
  QUAL_LEVEL_NAMES,
  Rule,
  RuleResult
} from './types.js';

/**
 * Normalise string for case/whitespace-insensitive comparison.
 */
function norm(str?: string | null): string {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Compute exact age in completed years between birth date and reference date.
 */
export function calculateExactAge(dobStr: string, refDateStr: string): number {
  const [bYear, bMonth, bDay] = dobStr.split('-').map(Number);
  const [rYear, rMonth, rDay] = refDateStr.split('-').map(Number);

  let age = rYear - bYear;
  if (rMonth < bMonth || (rMonth === bMonth && rDay < bDay)) {
    age--;
  }
  return age;
}

/**
 * Evaluates a single rule against candidate facts.
 * Pure function: deterministic, zero I/O, zero AI.
 */
export function evaluateRule(rule: Rule, facts: CandidateFacts): RuleResult {
  const refDate = rule.referenceDate || new Date().toISOString().split('T')[0];

  try {
    switch (rule.type) {
      case 'QUAL_MIN_LEVEL': {
        const requiredOrdinal =
          typeof rule.value === 'number'
            ? rule.value
            : Number((rule.value as any)?.ordinal ?? 1);

        const requiredLabel =
          QUAL_LEVEL_NAMES[requiredOrdinal] || `Level ${requiredOrdinal}`;

        const quals = facts.qualifications || [];
        if (quals.length === 0 && !facts.highestQualification) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'UNKNOWN',
            label: rule.label,
            candidateValue: null,
            requiredValue: requiredLabel,
            missingField: 'qualification'
          };
        }

        const validQuals = rule.requiresVerification
          ? quals.filter((q) => q.verified)
          : quals;

        if (rule.requiresVerification && validQuals.length === 0) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'UNKNOWN',
            label: rule.label,
            candidateValue: 'Unverified qualification',
            requiredValue: requiredLabel,
            missingField: 'verifiedQualification'
          };
        }

        const highest = validQuals.reduce(
          (max, q) => (q.ordinal > max ? q.ordinal : max),
          facts.highestQualification && (!rule.requiresVerification || facts.highestQualification.verified)
            ? facts.highestQualification.ordinal
            : 0
        );

        const candidateLabel = QUAL_LEVEL_NAMES[highest] || (highest > 0 ? `Level ${highest}` : 'None');

        if (highest >= requiredOrdinal) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'PASS',
            label: rule.label,
            candidateValue: candidateLabel,
            requiredValue: requiredLabel
          };
        }

        return {
          ruleId: rule.id,
          type: rule.type,
          outcome: 'FAIL',
          label: rule.label,
          candidateValue: candidateLabel,
          requiredValue: requiredLabel
        };
      }

      case 'QUAL_FIELD': {
        const val = rule.value as any;
        const requiredFields: string[] = Array.isArray(val)
          ? val.map(norm)
          : Array.isArray(val?.fields)
          ? val.fields.map(norm)
          : [norm(String(val?.field || val))];

        const minLevel = Number(val?.minLevel ?? 1);
        const requiredLabel =
          typeof rule.value === 'string'
            ? rule.value
            : Array.isArray(val)
            ? val.join(', ')
            : val?.fields?.join(', ') || 'Specified field';

        const quals = facts.qualifications || [];
        if (quals.length === 0) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'UNKNOWN',
            label: rule.label,
            candidateValue: null,
            requiredValue: requiredLabel,
            missingField: 'qualification'
          };
        }

        const validQuals = rule.requiresVerification
          ? quals.filter((q) => q.verified)
          : quals;

        if (rule.requiresVerification && validQuals.length === 0) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'UNKNOWN',
            label: rule.label,
            candidateValue: 'Unverified qualification',
            requiredValue: requiredLabel,
            missingField: 'verifiedQualification'
          };
        }

        const match = validQuals.find(
          (q) => q.ordinal >= minLevel && q.fieldCode && requiredFields.includes(norm(q.fieldCode))
        );

        if (match) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'PASS',
            label: rule.label,
            candidateValue: `${QUAL_LEVEL_NAMES[match.ordinal] || ''} in ${match.fieldCode}`.trim(),
            requiredValue: requiredLabel
          };
        }

        const candidateSummary = validQuals
          .map((q) => `${QUAL_LEVEL_NAMES[q.ordinal] || ''} in ${q.fieldCode || 'General'}`)
          .join(', ');

        return {
          ruleId: rule.id,
          type: rule.type,
          outcome: 'FAIL',
          label: rule.label,
          candidateValue: candidateSummary || 'None matching',
          requiredValue: requiredLabel
        };
      }

      case 'RESIDENCE_STATE': {
        const allowedStates: string[] = Array.isArray(rule.value)
          ? rule.value.map(norm)
          : [norm(String(rule.value))];

        const requiredLabel = Array.isArray(rule.value) ? rule.value.join(', ') : String(rule.value);

        if (!facts.state || norm(facts.state) === '') {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'UNKNOWN',
            label: rule.label,
            candidateValue: null,
            requiredValue: requiredLabel,
            missingField: 'state'
          };
        }

        const candidateStateNorm = norm(facts.state);
        if (allowedStates.includes(candidateStateNorm)) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'PASS',
            label: rule.label,
            candidateValue: facts.state,
            requiredValue: requiredLabel
          };
        }

        return {
          ruleId: rule.id,
          type: rule.type,
          outcome: 'FAIL',
          label: rule.label,
          candidateValue: facts.state,
          requiredValue: requiredLabel
        };
      }

      case 'RESIDENCE_DISTRICT': {
        const allowedDistricts: string[] = Array.isArray(rule.value)
          ? rule.value.map(norm)
          : [norm(String(rule.value))];

        const requiredLabel = Array.isArray(rule.value)
          ? rule.value.join(', ')
          : String(rule.value);

        if (!facts.district || norm(facts.district) === '') {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'UNKNOWN',
            label: rule.label,
            candidateValue: null,
            requiredValue: requiredLabel,
            missingField: 'district'
          };
        }

        const candidateDistrictNorm = norm(facts.district);
        if (allowedDistricts.includes(candidateDistrictNorm)) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'PASS',
            label: rule.label,
            candidateValue: facts.district,
            requiredValue: requiredLabel
          };
        }

        return {
          ruleId: rule.id,
          type: rule.type,
          outcome: 'FAIL',
          label: rule.label,
          candidateValue: facts.district,
          requiredValue: requiredLabel
        };
      }

      case 'AGE_RANGE': {
        const val = rule.value as any;
        const minAge = typeof val?.min === 'number' ? val.min : Array.isArray(val) ? Number(val[0]) : 18;
        const maxAge = typeof val?.max === 'number' ? val.max : Array.isArray(val) ? Number(val[1]) : 35;
        const requiredLabel = `${minAge} to ${maxAge} years`;

        if (!facts.dob || facts.dob.trim() === '') {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'UNKNOWN',
            label: rule.label,
            candidateValue: null,
            requiredValue: requiredLabel,
            missingField: 'dateOfBirth'
          };
        }

        const age = calculateExactAge(facts.dob, refDate);
        const candidateLabel = `${age} years`;

        if (age >= minAge && age <= maxAge) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'PASS',
            label: rule.label,
            candidateValue: candidateLabel,
            requiredValue: requiredLabel
          };
        }

        return {
          ruleId: rule.id,
          type: rule.type,
          outcome: 'FAIL',
          label: rule.label,
          candidateValue: candidateLabel,
          requiredValue: requiredLabel
        };
      }

      case 'CERT_REQUIRED': {
        const val = rule.value as any;
        const targetCode = norm(typeof val === 'string' ? val : val?.code || '');
        const targetName = typeof val === 'string' ? val : val?.name || val?.code || 'Required Certificate';

        const certs = facts.certifications || [];
        if (certs.length === 0) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'UNKNOWN',
            label: rule.label,
            candidateValue: null,
            requiredValue: targetName,
            missingField: 'certifications'
          };
        }

        const matchingCert = certs.find(
          (c) => norm(c.code) === targetCode || (c.name && norm(c.name) === targetCode)
        );

        if (!matchingCert) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'FAIL',
            label: rule.label,
            candidateValue: 'None on profile',
            requiredValue: targetName
          };
        }

        if (rule.requiresVerification && !matchingCert.verified) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'UNKNOWN',
            label: rule.label,
            candidateValue: 'Unverified certificate',
            requiredValue: targetName,
            missingField: 'verifiedCertificate'
          };
        }

        // Validity check if cert has validTill
        if (matchingCert.validTill && matchingCert.validTill < refDate) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'FAIL',
            label: rule.label,
            candidateValue: `Expired on ${matchingCert.validTill}`,
            requiredValue: `Valid as on ${refDate}`
          };
        }

        return {
          ruleId: rule.id,
          type: rule.type,
          outcome: 'PASS',
          label: rule.label,
          candidateValue: matchingCert.name || matchingCert.code,
          requiredValue: targetName
        };
      }

      case 'EXPERIENCE_MIN': {
        const val = rule.value as any;
        const domain = typeof val === 'string' ? 'general' : val?.domain || 'general';
        const requiredMonths = typeof val === 'number' ? val : Number(val?.months ?? 0);
        const requiredLabel = `${requiredMonths} months in ${domain}`;

        const expMap = facts.experienceMonths || {};
        const candidateMonths = expMap[domain] ?? expMap[norm(domain)] ?? 0;
        const candidateLabel = `${candidateMonths} months`;

        if (expMap[domain] === undefined && expMap[norm(domain)] === undefined && Object.keys(expMap).length === 0) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'UNKNOWN',
            label: rule.label,
            candidateValue: null,
            requiredValue: requiredLabel,
            missingField: 'workExperience'
          };
        }

        if (candidateMonths >= requiredMonths) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'PASS',
            label: rule.label,
            candidateValue: candidateLabel,
            requiredValue: requiredLabel
          };
        }

        return {
          ruleId: rule.id,
          type: rule.type,
          outcome: 'FAIL',
          label: rule.label,
          candidateValue: candidateLabel,
          requiredValue: requiredLabel
        };
      }

      case 'ATTRIBUTE': {
        const val = rule.value as any;
        const key = val?.key || '';
        const expected = val?.expected ?? val;
        const requiredLabel = String(expected);

        const candidateVal = facts.attributes?.[key];
        if (candidateVal === undefined || candidateVal === null || candidateVal === '') {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'UNKNOWN',
            label: rule.label,
            candidateValue: null,
            requiredValue: requiredLabel,
            missingField: key
          };
        }

        const isMatch = Array.isArray(expected)
          ? expected.map(String).map(norm).includes(norm(candidateVal))
          : norm(candidateVal) === norm(String(expected));

        if (isMatch) {
          return {
            ruleId: rule.id,
            type: rule.type,
            outcome: 'PASS',
            label: rule.label,
            candidateValue: candidateVal,
            requiredValue: requiredLabel
          };
        }

        return {
          ruleId: rule.id,
          type: rule.type,
          outcome: 'FAIL',
          label: rule.label,
          candidateValue: candidateVal,
          requiredValue: requiredLabel
        };
      }

      default: {
        return {
          ruleId: rule.id,
          type: rule.type,
          outcome: 'UNKNOWN',
          label: rule.label,
          candidateValue: null,
          requiredValue: 'Unknown rule',
          missingField: 'unknown'
        };
      }
    }
  } catch (error) {
    // Law 90: Rule evaluation errors become UNKNOWN for that rule and are logged; they never become PASS.
    return {
      ruleId: rule.id,
      type: rule.type,
      outcome: 'UNKNOWN',
      label: rule.label,
      candidateValue: null,
      requiredValue: 'Evaluation error',
      missingField: 'error'
    };
  }
}

/**
 * Evaluates all rules for an opportunity without short-circuiting.
 * Status:
 *  - NOT_ELIGIBLE if any rule FAIL
 *  - NEEDS_INFO if none FAIL but at least one UNKNOWN
 *  - ELIGIBLE if all rules PASS (or no rules)
 */
export function evaluateOpportunity(rules: Rule[], facts: CandidateFacts): EligibilityResult {
  const results = rules.map((r) => evaluateRule(r, facts));

  let status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_INFO' = 'ELIGIBLE';

  if (results.some((r) => r.outcome === 'FAIL')) {
    status = 'NOT_ELIGIBLE';
  } else if (results.some((r) => r.outcome === 'UNKNOWN')) {
    status = 'NEEDS_INFO';
  }

  return { status, results };
}
