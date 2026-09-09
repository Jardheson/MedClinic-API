import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../utils/jwt';

export class AdminController {
  public async ping(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    const user = req.user as TokenPayload;
    return res.status(200).json({
      message: 'pong admin',
      authenticatedAs: {
        userId: user.userId,
        role: user.role,
      },
    });
  }
}

export const adminController = new AdminController();
