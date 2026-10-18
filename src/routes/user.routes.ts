import { Router } from 'express';
import { userController } from '../controllers/User.controller';
import { CreateUserSchema } from '../dtos/CreateUser.dto';
import { UserRole } from '../entities/UserRole.enum';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validateRequest } from '../middlewares/validateRequest.middleware';

const userRoutes = Router();

userRoutes.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(CreateUserSchema),
  userController.create.bind(userController),
);

userRoutes.get('/me', authenticate, userController.me.bind(userController));

export { userRoutes };
