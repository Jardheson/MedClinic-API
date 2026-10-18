import { Router } from 'express';
import { appointmentController } from '../controllers/Appointment.controller';
import { CreateAppointmentSchema } from '../dtos/CreateAppointment.dto';
import { UpdateAppointmentStatusSchema } from '../dtos/UpdateAppointmentStatus.dto';
import { UserRole } from '../entities/UserRole.enum';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validateRequest } from '../middlewares/validateRequest.middleware';

const appointmentRoutes = Router();

appointmentRoutes.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT),
  validateRequest(CreateAppointmentSchema),
  appointmentController.create.bind(appointmentController),
);

appointmentRoutes.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ATTENDANT, UserRole.DOCTOR),
  validateRequest(UpdateAppointmentStatusSchema),
  appointmentController.updateStatus.bind(appointmentController),
);

export { appointmentRoutes };
