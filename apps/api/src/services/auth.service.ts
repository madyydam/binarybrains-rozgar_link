import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '@rozgarlink/shared-types';
import { store } from '../db/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-rozgarlink-dev-environment-12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-jwt-refresh-key-for-rozgarlink-dev-environment-67890';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  candidateId?: string;
}

export function generateTokens(user: User) {
  let candidateId: string | undefined;
  if (user.role === 'candidate') {
    const candidate = store.getCandidateByUserId(user.id);
    candidateId = candidate?.id;
  }

  const payload: JwtPayload = {
    userId: user.id,
    role: user.role,
    candidateId
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken, user, candidateId };
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (e) {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Authentication Middleware:
 * Checks Authorization header "Bearer <token>" or cookie.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if ((req as any).cookies?.token) {
    token = (req as any).cookies.token;
  }

  // Support demo / dev bypass header for testing if needed
  if (!token && (req.headers['x-demo-user'] || req.headers['x-demo-role'])) {
    const demoEmail = String(req.headers['x-demo-user'] || 'asha@rozgarlink.gov.in');
    const user = store.getUserByIdentifier(demoEmail);
    if (user) {
      const candidate = store.getCandidateByUserId(user.id);
      req.user = { userId: user.id, role: user.role, candidateId: candidate?.id };
      return next();
    }
  }

  if (!token) {
    return res.status(401).json({
      type: 'https://rozgarlink.gov.in/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Missing access token in Authorization header'
    });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({
      type: 'https://rozgarlink.gov.in/errors/invalid-token',
      title: 'Invalid or expired token',
      status: 401,
      detail: 'The provided access token is invalid or has expired'
    });
  }

  req.user = payload;
  next();
}

/**
 * Role-Based Access Control (RBAC) Middleware.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        type: 'https://rozgarlink.gov.in/errors/unauthorized',
        title: 'Unauthorized',
        status: 401
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        type: 'https://rozgarlink.gov.in/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: `User role "${req.user.role}" does not have permission for this resource.`
      });
    }

    next();
  };
}
