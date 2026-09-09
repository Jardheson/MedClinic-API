import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../utils/errors/AppError';
import { verifyAccessToken } from '../utils/jwt';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Token de autenticação ausente ou malformatado.'));
    }
    const token = header.split(' ')[1];
    if (!token) {
      return next(new UnauthorizedError('Token de autenticação ausente.'));
    }
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (error) {
    next(error);
  }
}
