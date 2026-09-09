import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/User.service';

export class UserController {
  private readonly service = userService;

  public async me(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    const userId = req.user!.userId;
    const result = await this.service.getMe(userId);
    return res.status(200).json(result);
  }
}

export const userController = new UserController();
