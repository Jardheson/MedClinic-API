import { Router } from 'express';
import { z } from 'zod';
import { patientController } from '../controllers/Patient.controller';
import { CreatePatientSchema } from '../dtos/CreatePatient.dto';
import { UserRole } from '../entities/UserRole.enum';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validateRequest } from '../middlewares/validateRequest.middleware';

const patientIdSchema = z.object({
  params: z.object({ id: z.string().uuid('id inválido.') }),
});

const listPatientsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
    name: z.string().trim().min(1).max(150).optional(),
  }),
});

const updatePatientSchema = z.object({
  params: z.object({ id: z.string().uuid('id inválido.') }),
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    cpf: z.string().regex(/^\d{11}$/).optional(),
  }).refine((body) => body.name !== undefined || body.cpf !== undefined, 'Informe ao menos um campo para atualização.'),
});

const patientRoutes = Router();

patientRoutes.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.ATTENDANT), validateRequest(CreatePatientSchema), patientController.create.bind(patientController));
patientRoutes.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.ATTENDANT, UserRole.DOCTOR), validateRequest(listPatientsSchema), patientController.list.bind(patientController));
patientRoutes.get('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.ATTENDANT, UserRole.DOCTOR), validateRequest(patientIdSchema), patientController.show.bind(patientController));
patientRoutes.patch('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.ATTENDANT), validateRequest(updatePatientSchema), patientController.update.bind(patientController));
patientRoutes.delete('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.ATTENDANT), validateRequest(patientIdSchema), patientController.delete.bind(patientController));

export { patientRoutes };
