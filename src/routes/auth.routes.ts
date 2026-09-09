import { Router } from 'express';
import { authController } from '../controllers/Auth.controller';
import { CreateUserSchema } from '../dtos/CreateUser.dto';
import { LoginUserSchema } from '../dtos/LoginUser.dto';
import { validateRequest } from '../middlewares/validateRequest.middleware';

const authRoutes = Router();

authRoutes.post(
  '/register',
  validateRequest(CreateUserSchema),
  authController.register.bind(authController),
);

authRoutes.post(
  '/login',
  validateRequest(LoginUserSchema),
  authController.login.bind(authController),
);

export { authRoutes };
