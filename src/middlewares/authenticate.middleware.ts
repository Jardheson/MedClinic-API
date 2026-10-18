import { NextFunction, Request, Response } from 'express';
import { userRepository } from '../repositories/User.repository';
import { UnauthorizedError } from '../utils/errors/AppError';
import { verifyAccessToken } from '../utils/jwt';

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
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
    const user = await userRepository.findById(payload.userId);
    if (!user) {
      return next(new UnauthorizedError('Usuário do token não foi encontrado.'));
    }

    req.user = { userId: user.id, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
}
