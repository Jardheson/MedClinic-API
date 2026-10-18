import { Router } from 'express';
import { z } from 'zod';
import { doctorController } from '../controllers/Doctor.controller';
import { CreateDoctorSchema } from '../dtos/CreateDoctor.dto';
import { UserRole } from '../entities/UserRole.enum';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validateRequest } from '../middlewares/validateRequest.middleware';

const doctorIdSchema = z.object({
  params: z.object({ id: z.string().uuid('id inválido.') }),
});

const listDoctorsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
    name: z.string().trim().min(1).max(150).optional(),
    crm: z.string().trim().min(1).max(20).optional(),
  }),
});

const doctorRoutes = Router();

doctorRoutes.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(CreateDoctorSchema),
  doctorController.create.bind(doctorController),
);

doctorRoutes.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT, UserRole.DOCTOR),
  validateRequest(listDoctorsSchema),
  doctorController.list.bind(doctorController),
);

doctorRoutes.get(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT, UserRole.DOCTOR),
  validateRequest(doctorIdSchema),
  doctorController.show.bind(doctorController),
);

export { doctorRoutes };
