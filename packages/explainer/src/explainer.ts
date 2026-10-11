import { RuleResult, ScoreComponents } from '@rozgarlink/shared-types';
import { SupportedLocale, TRANSLATIONS } from './translations.js';

export interface ExplanationResult {
  locale: SupportedLocale;
  status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_INFO';
  headline: string;
  points: string[];
  failedRules: {
    ruleId: string;
    label: string;
    candidateValue: string | null;
    requiredValue: string;
  }[];
  missingFields: string[];
}

export interface ExplainerParams {
  status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_INFO';
  ruleResults: RuleResult[];
  components?: ScoreComponents;
  aiAssistedSkills?: string[];
  matchedSkillNames?: string[];
  totalRequiredSkills?: number;
  locale?: SupportedLocale;
  district?: string;
  preferredCommuteKm?: number;
}

export function explainMatch(params: ExplainerParams): ExplanationResult {
  const locale = params.locale || 'en';
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;
  const points: string[] = [];
  const failedRules: ExplanationResult['failedRules'] = [];
  const missingFields: string[] = [];

  // Order priority for failure explanation: Qualification -> Certification -> Experience -> Residence -> Age -> Attribute
  const priorityOrder: Record<string, number> = {
    QUAL_MIN_LEVEL: 1,
    QUAL_FIELD: 2,
    CERT_REQUIRED: 3,
    EXPERIENCE_MIN: 4,
    RESIDENCE_STATE: 5,
    RESIDENCE_DISTRICT: 6,
    AGE_RANGE: 7,
    ATTRIBUTE: 8
  };

  if (params.status === 'NOT_ELIGIBLE') {
    const fails = params.ruleResults
      .filter((r) => r.outcome === 'FAIL')
      .sort((a, b) => (priorityOrder[a.type] || 99) - (priorityOrder[b.type] || 99));

    for (const f of fails) {
      failedRules.push({
        ruleId: f.ruleId,
        label: f.label,
        candidateValue: f.candidateValue,
        requiredValue: f.requiredValue
      });

      const candStr = f.candidateValue ? `${t.yourValue.replace('{value}', f.candidateValue)}` : 'Not stated';
      const reqStr = `${t.requiredValue.replace('{value}', f.requiredValue)}`;
      points.push(`${f.label} (${candStr} • ${reqStr})`);
    }

    return {
      locale,
      status: 'NOT_ELIGIBLE',
      headline: t.notEligibleTitle,
      points,
      failedRules,
      missingFields: []
    };
  }

  if (params.status === 'NEEDS_INFO') {
    const unknowns = params.ruleResults.filter((r) => r.outcome === 'UNKNOWN');
    for (const u of unknowns) {
      const field = u.missingField || u.type.toLowerCase();
      missingFields.push(field);
      points.push(t.missingFieldNotice.replace('{field}', field));
    }

    return {
      locale,
      status: 'NEEDS_INFO',
      headline: t.needsInfoTitle,
      points,
      failedRules: [],
      missingFields
    };
  }

  // ELIGIBLE
  if (params.components) {
    const comp = params.components;
    const matched = params.matchedSkillNames?.length || 0;
    const total = params.totalRequiredSkills || matched;

    if (comp.skillFit >= 0.8) {
      points.push(
        t.strongSkillFit
          .replace('{matched}', String(matched))
          .replace('{total}', String(total))
          .replace('{skills}', params.matchedSkillNames?.join(', ') || 'required skills')
      );
    } else if (comp.skillFit > 0) {
      points.push(
        t.partialSkillFit
          .replace('{matched}', String(matched))
          .replace('{total}', String(total))
      );
    }

    if (comp.distanceKm !== undefined) {
      const prefKm = params.preferredCommuteKm || 20;
      if (comp.distanceKm <= prefKm) {
        points.push(
          t.closeCommute
            .replace('{km}', String(Math.round(comp.distanceKm)))
            .replace('{district}', params.district || 'home')
        );
      } else {
        points.push(
          t.farCommute
            .replace('{km}', String(Math.round(comp.distanceKm)))
            .replace('{prefKm}', String(prefKm))
        );
      }
    }

    if (comp.shiftFit === 1.0) {
      points.push(t.shiftMatch.replace('{shift}', 'preferred'));
    }
    if (comp.workTypeFit === 1.0) {
      points.push(t.workTypeMatch.replace('{workType}', 'preferred'));
    }
  }

  if (params.aiAssistedSkills && params.aiAssistedSkills.length > 0) {
    points.push(t.aiAssistedNotice.replace('{skills}', params.aiAssistedSkills.join(', ')));
  }

  return {
    locale,
    status: 'ELIGIBLE',
    headline: t.eligibleTitle,
    points,
    failedRules: [],
    missingFields: []
  };
}

export function explainEligible(
  rank: number,
  score: number,
  components: any,
  passedRules: { label: string; outcome?: string }[],
  aiAssistedSkills: string[] = [],
  locale: SupportedLocale = 'en'
) {
  return {
    headline: `Ranked #${rank} (Score: ${score}%)`,
    reasons: [
      `Fit score of ${score}% based on skills, location, and preferences`,
      components?.commuteFit ? `Within desired commute distance` : `Commute fit: ${components?.distanceKm || 0} km`
    ],
    criteria: passedRules.map((r) => r.label),
    aiNotice: aiAssistedSkills.length > 0 ? `AI-assisted skills: ${aiAssistedSkills.join(', ')}` : null
  };
}

export function explainNotEligible(
  failedRules: { label: string; candidateValue: string | null; requiredValue: string }[],
  locale: SupportedLocale = 'en'
) {
  const parts = failedRules.map(
    (f) => `${f.label} (Required: ${f.requiredValue}, Profile: ${f.candidateValue || 'none'})`
  );
  return {
    strip: `Not eligible: ${parts.join('; ')}`,
    failedRules
  };
}

export function getDisclaimer(locale: SupportedLocale = 'en') {
  return 'Eligibility follows the criteria stated by the opportunity. Confirm with the issuing office before applying.';
}

