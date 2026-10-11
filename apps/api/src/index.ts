import cors from 'cors';
import express, { Request, Response } from 'express';
import { extractSkillsFromText } from '@rozgarlink/skill-core';
import { evaluateOpportunity } from '@rozgarlink/eligibility-engine';
import { recomputeMatchesForCandidate } from './orchestrator.js';
import { store } from './store.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Helper to resolve candidate from header or query, defaulting to 'cand-asha'
function getActiveCandidateId(req: Request): string {
  const headerId = req.headers['x-candidate-id'] as string;
  const queryId = req.query.candidateId as string;
  return headerId || queryId || 'cand-asha';
}

// 1. Health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'rozgarlink-api', timestamp: new Date().toISOString() });
});

// 2. Auth & User Switcher
app.get('/v1/candidates', (_req: Request, res: Response) => {
  const list = store.getAllCandidates().map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    district: c.facts.district,
    state: c.facts.state,
    qualifications: c.facts.qualifications.map((q) => q.ordinal),
    skills: c.skills.map((s) => s.skillId)
  }));
  res.json({ candidates: list });
});

app.post('/v1/auth/otp/request', (req: Request, res: Response) => {
  const { phoneOrEmail } = req.body;
  // Dev mode OTP is 123456
  res.status(202).json({
    status: 'sent',
    message: 'OTP sent to ' + phoneOrEmail,
    devCode: '123456'
  });
});

app.post('/v1/auth/otp/verify', (req: Request, res: Response) => {
  const { phoneOrEmail, code } = req.body;
  const candidate = store.getAllCandidates().find(
    (c) => c.email === phoneOrEmail || c.phone === phoneOrEmail
  ) || store.getCandidate('cand-asha')!;

  res.json({
    token: 'jwt-token-dev-' + candidate.id,
    candidate: {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      role: candidate.role
    }
  });
});

// 3. Candidate Profile
app.get('/v1/candidates/me', (req: Request, res: Response) => {
  const candId = getActiveCandidateId(req);
  const candidate = store.getCandidate(candId);
  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  res.json({ candidate, profileVersion: candidate.profileVersion });
});

app.put('/v1/candidates/me', (req: Request, res: Response) => {
  const candId = getActiveCandidateId(req);
  const patch = req.body;
  const candidate = store.getCandidate(candId);
  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found' });
  }

  // Merge patch
  const updatedFacts = patch.facts ? { ...candidate.facts, ...patch.facts } : candidate.facts;
  const updatedPrefs = patch.preferences ? { ...candidate.preferences, ...patch.preferences } : candidate.preferences;

  const updated = store.updateCandidate(candId, {
    facts: updatedFacts,
    preferences: updatedPrefs
  });

  if (!updated) {
    return res.status(500).json({ error: 'Failed to update candidate' });
  }

  // Recompute & broadcast SSE
  const matches = recomputeMatchesForCandidate(updated);
  store.broadcastToCandidate(candId, {
    type: 'matches.updated',
    profileVersion: updated.profileVersion,
    changes: matches.changes
  });

  res.json({
    candidate: updated,
    profileVersion: updated.profileVersion,
    changes: matches.changes
  });
});

// Undo profile change
app.post('/v1/candidates/me/undo', (req: Request, res: Response) => {
  const candId = getActiveCandidateId(req);
  const restored = store.undoCandidate(candId);
  if (!restored) {
    return res.status(400).json({ error: 'No previous snapshot to restore' });
  }

  const matches = recomputeMatchesForCandidate(restored);
  store.broadcastToCandidate(candId, {
    type: 'matches.updated',
    profileVersion: restored.profileVersion,
    changes: matches.changes,
    isUndo: true
  });

  res.json({
    candidate: restored,
    profileVersion: restored.profileVersion,
    changes: matches.changes
  });
});

// Add qualification
app.post('/v1/candidates/me/qualifications', (req: Request, res: Response) => {
  const candId = getActiveCandidateId(req);
  const { ordinal, fieldCode, verified = true } = req.body;
  const candidate = store.getCandidate(candId);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

  const currentQuals = [...candidate.facts.qualifications];
  currentQuals.push({ ordinal: Number(ordinal), fieldCode, verified: Boolean(verified) });

  // Update highest qualification
  const highest = currentQuals.reduce(
    (max, q) => (q.ordinal > max.ordinal ? q : max),
    currentQuals[0]
  );

  const updated = store.updateCandidate(candId, {
    facts: {
      ...candidate.facts,
      qualifications: currentQuals,
      highestQualification: highest
    }
  });

  if (!updated) return res.status(500).json({ error: 'Failed to save' });

  const matches = recomputeMatchesForCandidate(updated);
  store.broadcastToCandidate(candId, {
    type: 'matches.updated',
    profileVersion: updated.profileVersion,
    changes: matches.changes
  });

  res.json({ candidate: updated, changes: matches.changes });
});

// Update skills
app.put('/v1/candidates/me/skills', (req: Request, res: Response) => {
  const candId = getActiveCandidateId(req);
  const { skills } = req.body;
  const candidate = store.getCandidate(candId);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

  const updated = store.updateCandidate(candId, { skills });
  if (!updated) return res.status(500).json({ error: 'Failed to update' });

  const matches = recomputeMatchesForCandidate(updated);
  store.broadcastToCandidate(candId, {
    type: 'matches.updated',
    profileVersion: updated.profileVersion,
    changes: matches.changes
  });

  res.json({ candidate: updated, changes: matches.changes });
});

// Extract skills from text
app.post('/v1/candidates/me/skills/extract', (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) return res.json({ skills: [] });
  const extracted = extractSkillsFromText(text);
  res.json({ skills: extracted });
});

// 4. Matches
app.get('/v1/matches', (req: Request, res: Response) => {
  try {
    const candId = getActiveCandidateId(req);
    const locale = (req.query.locale as 'en' | 'hi' | 'mr') || 'en';
    const candidate = store.getCandidate(candId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const result = recomputeMatchesForCandidate(candidate, locale);
    res.json(result);
  } catch (err) {
    console.error('ERROR in GET /v1/matches:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.get('/v1/matches/:opportunityId', (req: Request, res: Response) => {
  const candId = getActiveCandidateId(req);
  const oppId = req.params.opportunityId;
  const locale = (req.query.locale as 'en' | 'hi' | 'mr') || 'en';
  const candidate = store.getCandidate(candId);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

  const matches = recomputeMatchesForCandidate(candidate, locale);
  const found =
    matches.eligible.find((m) => m.opportunity.id === oppId) ||
    matches.needsInfo.find((m) => m.opportunity.id === oppId) ||
    matches.notEligible.find((m) => m.opportunity.id === oppId);

  if (!found) return res.status(404).json({ error: 'Opportunity not found' });
  res.json(found);
});

// What-If Simulation
app.post('/v1/matches/whatif', (req: Request, res: Response) => {
  const candId = getActiveCandidateId(req);
  const { patchFacts, patchSkills, patchPreferences, locale = 'en' } = req.body;
  const candidate = store.getCandidate(candId);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

  // Create temporary copy without modifying store
  const hypothetical: typeof candidate = JSON.parse(JSON.stringify(candidate));
  if (patchFacts) hypothetical.facts = { ...hypothetical.facts, ...patchFacts };
  if (patchSkills) hypothetical.skills = patchSkills;
  if (patchPreferences) hypothetical.preferences = { ...hypothetical.preferences, ...patchPreferences };

  const matches = recomputeMatchesForCandidate(hypothetical, locale, patchPreferences);
  res.json({ ...matches, isWhatIf: true });
});

// 5. Opportunities & Officer Console
app.get('/v1/opportunities', (_req: Request, res: Response) => {
  res.json({ opportunities: store.getAllOpportunities() });
});

app.post('/v1/opportunities', (req: Request, res: Response) => {
  const newOpp = req.body;
  if (!newOpp.id) newOpp.id = 'OPP-' + Math.floor(100 + Math.random() * 900);
  if (!newOpp.rulesVersion) newOpp.rulesVersion = 1;
  const saved = store.saveOpportunity(newOpp);
  res.status(201).json({ opportunity: saved });
});

// Preview rule impact on all candidates
app.post('/v1/opportunities/preview', (req: Request, res: Response) => {
  const { rules } = req.body;
  const allCandidates = store.getAllCandidates();

  let eligibleCount = 0;
  let needsInfoCount = 0;
  let notEligibleCount = 0;

  for (const cand of allCandidates) {
    const outcome = evaluateOpportunity(rules || [], cand.facts);
    if (outcome.status === 'ELIGIBLE') eligibleCount++;
    else if (outcome.status === 'NEEDS_INFO') needsInfoCount++;
    else notEligibleCount++;
  }

  res.json({
    totalCandidates: allCandidates.length,
    eligibleCount,
    needsInfoCount,
    notEligibleCount
  });
});

// 6. Learning & Pathways
app.get('/v1/learning/catalogue', (_req: Request, res: Response) => {
  res.json({ catalogue: store.getAllCatalogue() });
});

app.post('/v1/learning/complete', (req: Request, res: Response) => {
  const candId = getActiveCandidateId(req);
  const { resourceId } = req.body;
  const candidate = store.getCandidate(candId);
  const resource = store.getAllCatalogue().find((c) => c.id === resourceId);

  if (!candidate || !resource) {
    return res.status(404).json({ error: 'Candidate or course not found' });
  }

  const completed = new Set(candidate.completedCourses);
  completed.add(resourceId);

  // Add taught skills
  const skillsMap = new Map(candidate.skills.map((s) => [s.skillId, s]));
  for (const st of resource.skillsTaught) {
    skillsMap.set(st.skillId, {
      skillId: st.skillId,
      proficiency: st.levelReached || 3,
      source: 'course',
      confirmed: true,
      confidence: 1.0
    });
  }

  // If course awarded qualification
  let highestQual = candidate.facts.highestQualification;
  const quals = [...candidate.facts.qualifications];
  if (resource.qualificationAwardedOrdinal) {
    quals.push({
      ordinal: resource.qualificationAwardedOrdinal,
      fieldCode: 'COURSE',
      verified: true
    });
    if (!highestQual || resource.qualificationAwardedOrdinal > highestQual.ordinal) {
      highestQual = {
        ordinal: resource.qualificationAwardedOrdinal,
        fieldCode: 'COURSE',
        verified: true
      };
    }
  }

  const updated = store.updateCandidate(candId, {
    completedCourses: Array.from(completed),
    skills: Array.from(skillsMap.values()),
    facts: {
      ...candidate.facts,
      qualifications: quals,
      highestQualification: highestQual
    }
  });

  if (!updated) return res.status(500).json({ error: 'Failed to update' });

  const matches = recomputeMatchesForCandidate(updated);
  store.broadcastToCandidate(candId, {
    type: 'matches.updated',
    profileVersion: updated.profileVersion,
    changes: matches.changes
  });

  res.json({ candidate: updated, changes: matches.changes });
});

// 7. Realtime SSE Endpoint
app.get('/v1/events', (req: Request, res: Response) => {
  const candId = getActiveCandidateId(req);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', candidateId: candId })}\n\n`);

  // Heartbeat comment every 25 seconds
  const interval = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  store.addSseClient(candId, res);

  req.on('close', () => {
    clearInterval(interval);
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 RozgarLink API running on http://localhost:${PORT}`);
  });
}

export default app;
