import { Router } from 'express';
import { adminRoutes } from './admin.routes';
import { appointmentRoutes } from './appointments.routes';
import { authRoutes } from './auth.routes';
import { calendarRoutes } from './calendars.routes';
import { doctorRoutes } from './doctors.routes';
import { medicalRecordRoutes } from './medicalRecords.routes';
import { patientRoutes } from './patients.routes';
import { userRoutes } from './user.routes';
import { workScheduleRoutes } from './workSchedules.routes';

const routes = Router();
const apiV1Routes = Router();

apiV1Routes.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
apiV1Routes.use('/auth', authRoutes);
apiV1Routes.use('/users', userRoutes);
apiV1Routes.use('/admin', adminRoutes);
apiV1Routes.use('/doctors', doctorRoutes);
apiV1Routes.use('/doctors', workScheduleRoutes);
apiV1Routes.use('/doctors', calendarRoutes);
apiV1Routes.use('/patients', patientRoutes);
apiV1Routes.use('/patients', medicalRecordRoutes);
apiV1Routes.use('/appointments', appointmentRoutes);

routes.use('/api/v1', apiV1Routes);

export { routes };
