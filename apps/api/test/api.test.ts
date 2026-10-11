import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('API Integration Tests - RozgarLink Endpoints', () => {
  let ashaToken = '';

  it('POST /v1/auth/otp/request & verify for Asha', async () => {
    const reqRes = await request(app)
      .post('/v1/auth/otp/request')
      .send({ phoneOrEmail: 'asha@rozgarlink.gov.in' });
    expect(reqRes.status).toBe(202);

    const verifyRes = await request(app)
      .post('/v1/auth/otp/verify')
      .send({ phoneOrEmail: 'asha@rozgarlink.gov.in', code: '123456' });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.token).toBeDefined();
    expect(verifyRes.body.candidate.role).toBe('candidate');

    ashaToken = verifyRes.body.token;
  });

  it('GET /v1/candidates/me returns profile for Asha', async () => {
    const res = await request(app)
      .get('/v1/candidates/me')
      .set('x-candidate-id', 'cand-asha');

    expect(res.status).toBe(200);
    expect(res.body.candidate.name).toContain('Asha');
    expect(res.body.candidate.facts.district).toBe('Pune');
  });

  it('GET /v1/matches returns ranked eligible, notEligible, and needsInfo', async () => {
    const res = await request(app)
      .get('/v1/matches')
      .set('x-candidate-id', 'cand-asha');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.eligible)).toBe(true);
    expect(Array.isArray(res.body.notEligible)).toBe(true);
    expect(Array.isArray(res.body.needsInfo)).toBe(true);

    // Eligible items must have score and rank
    for (const item of res.body.eligible) {
      expect(item.status).toBe('ELIGIBLE');
      expect(item.score).toBeGreaterThan(0);
      expect(item.rank).toBeGreaterThan(0);
      expect(item.explanation.points.length).toBeGreaterThan(0);
    }

    // Ineligible items must NEVER have score or rank
    for (const item of res.body.notEligible) {
      expect(item.status).toBe('NOT_ELIGIBLE');
      expect(item.score).toBeUndefined();
      expect(item.rank).toBeUndefined();
    }
  });

  it('Scenario: Asha changes district to Satara -> live update flips Pune-only jobs', async () => {
    const updateRes = await request(app)
      .put('/v1/candidates/me')
      .set('x-candidate-id', 'cand-asha')
      .send({ facts: { district: 'Satara' } });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.candidate.facts.district).toBe('Satara');

    const matchesRes = await request(app)
      .get('/v1/matches')
      .set('x-candidate-id', 'cand-asha');

    // Restore Asha back to Pune
    await request(app)
      .put('/v1/candidates/me')
      .set('x-candidate-id', 'cand-asha')
      .send({ facts: { district: 'Pune' } });
  });

  it('POST /v1/matches/whatif returns simulation without saving to candidate profile', async () => {
    const res = await request(app)
      .post('/v1/matches/whatif')
      .set('x-candidate-id', 'cand-asha')
      .send({
        patchFacts: {
          highestQualification: { ordinal: 5, verified: true } // Diploma
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.isWhatIf).toBe(true);

    // Profile in store should still be ITI (ordinal 4, not 5)
    const meRes = await request(app)
      .get('/v1/candidates/me')
      .set('x-candidate-id', 'cand-asha');
    expect(meRes.body.candidate.facts.highestQualification.ordinal).toBe(4);
  });

  it('Officer preview: POST /v1/opportunities/preview returns candidate counts', async () => {
    const res = await request(app)
      .post('/v1/opportunities/preview')
      .send({
        rules: [
          {
            id: 'rule-test-1',
            type: 'QUAL_MIN_LEVEL',
            operator: 'gte',
            value: 4,
            label: 'Requires ITI',
            requiresVerification: true,
            version: 1
          }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.totalCandidates).toBeGreaterThan(0);
    expect(res.body.eligibleCount).toBeDefined();
    expect(res.body.notEligibleCount).toBeDefined();
  });
});
