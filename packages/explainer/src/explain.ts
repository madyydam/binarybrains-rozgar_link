import {
  EligibleExplanation,
  Locale,
  NeedsInfoExplanation,
  NotEligibleExplanation,
  Outcome,
  RuleResult,
  ScoreComponents
} from '@rozgarlink/shared-types';
import { en, TranslationKey } from './locales/en.js';
import { hi } from './locales/hi.js';
import { mr } from './locales/mr.js';

const CATALOGS: Record<Locale, Record<TranslationKey, string>> = {
  en,
  hi,
  mr
};

export function t(key: TranslationKey, locale: Locale = 'en', vars: Record<string, string | number> = {}): string {
  const catalog = CATALOGS[locale] || CATALOGS.en;
  let str = catalog[key] || CATALOGS.en[key] || '';

  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return str;
}

export function explainEligible(
  rank: number,
  score: number,
  components: ScoreComponents,
  criteria: { label: string; outcome: Outcome }[] = [],
  missingSkills: string[] = [],
  locale: Locale = 'en'
): EligibleExplanation {
  const headline = t('eligible_headline', locale, { rank, score });
  const reasons: string[] = [];

  // 1. Skills Reason
  if (components.skillFit >= 0.95) {
    reasons.push(t('reason_skills_all', locale, { n: criteria.length || 'all' }));
  } else if (components.skillFit >= 0.7) {
    reasons.push(t('reason_related_skill', locale));
  }

  // 2. Commute Reason
  if (components.distanceKm !== undefined) {
    if (components.commuteFit && components.commuteFit >= 0.9) {
      reasons.push(
        t('reason_commute_within', locale, {
          dist: components.distanceKm,
          pref: 15
        })
      );
    } else {
      reasons.push(
        t('reason_commute_close', locale, {
          dist: components.distanceKm
        })
      );
    }
  }

  // 3. Pay & Shift reasons
  if (components.payFit && components.payFit >= 0.9) {
    reasons.push(t('reason_pay_meets', locale, { target: 'target' }));
  }

  if (components.shiftFit && components.shiftFit >= 0.9) {
    reasons.push(t('reason_shift_match', locale, { shift: 'day' }));
  }

  return {
    headline,
    reasons: reasons.slice(0, 3), // top 3 reasons
    criteria,
    gaps: missingSkills
  };
}

export function explainNotEligible(
  failed: RuleResult[],
  locale: Locale = 'en'
): NotEligibleExplanation {
  if (failed.length === 0) {
    return {
      strip: 'Not eligible',
      details: []
    };
  }

  const first = failed[0];
  let strip = '';
  let fixHint: NotEligibleExplanation['fixHint'] = 'not_changeable_by_learning';

  switch (first.type) {
    case 'QUAL_MIN_LEVEL':
      strip = t('fail_qual', locale, {
        required: first.requiredValue,
        current: first.candidateValue || 'None stated'
      });
      fixHint = 'changeable_by_qualification';
      break;

    case 'QUAL_FIELD':
      strip = t('fail_qual_field', locale, {
        required: first.requiredValue,
        current: first.candidateValue || 'None stated'
      });
      fixHint = 'changeable_by_qualification';
      break;

    case 'RESIDENCE_STATE':
      strip = t('fail_residence_state', locale, {
        required: first.requiredValue,
        current: first.candidateValue || 'None stated'
      });
      fixHint = 'not_changeable_by_learning';
      break;

    case 'RESIDENCE_DISTRICT':
      strip = t('fail_residence_district', locale, {
        required: first.requiredValue,
        current: first.candidateValue || 'None stated'
      });
      fixHint = 'not_changeable_by_learning';
      break;

    case 'AGE_RANGE':
      strip = t('fail_age', locale, {
        required: first.requiredValue,
        current: first.candidateValue || 'None stated'
      });
      fixHint = 'not_changeable_by_learning';
      break;

    case 'CERT_REQUIRED':
      strip = t('fail_cert', locale, {
        required: first.requiredValue,
        current: first.candidateValue || 'None'
      });
      fixHint = 'changeable_by_certification';
      break;

    case 'EXPERIENCE_MIN':
      strip = t('fail_exp', locale, {
        required: first.requiredValue,
        current: first.candidateValue || '0'
      });
      fixHint = 'not_changeable_by_learning';
      break;

    default:
      strip = `Not eligible: ${first.label}. Profile: ${first.candidateValue || 'None'}. Required: ${first.requiredValue}`;
      break;
  }

  const details = failed.map((f) => ({
    label: f.label,
    candidateValue: f.candidateValue,
    requiredValue: f.requiredValue
  }));

  return {
    strip,
    details,
    fixHint
  };
}

export function explainNeedsInfo(
  unknown: RuleResult[],
  locale: Locale = 'en'
): NeedsInfoExplanation {
  const missingFields = unknown
    .map((u) => u.missingField)
    .filter((f): f is string => Boolean(f));

  const uniqueFields = Array.from(new Set(missingFields));
  const missingStr = uniqueFields.join(', ') || 'additional details';

  const message = t('needs_info_message', locale, { missing: missingStr });

  return {
    message,
    missingFields: uniqueFields
  };
}

export function getDisclaimer(locale: Locale = 'en'): string {
  return t('disclaimer', locale);
}
