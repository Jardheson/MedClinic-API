import { Router } from 'express';
import { adminController } from '../controllers/Admin.controller';
import { UserRole } from '../entities/UserRole.enum';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';

const adminRoutes = Router();

adminRoutes.get(
  '/ping',
  authenticate,
  authorize(UserRole.ADMIN),
  adminController.ping.bind(adminController),
);

export { adminRoutes };
