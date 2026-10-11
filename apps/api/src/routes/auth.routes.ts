import { Router } from 'express';
import { z } from 'zod';
import { generateTokens, requireAuth, AuthenticatedRequest } from '../services/auth.service.js';
import { store } from '../db/store.js';

export const authRouter = Router();

const RequestOtpSchema = z.object({
  phoneOrEmail: z.string().min(3)
});

const VerifyOtpSchema = z.object({
  phoneOrEmail: z.string().min(3),
  code: z.string().min(4)
});

// POST /v1/auth/otp/request
authRouter.post('/otp/request', (req, res) => {
  const parsed = RequestOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      type: 'https://rozgarlink.gov.in/errors/validation',
      title: 'Invalid Request',
      status: 400,
      errors: parsed.error.errors
    });
  }

  const { phoneOrEmail } = parsed.data;
  const user = store.getUserByIdentifier(phoneOrEmail);
  const otp = store.generateOtp(phoneOrEmail);

  console.log(`[AUTH-OTP] Login request for: ${phoneOrEmail} -> Generated OTP: ${otp}`);

  // Return 202 Accepted; in development mode include OTP code in response for testing
  return res.status(202).json({
    message: 'OTP has been sent to your registered phone or email',
    phoneOrEmail,
    devCode: process.env.NODE_ENV !== 'production' ? otp : undefined
  });
});

// POST /v1/auth/otp/verify
authRouter.post('/otp/verify', (req, res) => {
  const parsed = VerifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      type: 'https://rozgarlink.gov.in/errors/validation',
      title: 'Invalid Request',
      status: 400,
      errors: parsed.error.errors
    });
  }

  const { phoneOrEmail, code } = parsed.data;
  const isValid = store.verifyOtp(phoneOrEmail, code);

  if (!isValid) {
    return res.status(400).json({
      type: 'https://rozgarlink.gov.in/errors/invalid-otp',
      title: 'Invalid OTP',
      status: 400,
      detail: 'The provided verification code is incorrect or expired'
    });
  }

  let user = store.getUserByIdentifier(phoneOrEmail);
  if (!user) {
    // If not found in seeds, create as candidate
    const isEmail = phoneOrEmail.includes('@');
    user = {
      id: `usr-${Date.now()}`,
      role: 'candidate',
      name: phoneOrEmail.split('@')[0],
      email: isEmail ? phoneOrEmail : undefined,
      phone: !isEmail ? phoneOrEmail : undefined,
      locale: 'en',
      createdAt: new Date().toISOString()
    };
    store.users.set(user.id, user);

    // Create candidate record
    const candId = `cand-${Date.now()}`;
    store.candidates.set(candId, {
      id: candId,
      userId: user.id,
      name: user.name,
      state: 'Maharashtra',
      district: 'Pune',
      pincode: '411001',
      dob: '2002-01-01',
      preferences: {
        commuteKm: 15,
        minPay: 12000,
        shift: 'day',
        workType: ['full-time'],
        sector: [],
        weights: { commute: 0.25, pay: 0.25, shift: 0.25, workType: 0.25 }
      },
      qualifications: [],
      certifications: [],
      experience: [],
      skills: []
    });
  }

  const { accessToken, refreshToken, candidateId } = generateTokens(user);

  return res.json({
    accessToken,
    refreshToken,
    user,
    candidateId
  });
});

// GET /v1/auth/me
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = store.getUserById(req.user!.userId);
  if (!user) {
    return res.status(404).json({
      type: 'https://rozgarlink.gov.in/errors/not-found',
      title: 'User not found',
      status: 404
    });
  }

  const candidate = user.role === 'candidate' ? store.getCandidateByUserId(user.id) : undefined;

  return res.json({
    user,
    candidate
  });
});
