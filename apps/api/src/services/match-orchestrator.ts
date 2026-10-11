import {
  CandidateFacts,
  CandidatePreferences,
  CandidateSkillCredit,
  EligibleOpportunity,
  Locale,
  MatchDiff,
  MatchesResponse,
  MatchResultDTO,
  OpportunitySkill
} from '@rozgarlink/shared-types';
import { evaluateOpportunity, Rule } from '@rozgarlink/eligibility-engine';
import { rankEligibleOpportunities, ScoreComponents } from '@rozgarlink/ranking-engine';
import {
  explainEligible,
  explainNeedsInfo,
  explainNotEligible
} from '@rozgarlink/explainer';
import { analyzeSkillGaps } from '@rozgarlink/pathway';
import { store } from '../db/store.js';
import { sseGateway } from './sse.service.js';
import { SeedCandidate, SeedOpportunity } from '../../../../db/seeds/data.js';

export class MatchOrchestrator {
  /**
   * Recomputes matching results for a candidate synchronously,
   * updates cached results, computes state diff, and triggers SSE update.
   */
  async recompute(
    candidateId: string,
    locale: Locale = 'en',
    overrideProfile?: Partial<SeedCandidate>
  ): Promise<MatchesResponse> {
    const candidate = store.getCandidateById(candidateId);
    if (!candidate) {
      throw new Error(`Candidate with id ${candidateId} not found`);
    }

    const effectiveCand: SeedCandidate = overrideProfile
      ? { ...candidate, ...overrideProfile }
      : candidate;

    const previousStored = store.getStoredMatchResults(candidateId);
    const prevEligibleIds = new Set(
      previousStored.filter((m) => m.status === 'ELIGIBLE').map((m) => m.opportunityId)
    );
    const prevRanks = new Map<string, number>();
    for (const p of previousStored) {
      if (p.rank) prevRanks.set(p.opportunityId, p.rank);
    }

    // 1. Build CandidateFacts for eligibility engine
    const highestOrdinal = effectiveCand.qualifications.reduce(
      (max, q) => (q.levelOrdinal > max ? q.levelOrdinal : max),
      0
    );
    const highestQual = effectiveCand.qualifications.find((q) => q.levelOrdinal === highestOrdinal);

    const facts: CandidateFacts = {
      state: effectiveCand.state,
      district: effectiveCand.district,
      dob: effectiveCand.dob,
      highestQualification: highestQual
        ? { ordinal: highestQual.levelOrdinal, fieldCode: highestQual.fieldCode, verified: highestQual.verified }
        : undefined,
      qualifications: effectiveCand.qualifications.map((q) => ({
        ordinal: q.levelOrdinal,
        fieldCode: q.fieldCode,
        verified: q.verified
      })),
      certifications: effectiveCand.certifications.map((c) => ({
        code: c.code,
        name: c.name,
        validTill: c.validTill,
        verified: c.verified
      })),
      experienceMonths: effectiveCand.experience.reduce((acc, exp) => {
        acc[exp.domainCode] = exp.months;
        return acc;
      }, {} as Record<string, number>),
      attributes: {}
    };

    // 2. Candidate skill credits for ranking
    const candidateSkillCredits: CandidateSkillCredit[] = effectiveCand.skills.map((s) => ({
      skillId: s.skillId,
      credit: 1.0, // confirmed or stated
      candidateProficiency: s.proficiency,
      relation: 'same',
      confirmed: s.confirmed,
      aiAssisted: s.source === 'ai'
    }));

    // 3. Prefilter opportunities: open status
    const allOpportunities = store.getAllOpportunities().filter((o) => o.status === 'open');

    const eligibleOpportunitiesToRank: {
      opportunity: EligibleOpportunity;
      skills: OpportunitySkill[];
      rulesResults: any;
    }[] = [];

    const notEligibleResults: MatchResultDTO[] = [];
    const needsInfoResults: MatchResultDTO[] = [];

    // 4. Pure Eligibility Evaluation (Zero AI, deterministic, no short-circuit)
    for (const opp of allOpportunities) {
      const oppRules: Rule[] = opp.rules.map((r) => ({
        id: r.id,
        type: r.type,
        operator: r.operator,
        value: r.value,
        label: r.label,
        requiresVerification: r.requiresVerification,
        version: 1,
        referenceDate: r.referenceDate || opp.referenceDate
      }));

      const eligResult = evaluateOpportunity(oppRules, facts);

      if (eligResult.status === 'ELIGIBLE') {
        const brandedOpp = {
          ...opp,
          eligibilityResult: eligResult
        } as unknown as EligibleOpportunity;

        eligibleOpportunitiesToRank.push({
          opportunity: brandedOpp,
          skills: opp.skills,
          rulesResults: eligResult.results
        });
      } else if (eligResult.status === 'NOT_ELIGIBLE') {
        const failedRules = eligResult.results.filter((r) => r.outcome === 'FAIL');
        const explanation = explainNotEligible(failedRules, locale);

        notEligibleResults.push({
          opportunityId: opp.id,
          title: opp.title,
          orgName: opp.orgName,
          location: `${opp.district}, ${opp.state}`,
          status: 'NOT_ELIGIBLE',
          failedRules: failedRules.map((f) => ({
            label: f.label,
            candidateValue: f.candidateValue,
            requiredValue: f.requiredValue,
            outcome: f.outcome
          })),
          fixHint: explanation.fixHint,
          preferenceAttrs: opp.preferenceAttrs,
          closesOn: opp.closesOn
        });
      } else if (eligResult.status === 'NEEDS_INFO') {
        const unknownRules = eligResult.results.filter((r) => r.outcome === 'UNKNOWN');
        const explanation = explainNeedsInfo(unknownRules, locale);

        needsInfoResults.push({
          opportunityId: opp.id,
          title: opp.title,
          orgName: opp.orgName,
          location: `${opp.district}, ${opp.state}`,
          status: 'NEEDS_INFO',
          missingFields: explanation.missingFields,
          preferenceAttrs: opp.preferenceAttrs,
          closesOn: opp.closesOn
        });
      }
    }

    // 5. Ranking Engine (Rank ONLY ELIGIBLE items)
    const rankedList = rankEligibleOpportunities(
      eligibleOpportunitiesToRank.map((e) => ({
        opportunity: e.opportunity,
        skills: e.skills
      })),
      candidateSkillCredits,
      effectiveCand.preferences,
      effectiveCand.district
    );

    const eligibleResults: MatchResultDTO[] = [];
    for (const ranked of rankedList) {
      const found = eligibleOpportunitiesToRank.find(
        (e) => e.opportunity.id === ranked.opportunityId
      )!;

      const gaps = analyzeSkillGaps(found.skills, candidateSkillCredits);

      const criteria = found.rulesResults.map((r: any) => ({
        label: r.label,
        outcome: r.outcome
      }));

      const explanation = explainEligible(
        ranked.rank,
        ranked.score,
        ranked.components,
        criteria,
        gaps.missingSkills,
        locale
      );

      eligibleResults.push({
        opportunityId: found.opportunity.id,
        title: found.opportunity.title,
        orgName: found.opportunity.orgName,
        location: `${found.opportunity.district}, ${found.opportunity.state}`,
        status: 'ELIGIBLE',
        rank: ranked.rank,
        score: ranked.score,
        reasons: explanation.reasons,
        criteria: explanation.criteria,
        gaps: explanation.gaps,
        aiAssisted: ranked.aiAssistedSkills,
        preferenceAttrs: found.opportunity.preferenceAttrs,
        closesOn: found.opportunity.closesOn
      });
    }

    // 6. Compute Diff against previous results
    const newEligibleIds = new Set(eligibleResults.map((e) => e.opportunityId));
    const newlyEligible: string[] = [];
    for (const id of newEligibleIds) {
      if (!prevEligibleIds.has(id)) {
        newlyEligible.push(id);
      }
    }

    const noLongerEligible: string[] = [];
    for (const id of prevEligibleIds) {
      if (!newEligibleIds.has(id)) {
        noLongerEligible.push(id);
      }
    }

    let rankMoved = 0;
    for (const e of eligibleResults) {
      const prevRank = prevRanks.get(e.opportunityId);
      if (prevRank !== undefined && e.rank !== undefined && prevRank !== e.rank) {
        rankMoved++;
      }
    }

    const changes: MatchDiff = {
      newlyEligible,
      noLongerEligible,
      rankMoved
    };

    // 7. Save to cache if not an ephemeral what-if run
    if (!overrideProfile) {
      const allResults = [...eligibleResults, ...notEligibleResults, ...needsInfoResults];
      store.saveMatchResults(candidateId, allResults);

      // Publish SSE event
      sseGateway.broadcastToCandidate(candidateId, {
        type: 'matches.updated',
        profileVersion: 1, // updated version
        changes
      });
    }

    return {
      profileVersion: 1,
      eligible: eligibleResults,
      notEligible: notEligibleResults,
      needsInfo: needsInfoResults,
      changes
    };
  }
}

export const matchOrchestrator = new MatchOrchestrator();
