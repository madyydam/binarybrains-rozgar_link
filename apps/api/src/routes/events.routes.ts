import { Router } from 'express';
import { sseGateway } from '../services/sse.service.js';
import { verifyAccessToken } from '../services/auth.service.js';
import { store } from '../db/store.js';

export const eventsRouter = Router();

// GET /v1/events (SSE stream)
eventsRouter.get('/', (req, res) => {
  // Support token via query param (EventSource in browser doesn't send custom headers)
  const token = (req.query.token as string) || (req.headers.authorization?.replace('Bearer ', ''));
  const lastEventId = req.headers['last-event-id'] as string;

  let candidateId = (req.query.candidateId as string) || '';

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload?.candidateId) {
      candidateId = payload.candidateId;
    } else if (payload?.userId) {
      const cand = store.getCandidateByUserId(payload.userId);
      if (cand) candidateId = cand.id;
    }
  }

  // Fallback to Asha for dev demo if not passed
  if (!candidateId) {
    candidateId = 'c1111111-0000-0000-0000-000000000001';
  }

  sseGateway.addClient(candidateId, res, lastEventId);
});
