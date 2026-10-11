import { Router } from 'express';
import { requireAuth, requireRole, AuthenticatedRequest } from '../services/auth.service.js';
import { store } from '../db/store.js';
import { normalisePhrase } from '@rozgarlink/skill-core';

export const catalogueRouter = Router();

// GET /v1/catalogue/skills
catalogueRouter.get('/skills', (req, res) => {
  const skills = Array.from(store.skills.values());
  return res.json({ skills, total: skills.length });
});

// POST /v1/catalogue/skills (Create skill)
catalogueRouter.post('/skills', requireAuth, requireRole('catalogue_manager', 'admin'), (req: AuthenticatedRequest, res) => {
  const { id, canonicalName, category } = req.body;
  if (!id || !canonicalName) {
    return res.status(400).json({ error: 'id and canonicalName are required' });
  }

  store.skills.set(id, { id, canonicalName, category: category || 'General' });
  store.logAudit(req.user?.userId, 'SKILL_CREATED', 'SKILL', id, null, { id, canonicalName, category });

  return res.status(201).json({ skill: store.skills.get(id) });
});

// GET /v1/catalogue/aliases
catalogueRouter.get('/aliases', (req, res) => {
  return res.json({ aliases: store.aliases, total: store.aliases.length });
});

// POST /v1/catalogue/aliases (Create alias)
catalogueRouter.post('/aliases', requireAuth, requireRole('catalogue_manager', 'admin'), (req: AuthenticatedRequest, res) => {
  const { skillId, phrase } = req.body;
  if (!skillId || !phrase) {
    return res.status(400).json({ error: 'skillId and phrase are required' });
  }

  const norm = normalisePhrase(phrase);
  store.aliases.push({ skillId, phraseNorm: norm });
  store.logAudit(req.user?.userId, 'ALIAS_CREATED', 'SKILL_ALIAS', `${skillId}:${norm}`, null, { skillId, phraseNorm: norm });

  return res.status(201).json({ success: true, alias: { skillId, phraseNorm: norm } });
});

// GET /v1/catalogue/courses
catalogueRouter.get('/courses', (req, res) => {
  const courses = Array.from(store.learningResources.values());
  return res.json({ courses, total: courses.length });
});

// GET /v1/catalogue/unmatched-phrases (Queue review loop)
catalogueRouter.get('/unmatched-phrases', requireAuth, requireRole('catalogue_manager', 'admin'), (req, res) => {
  const items = Array.from(store.unmatchedPhrases.values()).sort((a, b) => b.seenCount - a.seenCount);
  return res.json({ unmatchedPhrases: items });
});

// POST /v1/catalogue/unmatched-phrases/promote
catalogueRouter.post('/unmatched-phrases/promote', requireAuth, requireRole('catalogue_manager', 'admin'), (req: AuthenticatedRequest, res) => {
  const { phraseNorm, skillId } = req.body;
  if (!phraseNorm || !skillId) {
    return res.status(400).json({ error: 'phraseNorm and skillId are required' });
  }

  store.aliases.push({ skillId, phraseNorm });
  store.unmatchedPhrases.delete(phraseNorm);

  store.logAudit(req.user?.userId, 'UNMATCHED_PHRASE_PROMOTED', 'SKILL_ALIAS', phraseNorm, null, { skillId, phraseNorm });
  return res.json({ message: 'Phrase promoted to alias successfully' });
});

// POST /v1/catalogue/import (CSV / JSON Bulk Import)
catalogueRouter.post('/import', requireAuth, requireRole('catalogue_manager', 'admin'), (req: AuthenticatedRequest, res) => {
  const { type, items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'items must be an array' });
  }

  let importedCount = 0;
  if (type === 'skills') {
    for (const item of items) {
      if (item.id && item.canonicalName) {
        store.skills.set(item.id, item);
        importedCount++;
      }
    }
  } else if (type === 'aliases') {
    for (const item of items) {
      if (item.skillId && item.phrase) {
        store.aliases.push({ skillId: item.skillId, phraseNorm: normalisePhrase(item.phrase) });
        importedCount++;
      }
    }
  } else if (type === 'courses') {
    for (const item of items) {
      if (item.id && item.title) {
        store.learningResources.set(item.id, item);
        importedCount++;
      }
    }
  }

  store.logAudit(req.user?.userId, 'CATALOGUE_BULK_IMPORT', 'CATALOGUE', type, null, { count: importedCount });
  return res.json({ success: true, importedCount });
});
