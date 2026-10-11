import { z } from 'zod';

// ==========================================
// Roles & Auth
// ==========================================
export const UserRoleSchema = z.enum([
  'candidate',
  'officer',
  'catalogue_manager',
  'admin',
  'evaluator'
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  role: UserRoleSchema,
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  name: z.string(),
  locale: z.string().default('en'),
  createdAt: z.string().optional()
});
export type User = z.infer<typeof UserSchema>;

// ==========================================
// Qualification Ladder & Records
// ==========================================
export const QualificationLevelSchema = z.object({
  ordinal: z.number().int(),
  code: z.string(),
  label: z.string()
});
export type QualificationLevel = z.infer<typeof QualificationLevelSchema>;

export const STANDARD_QUALIFICATION_LADDER: QualificationLevel[] = [
  { ordinal: 1, code: '8TH', label: '8th Pass' },
  { ordinal: 2, code: '10TH', label: '10th Pass' },
  { ordinal: 3, code: '12TH', label: '12th Pass' },
  { ordinal: 4, code: 'ITI', label: 'ITI' },
  { ordinal: 5, code: 'DIPLOMA', label: 'Diploma' },
  { ordinal: 6, code: 'GRADUATE', label: 'Graduate' },
  { ordinal: 7, code: 'POSTGRADUATE', label: 'Postgraduate' }
];

export const CandidateQualificationSchema = z.object({
  id: z.string().uuid().optional(),
  candidateId: z.string().uuid().optional(),
  levelOrdinal: z.number().int(),
  fieldCode: z.string().optional(),
  institution: z.string().optional(),
  year: z.number().int().optional(),
  verified: z.boolean().default(false)
});
export type CandidateQualification = z.infer<typeof CandidateQualificationSchema>;

export const CandidateCertificationSchema = z.object({
  id: z.string().uuid().optional(),
  candidateId: z.string().uuid().optional(),
  code: z.string(),
  name: z.string().optional(),
  issuer: z.string().optional(),
  validTill: z.string().optional(), // YYYY-MM-DD
  verified: z.boolean().default(false)
});
export type CandidateCertification = z.infer<typeof CandidateCertificationSchema>;

export const CandidateExperienceSchema = z.object({
  id: z.string().uuid().optional(),
  candidateId: z.string().uuid().optional(),
  domainCode: z.string(),
  months: z.number().int().min(0)
});
export type CandidateExperience = z.infer<typeof CandidateExperienceSchema>;

// ==========================================
// Candidate Facts (Input for Eligibility Engine)
// ==========================================
export interface CandidateFacts {
  state?: string;
  district?: string;
  dob?: string; // YYYY-MM-DD
  highestQualification?: {
    ordinal: number;
    fieldCode?: string;
    verified: boolean;
  };
  qualifications: {
    ordinal: number;
    fieldCode?: string;
    verified: boolean;
  }[];
  certifications: {
    code: string;
    validTill?: string;
    verified: boolean;
  }[];
  experienceMonths: Record<string, number>; // domain code -> months
  attributes: Record<string, string | undefined>;
}

// ==========================================
// Candidate Preferences & Profile
// ==========================================
export const CandidatePreferencesSchema = z.object({
  commuteKm: z.number().default(15),
  minPay: z.number().default(10000),
  shift: z.enum(['day', 'night', 'rotational', 'flexible']).default('flexible'),
  workType: z.array(z.string()).default(['full-time']),
  sector: z.array(z.string()).default([]),
  weights: z.object({
    commute: z.number().min(0).max(1).default(0.25),
    pay: z.number().min(0).max(1).default(0.25),
    shift: z.number().min(0).max(1).default(0.25),
    workType: z.number().min(0).max(1).default(0.25)
  }).default({
    commute: 0.25,
    pay: 0.25,
    shift: 0.25,
    workType: 0.25
  })
});
export type CandidatePreferences = z.infer<typeof CandidatePreferencesSchema>;

export const CandidateProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  state: z.string().optional(),
  district: z.string().optional(),
  pincode: z.string().optional(),
  dateOfBirth: z.string().optional(), // YYYY-MM-DD
  preferences: CandidatePreferencesSchema.default({}),
  profileVersion: z.number().int().default(1),
  updatedAt: z.string().optional()
});
export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;

// ==========================================
// Skills
// ==========================================
export const SkillSchema = z.object({
  id: z.string(),
  canonicalName: z.string(),
  category: z.string().optional(),
  embedding: z.array(z.number()).optional()
});
export type Skill = z.infer<typeof SkillSchema>;

export const SkillAliasSchema = z.object({
  id: z.number().optional(),
  skillId: z.string(),
  phraseNorm: z.string(),
  language: z.string().default('en')
});
export type SkillAlias = z.infer<typeof SkillAliasSchema>;

export const CandidateSkillSchema = z.object({
  candidateId: z.string().uuid().optional(),
  skillId: z.string(),
  proficiency: z.number().int().min(1).max(5).default(3),
  source: z.enum(['manual', 'ai', 'course']).default('manual'),
  confirmed: z.boolean().default(false),
  confidence: z.number().min(0).max(1).optional()
});
export type CandidateSkill = z.infer<typeof CandidateSkillSchema>;

// ==========================================
// Opportunities & Rules
// ==========================================
export const RuleTypeSchema = z.enum([
  'QUAL_MIN_LEVEL',
  'QUAL_FIELD',
  'RESIDENCE_STATE',
  'RESIDENCE_DISTRICT',
  'AGE_RANGE',
  'CERT_REQUIRED',
  'EXPERIENCE_MIN',
  'ATTRIBUTE'
]);
export type RuleType = z.infer<typeof RuleTypeSchema>;

export const RuleOutcomeSchema = z.enum(['PASS', 'FAIL', 'UNKNOWN']);
export type Outcome = z.infer<typeof RuleOutcomeSchema>;

export interface EligibilityRule {
  id: string;
  opportunityId?: string;
  type: RuleType;
  operator: string; // 'gte' | 'in' | 'between' | 'has' | 'eq'
  value: unknown;
  label: string;
  requiresVerification: boolean;
  sensitive?: boolean;
  version: number;
  referenceDate?: string; // YYYY-MM-DD
}

export interface RuleResult {
  ruleId: string;
  type?: RuleType;
  outcome: Outcome;
  label: string;
  candidateValue: string | null;
  requiredValue: string;
  missingField?: string;
}

export type MatchStatus = 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_INFO';

export interface EligibilityResult {
  status: MatchStatus;
  results: RuleResult[];
}

export const OpportunitySkillSchema = z.object({
  opportunityId: z.string().uuid().optional(),
  skillId: z.string(),
  importance: z.enum(['required', 'preferred']).default('required'),
  minProficiency: z.number().int().min(1).max(5).default(1)
});
export type OpportunitySkill = z.infer<typeof OpportunitySkillSchema>;

export const PreferenceAttrsSchema = z.object({
  pay: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  shift: z.string().optional(),
  workType: z.string().optional(),
  sector: z.string().optional(),
  remote: z.boolean().optional()
});
export type PreferenceAttrs = z.infer<typeof PreferenceAttrsSchema>;

export const OpportunitySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  orgName: z.string().optional(),
  workDescription: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  status: z.string().default('open'),
  closesOn: z.string().optional(),
  referenceDate: z.string().optional(),
  preferenceAttrs: PreferenceAttrsSchema.default({}),
  createdBy: z.string().uuid().optional(),
  rulesVersion: z.number().int().default(1),
  updatedAt: z.string().optional()
});
export type Opportunity = z.infer<typeof OpportunitySchema>;

// Branded type for ranker guarantee
export type EligibleOpportunity = Opportunity & {
  readonly __brand: unique symbol;
  eligibilityResult: EligibilityResult;
};

// ==========================================
// Ranking Engine Types
// ==========================================
export interface CandidateSkillCredit {
  skillId: string;
  credit: number; // 0 to 1.0
  candidateProficiency: number;
  relation: 'same' | 'related' | 'none';
  confirmed: boolean;
  aiAssisted?: boolean;
}

export interface RankingWeights {
  version: string;
  skill: number; // 0.55
  preference: number; // 0.30
  proficiency: number; // 0.15
}

export interface ScoreComponents {
  skillFit: number;
  preferenceFit: number;
  proficiencyFit: number;
  commuteFit?: number;
  payFit?: number;
  shiftFit?: number;
  workTypeFit?: number;
  sectorFit?: number;
  distanceKm?: number;
}

export interface RankedOpportunity {
  opportunityId: string;
  rank: number;
  score: number;
  components: ScoreComponents;
  aiAssistedSkills: string[];
}

// ==========================================
// Explanation Types
// ==========================================
export type Locale = 'en' | 'hi' | 'mr';

export interface EligibleExplanation {
  headline: string;
  reasons: string[];
  criteria: { label: string; outcome: Outcome }[];
  gaps: string[];
}

export interface NotEligibleExplanation {
  strip: string;
  details: { label: string; candidateValue: string | null; requiredValue: string }[];
  fixHint?: 'changeable_by_qualification' | 'changeable_by_certification' | 'not_changeable_by_learning';
}

export interface NeedsInfoExplanation {
  message: string;
  missingFields: string[];
}

// ==========================================
// Learning Catalogue & Pathways
// ==========================================
export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  durationHours: number;
  level: string; // 'beginner' | 'intermediate' | 'advanced'
  mode: string; // 'online' | 'offline' | 'hybrid'
  language: string;
  costInr: number;
  url?: string;
  qualificationAwardedOrdinal?: number;
  skillsTaught: { skillId: string; levelReached: number }[];
  prerequisites: string[]; // resource ids
}

export interface PathwayStep {
  resource: LearningResource;
  hours: number;
  skillsGained: string[];
  why: string;
  isPrerequisite?: boolean;
}

export interface PathwayResult {
  steps: PathwayStep[];
  totalHours: number;
  totalCostInr: number;
  unmetSkills: string[];
  noCourse: boolean;
  qualificationAwarded?: number;
}

// ==========================================
// Match Result (Cache & API output)
// ==========================================
export interface MatchDiff {
  newlyEligible: string[];
  noLongerEligible: string[];
  rankMoved: number;
}

export interface MatchResultDTO {
  opportunityId: string;
  title: string;
  orgName?: string;
  location?: string;
  status: MatchStatus;
  rank?: number;
  score?: number;
  reasons?: string[];
  criteria?: { label: string; outcome: Outcome }[];
  gaps?: string[];
  aiAssisted?: string[];
  failedRules?: { label: string; candidateValue: string | null; requiredValue: string; outcome: Outcome }[];
  missingFields?: string[];
  fixHint?: string;
  preferenceAttrs?: PreferenceAttrs;
  closesOn?: string;
}

export interface MatchesResponse {
  profileVersion: number;
  eligible: MatchResultDTO[];
  notEligible: MatchResultDTO[];
  needsInfo: MatchResultDTO[];
  changes?: MatchDiff;
}

// ==========================================
// SSE Events
// ==========================================
export interface MatchesUpdatedEvent {
  type: 'matches.updated';
  profileVersion: number;
  changes: MatchDiff;
}

// ==========================================
// District Centroid
// ==========================================
export interface DistrictCentroid {
  state: string;
  district: string;
  lat: number;
  lng: number;
}
