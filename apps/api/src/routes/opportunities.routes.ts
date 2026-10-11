import { Router } from 'express';
import { requireAuth, requireRole, AuthenticatedRequest } from '../services/auth.service.js';
import { store } from '../db/store.js';
import { evaluateOpportunity, Rule } from '@rozgarlink/eligibility-engine';
import { matchOrchestrator } from '../services/match-orchestrator.js';
import { sseGateway } from '../services/sse.service.js';

export const opportunitiesRouter = Router();

// GET /v1/opportunities (List all)
opportunitiesRouter.get('/', (req, res) => {
  const opps = store.getAllOpportunities();
  return res.json({ opportunities: opps });
});

// GET /v1/opportunities/:id
opportunitiesRouter.get('/:id', (req, res) => {
  const opp = store.getOpportunityById(req.params.id);
  if (!opp) {
    return res.status(404).json({
      type: 'https://rozgarlink.gov.in/errors/not-found',
      title: 'Opportunity not found',
      status: 404
    });
  }
  return res.json({ opportunity: opp });
});

// POST /v1/opportunities (Create - Officer / Admin)
opportunitiesRouter.post('/', requireAuth, requireRole('officer', 'admin'), (req: AuthenticatedRequest, res) => {
  const { title, orgName, workDescription, state, district, lat, lng, preferenceAttrs, rules, skills, closesOn, referenceDate } = req.body;

  if (!title) {
    return res.status(400).json({
      type: 'https://rozgarlink.gov.in/errors/bad-request',
      title: 'Title is required',
      status: 400
    });
  }

  // Validate rules for conflicts (e.g. min age > max age)
  if (Array.isArray(rules)) {
    for (const r of rules) {
      if (r.type === 'AGE_RANGE' && r.value) {
        const min = Number(r.value.min);
        const max = Number(r.value.max);
        if (min && max && min > max) {
          return res.status(422).json({
            type: 'https://rozgarlink.gov.in/errors/conflict-rules',
            title: 'Conflicting rule configuration',
            status: 422,
            detail: `Minimum age (${min}) cannot be greater than maximum age (${max})`
          });
        }
      }
    }
  }

  const newOppId = `OP-${Date.now().toString().slice(-4)}`;
  const opp = {
    id: newOppId,
    title,
    orgName: orgName || 'State Employment Directorate',
    workDescription: workDescription || '',
    state: state || 'Maharashtra',
    district: district || 'Pune',
    lat: lat || 18.5204,
    lng: lng || 73.8567,
    status: 'open',
    closesOn: closesOn || '2027-12-31',
    referenceDate: referenceDate || '2027-01-01',
    preferenceAttrs: preferenceAttrs || {},
    rules: rules || [],
    skills: skills || []
  };

  store.upsertOpportunity(opp, req.user?.userId);

  // Trigger recompute for candidates in background
  setTimeout(async () => {
    for (const c of store.candidates.values()) {
      await matchOrchestrator.recompute(c.id);
    }
  }, 10);

  return res.status(201).json({ opportunity: opp });
});

// PUT /v1/opportunities/:id (Update rules / details - Officer / Admin)
// Scenario I: Officer changes a rule on a live opportunity -> pushes SSE update!
opportunitiesRouter.put('/:id', requireAuth, requireRole('officer', 'admin'), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const existing = store.getOpportunityById(id);
  if (!existing) {
    return res.status(404).json({
      type: 'https://rozgarlink.gov.in/errors/not-found',
      title: 'Opportunity not found',
      status: 404
    });
  }

  const updated = {
    ...existing,
    ...req.body,
    id
  };

  store.upsertOpportunity(updated, req.user?.userId);

  // Recompute affected candidates and broadcast update
  const affectedCandidateIds: string[] = [];
  for (const c of store.candidates.values()) {
    const diffRes = await matchOrchestrator.recompute(c.id);
    affectedCandidateIds.push(c.id);
  }

  return res.json({
    opportunity: updated,
    recomputedCandidatesCount: affectedCandidateIds.length
  });
});

// POST /v1/opportunities/:id/preview-eligibility (Officer preview: candidate count by status)
opportunitiesRouter.post('/:id/preview-eligibility', requireAuth, requireRole('officer', 'admin'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const opp = store.getOpportunityById(id);
  if (!opp) {
    return res.status(404).json({
      type: 'https://rozgarlink.gov.in/errors/not-found',
      title: 'Opportunity not found',
      status: 404
    });
  }

  const rulesToEvaluate: Rule[] = (req.body.rules || opp.rules).map((r: any) => ({
    id: r.id,
    type: r.type,
    operator: r.operator,
    value: r.value,
    label: r.label,
    requiresVerification: r.requiresVerification ?? false,
    version: 1,
    referenceDate: r.referenceDate || opp.referenceDate
  }));

  let eligibleCount = 0;
  let notEligibleCount = 0;
  let needsInfoCount = 0;

  const candidateBreakdown: { candidateName: string; status: string; failedRules?: string[] }[] = [];

  for (const cand of store.candidates.values()) {
    const highestOrdinal = cand.qualifications.reduce((max, q) => (q.levelOrdinal > max ? q.levelOrdinal : max), 0);
    const facts = {
      state: cand.state,
      district: cand.district,
      dob: cand.dob,
      highestQualification: cand.qualifications.find((q) => q.levelOrdinal === highestOrdinal),
      qualifications: cand.qualifications.map((q) => ({ ordinal: q.levelOrdinal, fieldCode: q.fieldCode, verified: q.verified })),
      certifications: cand.certifications.map((c) => ({ code: c.code, name: c.name, verified: c.verified })),
      experienceMonths: cand.experience.reduce((acc, e) => {
        acc[e.domainCode] = e.months;
        return acc;
      }, {} as Record<string, number>),
      attributes: {}
    };

    const evalRes = evaluateOpportunity(rulesToEvaluate, facts);
    if (evalRes.status === 'ELIGIBLE') {
      eligibleCount++;
    } else if (evalRes.status === 'NOT_ELIGIBLE') {
      notEligibleCount++;
    } else {
      needsInfoCount++;
    }

    candidateBreakdown.push({
      candidateName: cand.name,
      status: evalRes.status,
      failedRules: evalRes.results.filter((r) => r.outcome === 'FAIL').map((r) => r.label)
    });
  }

  return res.json({
    opportunityId: id,
    summary: {
      totalSampleCandidates: store.candidates.size,
      eligibleCount,
      notEligibleCount,
      needsInfoCount
    },
    sampleCandidates: candidateBreakdown
  });
});
