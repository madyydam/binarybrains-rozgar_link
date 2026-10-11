import { Router } from 'express';
import { requireAuth, requireRole, AuthenticatedRequest } from '../services/auth.service.js';
import { store } from '../db/store.js';

export const auditRouter = Router();

// GET /v1/audit (Search & Filter audit events)
auditRouter.get('/', requireAuth, requireRole('admin', 'evaluator'), (req: AuthenticatedRequest, res) => {
  const { entity, type, actor, limit = 50 } = req.query;

  let records = store.auditLogs;

  if (entity) {
    records = records.filter((r) => r.entity.toLowerCase() === String(entity).toLowerCase());
  }
  if (type) {
    records = records.filter((r) => r.type.toLowerCase().includes(String(type).toLowerCase()));
  }
  if (actor) {
    records = records.filter((r) => r.actor === String(actor));
  }

  const sliced = records.slice(0, Number(limit));
  return res.json({
    total: records.length,
    events: sliced
  });
});

// GET /v1/audit/decision-trace/:candidateId/:opportunityId
auditRouter.get('/decision-trace/:candidateId/:opportunityId', requireAuth, requireRole('admin', 'evaluator'), (req: AuthenticatedRequest, res) => {
  const { candidateId, opportunityId } = req.params;

  const candidate = store.getCandidateById(candidateId);
  const opportunity = store.getOpportunityById(opportunityId);

  if (!candidate || !opportunity) {
    return res.status(404).json({ error: 'Candidate or opportunity not found' });
  }

  const storedMatches = store.getStoredMatchResults(candidateId);
  const matchResult = storedMatches.find((m) => m.opportunityId === opportunityId);

  return res.json({
    candidate: {
      id: candidate.id,
      name: candidate.name,
      state: candidate.state,
      district: candidate.district,
      dob: candidate.dob,
      qualifications: candidate.qualifications,
      certifications: candidate.certifications,
      skills: candidate.skills,
      preferences: candidate.preferences
    },
    opportunity: {
      id: opportunity.id,
      title: opportunity.title,
      orgName: opportunity.orgName,
      district: opportunity.district,
      rules: opportunity.rules,
      skills: opportunity.skills,
      preferenceAttrs: opportunity.preferenceAttrs
    },
    matchResult: matchResult || null,
    rulesVersion: 1,
    weightsVersion: 'v1',
    weights: { skill: 0.55, preference: 0.30, proficiency: 0.15 },
    retrievedAt: new Date().toISOString()
  });
});
