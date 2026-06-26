import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function jwtAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers['authorization'];
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ code: 'msg-5001', message: 'Unauthorized', data: null });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ code: 'msg-5001', message: 'Unauthorized', data: null });
  }
}
