import 'dotenv/config';
import { AppDataSource } from '../database/data-source';
import { runAdminSeed } from './seed-admin.core';

async function seedAdmin(): Promise<void> {
  await AppDataSource.initialize();
  const result = await runAdminSeed(AppDataSource, {
    name: process.env.ADMIN_SEED_NAME,
    email: process.env.ADMIN_SEED_EMAIL,
    password: process.env.ADMIN_SEED_PASSWORD,
  });

  if (result === 'skipped') {
    console.log('[MedClinic-API][seed:admin] Já existe um administrador cadastrado. Seed ignorado.');
    return;
  }

  console.log('[MedClinic-API][seed:admin] Administrador criado com sucesso.');
}

seedAdmin()
  .catch((error) => {
    console.error('[MedClinic-API][seed:admin] Falha ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
