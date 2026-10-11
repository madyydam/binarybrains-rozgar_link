import { evaluateOpportunity } from '@rozgarlink/eligibility-engine';
import { explainMatch, ExplanationResult } from '@rozgarlink/explainer';
import { buildPathway, PathwayResult } from '@rozgarlink/pathway';
import {
  rankEligibleOpportunities,
  scoreEligibleOpportunity
} from '@rozgarlink/ranking-engine';
import {
  CandidatePreferences,
  CandidateSkillCredit,
  EligibleOpportunity,
  OpportunitySkill,
  RankedOpportunity,
  RuleResult
} from '@rozgarlink/shared-types';
import { computeSkillRelation } from '@rozgarlink/skill-core';
import { StoredCandidate, StoredOpportunity } from './seeds.js';
import { store } from './store.js';

export interface OpportunityMatchView {
  opportunity: StoredOpportunity;
  status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_INFO';
  ruleResults: RuleResult[];
  explanation: ExplanationResult;
  rank?: number;
  score?: number;
  components?: RankedOpportunity['components'];
  aiAssistedSkills?: string[];
  pathway?: PathwayResult;
}

export interface MatchesResponse {
  candidateId: string;
  profileVersion: number;
  timestamp: string;
  eligible: OpportunityMatchView[];
  needsInfo: OpportunityMatchView[];
  notEligible: OpportunityMatchView[];
  counts: {
    eligible: number;
    needsInfo: number;
    notEligible: number;
    total: number;
  };
  changes?: {
    newlyEligible: string[];
    noLongerEligible: string[];
    rankMoved: number;
  };
}

// Memory of previous eligible IDs to compute diff
const previousEligibleMap = new Map<string, string[]>();

export function recomputeMatchesForCandidate(
  candidate: StoredCandidate,
  locale: 'en' | 'hi' | 'mr' = 'en',
  customPreferences?: CandidatePreferences
): MatchesResponse {
  const opportunities = store.getAllOpportunities();
  const catalogue = store.getAllCatalogue();

  // Prepare candidate skill credit map against any target skill
  const confirmedSkills = candidate.skills.map((s) => ({
    skillId: s.skillId,
    proficiency: s.proficiency,
    confirmed: s.confirmed
  }));

  const candidatePrefs: CandidatePreferences = customPreferences || {
    commuteKm: candidate.preferences.commuteKm,
    expectedPayMin: candidate.preferences.expectedPayMin,
    shift: candidate.preferences.shift,
    workType: candidate.preferences.workType,
    sector: candidate.preferences.sector,
    weights: candidate.preferences.weights
  };

  const eligibleList: OpportunityMatchView[] = [];
  const needsInfoList: OpportunityMatchView[] = [];
  const notEligibleList: OpportunityMatchView[] = [];

  const eligibleForRanker: {
    opportunity: EligibleOpportunity;
    skills: OpportunitySkill[];
    stored: StoredOpportunity;
    ruleResults: RuleResult[];
    candCredits: CandidateSkillCredit[];
  }[] = [];

  for (const opp of opportunities) {
    if (opp.status !== 'open') continue;

    // 1. Evaluate pure eligibility
    const evalResult = evaluateOpportunity(opp.rules, candidate.facts);

    if (evalResult.status === 'NOT_ELIGIBLE') {
      const explanation = explainMatch({
        status: 'NOT_ELIGIBLE',
        ruleResults: evalResult.results,
        locale
      });

      // Compute pathway / blockers for interested candidates
      const failedRulesSimple = evalResult.results
        .filter((r) => r.outcome === 'FAIL')
        .map((r) => ({
          label: r.label,
          type: r.type,
          requiredValue: r.requiredValue,
          minOrdinal: r.type === 'QUAL_MIN_LEVEL' ? Number(r.requiredValue) || 4 : undefined
        }));

      const pathway = buildPathway({
        opportunitySkills: opp.skills.map((s) => ({ skillId: s.skillId, importance: s.importance })),
        candidateSkills: confirmedSkills.map((s) => ({ skillId: s.skillId, credit: 1.0 })),
        completedCourseIds: candidate.completedCourses,
        catalogue,
        failedRules: failedRulesSimple
      });

      notEligibleList.push({
        opportunity: opp,
        status: 'NOT_ELIGIBLE',
        ruleResults: evalResult.results,
        explanation,
        pathway
      });
    } else if (evalResult.status === 'NEEDS_INFO') {
      const explanation = explainMatch({
        status: 'NEEDS_INFO',
        ruleResults: evalResult.results,
        locale
      });

      needsInfoList.push({
        opportunity: opp,
        status: 'NEEDS_INFO',
        ruleResults: evalResult.results,
        explanation
      });
    } else {
      // ELIGIBLE!
      // Compute skill credits for this opportunity
      const candCredits: CandidateSkillCredit[] = [];

      for (const oppSkill of opp.skills) {
        let bestCredit = 0;
        let bestRelationType: 'same' | 'related' | 'none' = 'none';
        let bestAiAssisted = false;
        let bestCandProf = 0;

        for (const cs of confirmedSkills) {
          const rel = computeSkillRelation(cs.skillId, oppSkill.skillId, cs.confirmed);
          if (rel.credit > bestCredit) {
            bestCredit = rel.credit;
            bestRelationType = rel.relationType;
            bestAiAssisted = rel.aiAssisted;
            bestCandProf = cs.proficiency;
          }
        }

        candCredits.push({
          skillId: oppSkill.skillId,
          credit: bestCredit,
          relationType: bestRelationType,
          confirmed: true,
          aiAssisted: bestAiAssisted,
          candidateProficiency: bestCandProf
        });
      }

      const brandedEligible: EligibleOpportunity = {
        id: opp.id,
        title: opp.title,
        state: opp.state,
        district: opp.district,
        lat: opp.lat,
        lng: opp.lng,
        status: opp.status,
        closesOn: opp.closesOn,
        preferenceAttrs: opp.preferenceAttrs,
        rulesVersion: opp.rulesVersion
      };

      eligibleForRanker.push({
        opportunity: brandedEligible,
        skills: opp.skills,
        stored: opp,
        ruleResults: evalResult.results,
        candCredits
      });
    }
  }

  // 2. Rank only ELIGIBLE opportunities
  if (eligibleForRanker.length > 0) {
    const scoredRanked = rankEligibleOpportunities(
      eligibleForRanker.map((item) => ({
        opportunity: item.opportunity,
        skills: item.skills
      })),
      confirmedSkills.map((s) => ({
        skillId: s.skillId,
        credit: 1.0,
        relationType: 'same',
        confirmed: s.confirmed,
        candidateProficiency: s.proficiency
      })),
      candidatePrefs,
      candidate.facts.district
    );

    for (const ranked of scoredRanked) {
      const original = eligibleForRanker.find((e) => e.opportunity.id === ranked.opportunityId)!;
      const matchedNames = original.skills
        .filter((os) => original.candCredits.some((c) => c.skillId === os.skillId && c.credit > 0))
        .map((os) => os.skillId);

      const explanation = explainMatch({
        status: 'ELIGIBLE',
        ruleResults: original.ruleResults,
        components: ranked.components,
        aiAssistedSkills: ranked.aiAssistedSkills,
        matchedSkillNames: matchedNames,
        totalRequiredSkills: original.skills.length,
        locale,
        district: candidate.facts.district,
        preferredCommuteKm: candidatePrefs.commuteKm
      });

      const pathway = buildPathway({
        opportunitySkills: original.skills.map((s) => ({ skillId: s.skillId, importance: s.importance })),
        candidateSkills: original.candCredits.map((c) => ({ skillId: c.skillId, credit: c.credit })),
        completedCourseIds: candidate.completedCourses,
        catalogue
      });

      eligibleList.push({
        opportunity: original.stored,
        status: 'ELIGIBLE',
        ruleResults: original.ruleResults,
        explanation,
        rank: ranked.rank,
        score: ranked.score,
        components: ranked.components,
        aiAssistedSkills: ranked.aiAssistedSkills,
        pathway
      });
    }
  }

  // Sort eligible by rank ascending
  eligibleList.sort((a, b) => (a.rank || 999) - (b.rank || 999));

  // 3. Compute Changes Diff
  const currentEligibleIds = eligibleList.map((e) => e.opportunity.id);
  const prevEligibleIds = previousEligibleMap.get(candidate.id) || [];

  const newlyEligible = currentEligibleIds.filter((id) => !prevEligibleIds.includes(id));
  const noLongerEligible = prevEligibleIds.filter((id) => !currentEligibleIds.includes(id));
  const rankMoved = 0; // calculated when comparing top item index difference

  previousEligibleMap.set(candidate.id, currentEligibleIds);

  return {
    candidateId: candidate.id,
    profileVersion: candidate.profileVersion,
    timestamp: new Date().toISOString(),
    eligible: eligibleList,
    needsInfo: needsInfoList,
    notEligible: notEligibleList,
    counts: {
      eligible: eligibleList.length,
      needsInfo: needsInfoList.length,
      notEligible: notEligibleList.length,
      total: opportunities.length
    },
    changes: {
      newlyEligible,
      noLongerEligible,
      rankMoved
    }
  };
}
