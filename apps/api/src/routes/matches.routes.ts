import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../services/auth.service.js';
import { store } from '../db/store.js';
import { matchOrchestrator } from '../services/match-orchestrator.js';
import { analyzeSkillGaps, buildLearningPathway } from '@rozgarlink/pathway';
import { Locale } from '@rozgarlink/shared-types';

export const matchesRouter = Router();

function getCandidateId(req: AuthenticatedRequest): string | null {
  if (req.user?.candidateId) return req.user.candidateId;
  if (req.user?.userId) {
    const cand = store.getCandidateByUserId(req.user.userId);
    return cand?.id || null;
  }
  return null;
}

// GET /v1/matches
matchesRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const candidateId = getCandidateId(req);
  if (!candidateId) {
    return res.status(403).json({
      type: 'https://rozgarlink.gov.in/errors/forbidden',
      title: 'Only candidates can view matches',
      status: 403
    });
  }

  const locale = (req.query.locale as Locale) || 'en';
  const matchResult = await matchOrchestrator.recompute(candidateId, locale);

  const statusFilter = req.query.status as string;
  if (statusFilter === 'eligible') {
    return res.json({ ...matchResult, notEligible: [], needsInfo: [] });
  } else if (statusFilter === 'not_eligible') {
    return res.json({ ...matchResult, eligible: [], needsInfo: [] });
  } else if (statusFilter === 'needs_info') {
    return res.json({ ...matchResult, eligible: [], notEligible: [] });
  }

  return res.json(matchResult);
});

// GET /v1/matches/:opportunityId (Full breakdown)
matchesRouter.get('/:opportunityId', requireAuth, async (req: AuthenticatedRequest, res) => {
  const candidateId = getCandidateId(req);
  if (!candidateId) {
    return res.status(403).json({
      type: 'https://rozgarlink.gov.in/errors/forbidden',
      title: 'Forbidden',
      status: 403
    });
  }

  const { opportunityId } = req.params;
  const opp = store.getOpportunityById(opportunityId);
  if (!opp) {
    return res.status(404).json({
      type: 'https://rozgarlink.gov.in/errors/not-found',
      title: 'Opportunity not found',
      status: 404
    });
  }

  const storedMatches = store.getStoredMatchResults(candidateId);
  const match = storedMatches.find((m) => m.opportunityId === opportunityId);

  return res.json({
    opportunity: opp,
    matchResult: match || null
  });
});

// POST /v1/matches/whatif (Hypothetical preview)
matchesRouter.post('/whatif', requireAuth, async (req: AuthenticatedRequest, res) => {
  const candidateId = getCandidateId(req);
  if (!candidateId) {
    return res.status(403).json({
      type: 'https://rozgarlink.gov.in/errors/forbidden',
      title: 'Forbidden',
      status: 403
    });
  }

  const { state, district, addQualificationOrdinal, addSkills } = req.body;
  const candidate = store.getCandidateById(candidateId);
  if (!candidate) {
    return res.status(404).json({
      type: 'https://rozgarlink.gov.in/errors/not-found',
      title: 'Candidate not found',
      status: 404
    });
  }

  // Clone candidate with hypothetical overrides
  const hypotheticalCandidate = JSON.parse(JSON.stringify(candidate));
  if (state) hypotheticalCandidate.state = state;
  if (district) hypotheticalCandidate.district = district;
  if (addQualificationOrdinal) {
    hypotheticalCandidate.qualifications.push({
      id: 'whatif-q',
      levelOrdinal: Number(addQualificationOrdinal),
      fieldCode: 'General',
      verified: true
    });
  }
  if (Array.isArray(addSkills)) {
    for (const sk of addSkills) {
      hypotheticalCandidate.skills.push({
        skillId: sk,
        proficiency: 3,
        source: 'manual',
        confirmed: true
      });
    }
  }

  // Run recompute with override (not saved)
  const result = await matchOrchestrator.recompute(candidateId, 'en', hypotheticalCandidate);

  return res.json({
    whatIf: true,
    ...result
  });
});

// POST /v1/interests (Mark interested + get gap & pathway)
matchesRouter.post('/interests', requireAuth, (req: AuthenticatedRequest, res) => {
  const candidateId = getCandidateId(req);
  if (!candidateId) {
    return res.status(403).json({
      type: 'https://rozgarlink.gov.in/errors/forbidden',
      title: 'Forbidden',
      status: 403
    });
  }

  const { opportunityId } = req.body;
  const opp = store.getOpportunityById(opportunityId);
  if (!opp) {
    return res.status(404).json({
      type: 'https://rozgarlink.gov.in/errors/not-found',
      title: 'Opportunity not found',
      status: 404
    });
  }

  store.markInterest(candidateId, opportunityId);

  const candidate = store.getCandidateById(candidateId)!;
  const candSkillCredits = candidate.skills.map((s) => ({
    skillId: s.skillId,
    credit: 1.0,
    candidateProficiency: s.proficiency,
    relation: 'same' as const,
    confirmed: s.confirmed
  }));

  const gaps = analyzeSkillGaps(opp.skills, candSkillCredits);
  const catalogue = Array.from(store.learningResources.values());
  const completedIds = Array.from(store.completedCourses.get(candidateId) || []);

  const pathway = buildLearningPathway(gaps.missingSkills, catalogue, completedIds);

  return res.json({
    opportunityId,
    gaps,
    pathway
  });
});

// GET /v1/opportunities/:id/gap
matchesRouter.get('/opportunities/:id/gap', requireAuth, (req: AuthenticatedRequest, res) => {
  const candidateId = getCandidateId(req);
  if (!candidateId) {
    return res.status(403).json({
      type: 'https://rozgarlink.gov.in/errors/forbidden',
      title: 'Forbidden',
      status: 403
    });
  }

  const { id } = req.params;
  const opp = store.getOpportunityById(id);
  if (!opp) {
    return res.status(404).json({
      type: 'https://rozgarlink.gov.in/errors/not-found',
      title: 'Opportunity not found',
      status: 404
    });
  }

  const candidate = store.getCandidateById(candidateId)!;
  const candSkillCredits = candidate.skills.map((s) => ({
    skillId: s.skillId,
    credit: 1.0,
    candidateProficiency: s.proficiency,
    relation: 'same' as const,
    confirmed: s.confirmed
  }));

  const gaps = analyzeSkillGaps(opp.skills, candSkillCredits);
  const catalogue = Array.from(store.learningResources.values());
  const completedIds = Array.from(store.completedCourses.get(candidateId) || []);
  const pathway = buildLearningPathway(gaps.missingSkills, catalogue, completedIds);

  return res.json({
    opportunityId: id,
    gaps,
    pathway
  });
});

// POST /v1/learning/complete
matchesRouter.post('/learning/complete', requireAuth, async (req: AuthenticatedRequest, res) => {
  const candidateId = getCandidateId(req);
  if (!candidateId) {
    return res.status(403).json({
      type: 'https://rozgarlink.gov.in/errors/forbidden',
      title: 'Forbidden',
      status: 403
    });
  }

  const { resourceId } = req.body;
  const ok = store.completeCourse(candidateId, resourceId);
  if (!ok) {
    return res.status(404).json({
      type: 'https://rozgarlink.gov.in/errors/not-found',
      title: 'Course not found in catalogue',
      status: 404
    });
  }

  const matchResult = await matchOrchestrator.recompute(candidateId);

  return res.json({
    completed: true,
    resourceId,
    changes: matchResult.changes
  });
});

// POST /v1/matches/:opportunityId/flag
matchesRouter.post('/:opportunityId/flag', requireAuth, (req: AuthenticatedRequest, res) => {
  const candidateId = getCandidateId(req);
  if (!candidateId) {
    return res.status(403).json({
      type: 'https://rozgarlink.gov.in/errors/forbidden',
      title: 'Forbidden',
      status: 403
    });
  }

  const { opportunityId } = req.params;
  const { reason } = req.body;

  const ticket = store.flagMatch(candidateId, opportunityId, reason || 'Contested decision');

  return res.status(201).json({
    message: 'Flag submitted for review. An officer will inspect the decision trace.',
    ticket
  });
});
