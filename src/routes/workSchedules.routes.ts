import { Router } from 'express';
import { z } from 'zod';
import { workScheduleController } from '../controllers/WorkSchedule.controller';
import { ReplaceWorkScheduleSchema } from '../dtos/ReplaceWorkSchedule.dto';
import { UserRole } from '../entities/UserRole.enum';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validateRequest } from '../middlewares/validateRequest.middleware';

const doctorIdSchema = z.object({
  params: z.object({
    doctorId: z.string().uuid('doctorId inválido.'),
  }),
});

const workScheduleRoutes = Router();

workScheduleRoutes.put(
  '/:doctorId/work-schedule',
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(ReplaceWorkScheduleSchema),
  workScheduleController.replace.bind(workScheduleController),
);

workScheduleRoutes.get(
  '/:doctorId/work-schedule',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT, UserRole.DOCTOR),
  validateRequest(doctorIdSchema),
  workScheduleController.list.bind(workScheduleController),
);

export { workScheduleRoutes };
