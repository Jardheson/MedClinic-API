import { Request, Response, NextFunction } from 'express';
import { CreateUserDto } from '../dtos/CreateUser.dto';
import { userService } from '../services/User.service';

export class UserController {
  private readonly service = userService;

  public async create(
    req: Request<unknown, unknown, CreateUserDto>,
    res: Response,
    _next: NextFunction,
  ): Promise<Response> {
    const result = await this.service.create(req.body);
    return res.status(201).json(result);
  }

  public async me(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    const userId = req.user!.userId;
    const result = await this.service.getMe(userId);
    return res.status(200).json(result);
  }
}

export const userController = new UserController();
