import { Router } from 'express';
import { z } from 'zod';
import { medicalRecordController } from '../controllers/MedicalRecord.controller';
import { CreateMedicalRecordSchema } from '../dtos/CreateMedicalRecord.dto';
import { UserRole } from '../entities/UserRole.enum';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validateRequest } from '../middlewares/validateRequest.middleware';

const patientIdSchema = z.object({
  params: z.object({
    patientId: z.string().uuid('patientId inválido.'),
  }),
});

const medicalRecordRoutes = Router();

medicalRecordRoutes.get(
  '/:patientId/medical-records',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DOCTOR),
  validateRequest(patientIdSchema),
  medicalRecordController.listByPatient.bind(medicalRecordController),
);

medicalRecordRoutes.post(
  '/:patientId/medical-records',
  authenticate,
  authorize(UserRole.DOCTOR),
  validateRequest(CreateMedicalRecordSchema),
  medicalRecordController.create.bind(medicalRecordController),
);

export { medicalRecordRoutes };
