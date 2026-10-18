import { Request, Response, NextFunction } from 'express';
import { LoginUserDto } from '../dtos/LoginUser.dto';
import { authService } from '../services/Auth.service';

export class AuthController {
  private readonly service = authService;

  public async login(
    req: Request<unknown, unknown, LoginUserDto>,
    res: Response,
    _next: NextFunction,
  ): Promise<Response> {
    const result = await this.service.login(req.body);
    return res.status(200).json(result);
  }
}

export const authController = new AuthController();
