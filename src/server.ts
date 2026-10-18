import 'dotenv/config';
import { app } from './app';
import { connectDatabase } from './database';
import { validateEnv } from './utils/validateEnv';

validateEnv();

const PORT = Number(process.env.PORT ?? 3000);

async function bootstrap(): Promise<void> {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(
      `[MedClinic-API] Servidor rodando na porta ${PORT} (${process.env.NODE_ENV ?? 'development'}).`,
    );
    console.log(`[MedClinic-API] Rotas disponíveis:`);
    console.log(`[MedClinic-API]   GET    /api/v1/health`);
    console.log(`[MedClinic-API]   POST   /api/v1/auth/login`);
    console.log(`[MedClinic-API]   GET    /api/v1/users/me`);
    console.log(`[MedClinic-API]   POST   /api/v1/users`);
    console.log(`[MedClinic-API]   GET    /api/v1/admin/ping`);
    console.log(`[MedClinic-API]   POST   /api/v1/doctors`);
    console.log(`[MedClinic-API]   GET    /api/v1/doctors`);
    console.log(`[MedClinic-API]   PUT    /api/v1/doctors/:doctorId/work-schedule`);
    console.log(`[MedClinic-API]   GET    /api/v1/doctors/:doctorId/calendar`);
    console.log(`[MedClinic-API]   POST   /api/v1/patients`);
    console.log(`[MedClinic-API]   GET    /api/v1/patients/:id`);
    console.log(`[MedClinic-API]   POST   /api/v1/appointments`);
    console.log(`[MedClinic-API]   PATCH  /api/v1/appointments/:id/status`);
    console.log(`[MedClinic-API]   GET    /api/v1/patients/:patientId/medical-records`);
    console.log(`[MedClinic-API]   POST   /api/v1/patients/:patientId/medical-records`);
  });
}

bootstrap().catch((error) => {
  console.error('[MedClinic-API] Falha ao iniciar o servidor:', error);
  process.exit(1);
});
