import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../services/auth.service.js';
import { store } from '../db/store.js';
import { matchOrchestrator } from '../services/match-orchestrator.js';
import { SkillService } from '@rozgarlink/skill-core';

export const candidatesRouter = Router();
const skillService = new SkillService({
  aiEnabled: process.env.AI_ENABLED !== 'false'
});

// Helper to get candidate id from user
function getCandidate(req: AuthenticatedRequest) {
  const userId = req.user?.userId;
  if (!userId) return null;
  return store.getCandidateByUserId(userId);
}

// GET /v1/candidates/me
candidatesRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const candidate = getCandidate(req);
  if (!candidate) {
    return res.status(404).json({
      type: 'https://rozgarlink.gov.in/errors/not-found',
      title: 'Candidate profile not found',
      status: 404
    });
  }

  return res.json({
    candidate,
    profileVersion: 1
  });
});

// PUT /v1/candidates/me (Update location, dob, preferences)
candidatesRouter.put('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  const candidate = getCandidate(req);
  if (!candidate) {
    return res.status(404).json({
      type: 'https://rozgarlink.gov.in/errors/not-found',
      title: 'Candidate profile not found',
      status: 404
    });
  }

  const { state, district, pincode, dob, preferences } = req.body;
  const updateRes = store.updateCandidateProfile(
    candidate.id,
    { state, district, pincode, dob, preferences },
    req.user?.userId
  );

  // Synchronous recompute of matching results (Rule 45)
  const matchResult = await matchOrchestrator.recompute(candidate.id);

  return res.json({
    candidate: updateRes?.candidate,
    profileVersion: 1,
    changes: matchResult.changes
  });
});

// POST /v1/candidates/me/qualifications
candidatesRouter.post('/me/qualifications', requireAuth, async (req: AuthenticatedRequest, res) => {
  const candidate = getCandidate(req);
  if (!candidate) {
    return res.status(404).json({
      type: 'https://rozgarlink.gov.in/errors/not-found',
      title: 'Candidate profile not found',
      status: 404
    });
  }

  const { levelOrdinal, fieldCode, institution, year, verified } = req.body;
  const addRes = store.addQualification(
    candidate.id,
    { levelOrdinal: Number(levelOrdinal), fieldCode, institution, year, verified: verified ?? true },
    req.user?.userId
  );

  const matchResult = await matchOrchestrator.recompute(candidate.id);

  return res.json({
    qualifications: addRes?.candidate.qualifications,
    profileVersion: 1,
    changes: matchResult.changes
  });
});

// DELETE /v1/candidates/me/qualifications/:id
candidatesRouter.delete('/me/qualifications/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const candidate = getCandidate(req);
  if (!candidate) {
    return res.status(404).json({
      type: 'https://rozgarlink.gov.in/errors/not-found',
      title: 'Candidate profile not found',
      status: 404
    });
  }

  const qualId = req.params.id;
  const delRes = store.deleteQualification(candidate.id, qualId, req.user?.userId);

  const matchResult = await matchOrchestrator.recompute(candidate.id);

  return res.json({
    qualifications: delRes?.candidate.qualifications,
    profileVersion: 1,
    changes: matchResult.changes
  });
});

// POST /v1/candidates/me/skills/extract (Free text -> suggested skills)
candidatesRouter.post('/me/skills/extract', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      type: 'https://rozgarlink.gov.in/errors/bad-request',
      title: 'Missing text',
      status: 400
    });
  }

  const allSkills = Array.from(store.skills.values());
  const allAliases = store.aliases;

  const suggested = await skillService.extractSkillsFromText(text, allSkills, allAliases);

  return res.json({
    suggestedSkills: suggested
  });
});

// PUT /v1/candidates/me/skills (Confirm/save skills)
candidatesRouter.put('/me/skills', requireAuth, async (req: AuthenticatedRequest, res) => {
  const candidate = getCandidate(req);
  if (!candidate) {
    return res.status(404).json({
      type: 'https://rozgarlink.gov.in/errors/not-found',
      title: 'Candidate profile not found',
      status: 404
    });
  }

  const skillsInput: { skillId: string; proficiency: number; source?: 'manual' | 'ai' | 'course' }[] = req.body.skills || [];
  const updRes = store.updateCandidateSkills(
    candidate.id,
    skillsInput.map((s) => ({ ...s, confirmed: true })),
    req.user?.userId
  );

  const matchResult = await matchOrchestrator.recompute(candidate.id);

  return res.json({
    skills: updRes?.candidate.skills,
    profileVersion: 1,
    changes: matchResult.changes
  });
});
