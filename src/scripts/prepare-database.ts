import 'dotenv/config';
import { AppDataSource } from '../database/data-source';
import { validateEnv } from '../utils/validateEnv';
import { runAdminSeed } from './seed-admin.core';

const DEFAULT_ATTEMPTS = 20;
const DEFAULT_DELAY_MS = 3000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function connectWithRetry(): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= DEFAULT_ATTEMPTS; attempt += 1) {
    try {
      await AppDataSource.initialize();
      console.log(`[MedClinic-API][db:prepare] Conectado ao PostgreSQL na tentativa ${attempt}.`);
      return;
    } catch (error) {
      lastError = error;
      console.warn(
        `[MedClinic-API][db:prepare] Tentativa ${attempt}/${DEFAULT_ATTEMPTS} falhou. Aguardando banco ficar pronto...`,
      );
      await sleep(DEFAULT_DELAY_MS);
    }
  }

  throw lastError;
}

async function prepareDatabase(): Promise<void> {
  validateEnv();
  await connectWithRetry();

  const migrations = await AppDataSource.runMigrations();
  console.log(`[MedClinic-API][db:prepare] Migrations aplicadas: ${migrations.length}.`);

  if (process.env.RUN_ADMIN_SEED === 'true') {
    const result = await runAdminSeed(AppDataSource, {
      name: process.env.ADMIN_SEED_NAME,
      email: process.env.ADMIN_SEED_EMAIL,
      password: process.env.ADMIN_SEED_PASSWORD,
    });
    console.log(`[MedClinic-API][db:prepare] Seed do admin: ${result}.`);
  }
}

prepareDatabase()
  .catch((error) => {
    console.error('[MedClinic-API][db:prepare] Falha ao preparar banco:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
