import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../entities/UserRole.enum';
import { ForbiddenError } from '../utils/errors/AppError';

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Acesso proibido: usuário não autenticado.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Acesso proibido: perfil "${req.user.role}" não possui permissão para esta operação.`,
        ),
      );
    }
    next();
  };
}
