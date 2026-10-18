import { Router } from 'express';
import { z } from 'zod';
import { calendarController } from '../controllers/Calendar.controller';
import { UserRole } from '../entities/UserRole.enum';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validateRequest } from '../middlewares/validateRequest.middleware';

const calendarSchema = z.object({
  params: z.object({
    doctorId: z.string().uuid('doctorId inválido.'),
  }),
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, 'date inválida. Use YYYY-MM-DD.'),
  }),
});

const calendarRoutes = Router();

calendarRoutes.get(
  '/:doctorId/calendar',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT, UserRole.DOCTOR),
  validateRequest(calendarSchema),
  calendarController.show.bind(calendarController),
);

export { calendarRoutes };
