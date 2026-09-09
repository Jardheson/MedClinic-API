import { Router } from 'express';
import { userController } from '../controllers/User.controller';
import { authenticate } from '../middlewares/authenticate.middleware';

const userRoutes = Router();

userRoutes.get(
  '/me',
  authenticate,
  userController.me.bind(userController),
);

export { userRoutes };
