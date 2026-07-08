import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtAuth } from '../../middleware/jwtAuth';

const TEST_SECRET = 'test-jwt-secret-change-me-please';

function makeToken(payload: object = {}, secret = TEST_SECRET, expiresIn = '15m'): string {
  return jwt.sign({ sub: 1, email: 'admin@pointsmall.com', roles: ['admin'], ...payload }, secret, {
    expiresIn,
  });
}

function mockReqResNext(authHeader?: string): {
  req: Partial<Request>;
  res: Partial<Response>;
  next: NextFunction;
} {
  const req: Partial<Request> = {
    headers: authHeader ? { authorization: authHeader } : {},
  };
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const next: NextFunction = vi.fn();
  return { req, res, next };
}

beforeEach(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

describe('jwtAuth middleware', () => {
  // AC-01: valid token passes, payload attached to req.user
  it('passes valid Bearer token and attaches decoded payload to req.user', () => {
    const token = makeToken();
    const { req, res, next } = mockReqResNext(`Bearer ${token}`);

    jwtAuth(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledOnce();
    expect((req as any).user).toBeDefined();
    expect((req as any).user.sub).toBe(1);
    expect((req as any).user.email).toBe('admin@pointsmall.com');
  });

  // AC-02: missing Authorization header → 401 msg-5001
  it('returns 401 msg-5001 when Authorization header is missing', () => {
    const { req, res, next } = mockReqResNext();

    jwtAuth(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      code: 'msg-5001',
      message: 'Unauthorized',
      data: null,
    });
  });

  // AC-02: non-Bearer format → 401
  it('returns 401 when Authorization header does not start with "Bearer "', () => {
    const { req, res, next } = mockReqResNext('Token something');

    jwtAuth(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  // AC-03: invalid token → 401
  it('returns 401 msg-5001 when token is malformed', () => {
    const { req, res, next } = mockReqResNext('Bearer not.a.valid.jwt');

    jwtAuth(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      code: 'msg-5001',
      message: 'Unauthorized',
      data: null,
    });
  });

  // AC-03: expired token → 401
  it('returns 401 msg-5001 when token is expired', () => {
    const expiredToken = makeToken({}, TEST_SECRET, '-1s');
    const { req, res, next } = mockReqResNext(`Bearer ${expiredToken}`);

    jwtAuth(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  // AC-06: wrong secret → 401
  it('returns 401 when token signed with a different secret', () => {
    const token = makeToken({}, 'wrong-secret-that-is-long-enough-here');
    const { req, res, next } = mockReqResNext(`Bearer ${token}`);

    jwtAuth(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
