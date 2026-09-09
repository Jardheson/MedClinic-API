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
    console.log(`[MedClinic-API]   POST   /auth/register`);
    console.log(`[MedClinic-API]   POST   /auth/login`);
    console.log(`[MedClinic-API]   GET    /users/me`);
    console.log(`[MedClinic-API]   GET    /admin/ping`);
    console.log(`[MedClinic-API]   GET    /health`);
  });
}

bootstrap().catch((error) => {
  console.error('[MedClinic-API] Falha ao iniciar o servidor:', error);
  process.exit(1);
});
