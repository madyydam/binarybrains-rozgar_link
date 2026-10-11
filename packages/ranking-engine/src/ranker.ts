import {
  CandidatePreferences,
  CandidateSkillCredit,
  EligibleOpportunity,
  OpportunitySkill,
  RankedOpportunity,
  ScoreComponents
} from '@rozgarlink/shared-types';
import { calculateHaversineKm, getDistrictCentroid } from './centroids.js';

export const DEFAULT_WEIGHTS = {
  skill: 0.55,
  preference: 0.30,
  proficiency: 0.15
};

export const RELATION_CAPS = {
  sameMin: 0.85,
  relatedMin: 0.70,
  relatedCap: 0.85,
  unconfirmedCap: 0.5
};

export interface RankSingleResult {
  score: number;
  components: ScoreComponents;
  aiAssistedSkills: string[];
}

/**
 * Calculates score components for an eligible opportunity.
 * Accepts ONLY branded EligibleOpportunity.
 */
export function scoreEligibleOpportunity(
  opportunity: EligibleOpportunity,
  candidateSkills: CandidateSkillCredit[],
  candidatePrefs: CandidatePreferences,
  candidateDistrict?: string,
  opportunitySkills: OpportunitySkill[] = []
): RankSingleResult {
  const candidateSkillMap = new Map<string, CandidateSkillCredit>();
  for (const cs of candidateSkills) {
    candidateSkillMap.set(cs.skillId, cs);
  }

  // 1. SkillFit calculation
  let totalSkillWeight = 0;
  let earnedSkillCredit = 0;
  const aiAssistedSkills: string[] = [];
  const proficiencyRatios: number[] = [];

  if (opportunitySkills.length === 0) {
    // If no specific skills required, default full fit
    totalSkillWeight = 1;
    earnedSkillCredit = 1;
  } else {
    for (const os of opportunitySkills) {
      const weight = os.importance === 'required' ? 3 : 1;
      totalSkillWeight += weight;

      const matched = candidateSkillMap.get(os.skillId);
      if (matched) {
        let credit = matched.credit;

        // Apply unconfirmed cap
        if (!matched.confirmed) {
          credit = Math.min(credit, RELATION_CAPS.unconfirmedCap);
        }

        earnedSkillCredit += weight * credit;

        if (matched.aiAssisted) {
          aiAssistedSkills.push(os.skillId);
        }

        // Proficiency ratio for matched skills
        if (credit > 0) {
          const reqProf = os.minProficiency || 1;
          const candProf = matched.candidateProficiency || 1;
          proficiencyRatios.push(Math.min(1.0, candProf / reqProf));
        }
      }
    }
  }

  const skillFit = totalSkillWeight > 0 ? earnedSkillCredit / totalSkillWeight : 1.0;

  // 2. ProficiencyFit calculation
  const proficiencyFit =
    proficiencyRatios.length > 0
      ? proficiencyRatios.reduce((sum, r) => sum + r, 0) / proficiencyRatios.length
      : 1.0;

  // 3. PreferenceFit calculation
  // Commute distance
  let distanceKm: number | undefined;
  let commuteFit = 0.5;

  const candCentroid = getDistrictCentroid(candidateDistrict);
  const oppCentroid =
    opportunity.lat && opportunity.lng
      ? { lat: opportunity.lat, lng: opportunity.lng }
      : getDistrictCentroid(opportunity.district);

  if (candCentroid && oppCentroid) {
    distanceKm = calculateHaversineKm(
      candCentroid.lat,
      candCentroid.lng,
      oppCentroid.lat,
      oppCentroid.lng
    );

    const preferredKm = candidatePrefs.commuteKm || 15;
    if (distanceKm <= preferredKm) {
      commuteFit = 1.0;
    } else if (distanceKm <= preferredKm * 2) {
      commuteFit = Math.max(0, 1.0 - (distanceKm - preferredKm) / preferredKm);
    } else {
      commuteFit = 0.0;
    }
  } else if (
    candidateDistrict &&
    opportunity.district &&
    candidateDistrict.toLowerCase().trim() === opportunity.district.toLowerCase().trim()
  ) {
    distanceKm = 5;
    commuteFit = 1.0;
  }

  if (opportunity.preferenceAttrs?.remote && candidatePrefs.workType.includes('remote')) {
    commuteFit = Math.max(commuteFit, 1.0);
  }

  // Pay Fit
  let payFit = 0.5; // default 0.5 if unstated
  const oppPay = opportunity.preferenceAttrs?.pay?.min ?? opportunity.preferenceAttrs?.pay?.max;
  const targetPay = candidatePrefs.minPay || 10000;

  if (oppPay !== undefined && oppPay > 0) {
    if (oppPay >= targetPay) {
      payFit = 1.0;
    } else {
      payFit = Math.max(0, Math.min(1.0, oppPay / targetPay));
    }
  }

  // Shift Fit
  let shiftFit = 0.5;
  const oppShift = opportunity.preferenceAttrs?.shift;
  if (!oppShift || !candidatePrefs.shift || candidatePrefs.shift === 'flexible') {
    shiftFit = 0.5;
  } else if (oppShift.toLowerCase() === candidatePrefs.shift.toLowerCase()) {
    shiftFit = 1.0;
  } else {
    shiftFit = 0.0; // mismatch lowers rank, never excludes
  }

  // Work Type Fit
  let workTypeFit = 0.5;
  const oppWorkType = opportunity.preferenceAttrs?.workType;
  if (!oppWorkType || !candidatePrefs.workType) {
    workTypeFit = 0.5;
  } else {
    const candTypes = Array.isArray(candidatePrefs.workType)
      ? candidatePrefs.workType
      : [candidatePrefs.workType];
    if (candTypes.length === 0) {
      workTypeFit = 0.5;
    } else if (candTypes.some((wt) => wt.toLowerCase() === oppWorkType.toLowerCase())) {
      workTypeFit = 1.0;
    } else {
      workTypeFit = 0.0;
    }
  }

  // Sector Fit
  let sectorFit = 0.5;
  const oppSector = opportunity.preferenceAttrs?.sector;
  if (!oppSector || !candidatePrefs.sector) {
    sectorFit = 0.5;
  } else {
    const candSectors = Array.isArray(candidatePrefs.sector)
      ? candidatePrefs.sector
      : [candidatePrefs.sector];
    if (candSectors.length === 0) {
      sectorFit = 0.5;
    } else if (candSectors.some((s) => s.toLowerCase() === oppSector.toLowerCase())) {
      sectorFit = 1.0;
    } else {
      sectorFit = 0.0;
    }
  }

  // Candidate preference weights
  const weights = candidatePrefs.weights || { commute: 0.25, pay: 0.25, shift: 0.25, workType: 0.25 };
  const wCommute = weights.commute ?? 0.25;
  const wPay = weights.pay ?? 0.25;
  const wShift = weights.shift ?? 0.25;
  const wWorkType = weights.workType ?? 0.25;
  const totalW = wCommute + wPay + wShift + wWorkType || 1.0;

  const preferenceFit =
    (wCommute * commuteFit + wPay * payFit + wShift * shiftFit + wWorkType * workTypeFit) / totalW;

  // Composite Score: 100 * (0.55 * skillFit + 0.30 * preferenceFit + 0.15 * proficiencyFit)
  const compositeScore =
    100 *
    (DEFAULT_WEIGHTS.skill * skillFit +
      DEFAULT_WEIGHTS.preference * preferenceFit +
      DEFAULT_WEIGHTS.proficiency * proficiencyFit);

  const roundedScore = Math.round(compositeScore);

  const components: ScoreComponents = {
    skillFit: Math.round(skillFit * 100) / 100,
    preferenceFit: Math.round(preferenceFit * 100) / 100,
    proficiencyFit: Math.round(proficiencyFit * 100) / 100,
    commuteFit: Math.round(commuteFit * 100) / 100,
    payFit: Math.round(payFit * 100) / 100,
    shiftFit: Math.round(shiftFit * 100) / 100,
    workTypeFit: Math.round(workTypeFit * 100) / 100,
    sectorFit: Math.round(sectorFit * 100) / 100,
    distanceKm
  };

  return {
    score: roundedScore,
    components,
    aiAssistedSkills
  };
}

/**
 * Ranks an array of eligible opportunities with tie-breakers.
 */
export function rankEligibleOpportunities(
  opportunities: {
    opportunity: EligibleOpportunity;
    skills: OpportunitySkill[];
  }[],
  candidateSkills: CandidateSkillCredit[],
  candidatePrefs: CandidatePreferences,
  candidateDistrict?: string
): RankedOpportunity[] {
  const scored = opportunities.map(({ opportunity, skills }) => {
    const res = scoreEligibleOpportunity(
      opportunity,
      candidateSkills,
      candidatePrefs,
      candidateDistrict,
      skills
    );

    return {
      opportunity,
      opportunityId: opportunity.id,
      score: res.score,
      components: res.components,
      aiAssistedSkills: res.aiAssistedSkills,
      skillFit: res.components.skillFit,
      closesOn: opportunity.closesOn || '9999-12-31',
      updatedAt: opportunity.updatedAt || ''
    };
  });

  // Tie-breaker:
  // 1. Higher score
  // 2. Higher skillFit
  // 3. Nearer closesOn
  // 4. Newer updatedAt
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.skillFit !== a.skillFit) return b.skillFit - a.skillFit;
    if (a.closesOn !== b.closesOn) return a.closesOn.localeCompare(b.closesOn);
    return b.updatedAt.localeCompare(a.updatedAt);
  });

  return scored.map((item, index) => ({
    opportunityId: item.opportunityId,
    rank: index + 1,
    score: item.score,
    components: item.components,
    aiAssistedSkills: item.aiAssistedSkills
  }));
}
