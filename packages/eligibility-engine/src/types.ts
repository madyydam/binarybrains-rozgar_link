export type Outcome = 'PASS' | 'FAIL' | 'UNKNOWN';

export type RuleType =
  | 'QUAL_MIN_LEVEL'
  | 'QUAL_FIELD'
  | 'RESIDENCE_STATE'
  | 'RESIDENCE_DISTRICT'
  | 'AGE_RANGE'
  | 'CERT_REQUIRED'
  | 'EXPERIENCE_MIN'
  | 'ATTRIBUTE';

export interface CandidateQualificationFact {
  ordinal: number;
  fieldCode?: string;
  verified: boolean;
}

export interface CandidateCertificationFact {
  code: string;
  name?: string;
  validTill?: string; // YYYY-MM-DD
  verified: boolean;
}

export interface CandidateFacts {
  state?: string;
  district?: string;
  dob?: string; // YYYY-MM-DD
  highestQualification?: CandidateQualificationFact;
  qualifications: CandidateQualificationFact[];
  certifications: CandidateCertificationFact[];
  experienceMonths: Record<string, number>; // domain code -> months
  attributes: Record<string, string | undefined>;
}

export interface Rule {
  id: string;
  type: RuleType;
  operator: string;
  value: unknown;
  label: string;
  requiresVerification: boolean;
  version: number;
  referenceDate?: string; // YYYY-MM-DD
  sensitive?: boolean;
}

export interface RuleResult {
  ruleId: string;
  type: RuleType;
  outcome: Outcome;
  label: string;
  candidateValue: string | null;
  requiredValue: string;
  missingField?: string;
}

export interface EligibilityResult {
  status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_INFO';
  results: RuleResult[];
}

export const QUAL_LEVEL_NAMES: Record<number, string> = {
  1: '8th pass',
  2: '10th pass',
  3: '12th pass',
  4: 'ITI',
  5: 'Diploma',
  6: 'Graduate',
  7: 'Postgraduate'
};
