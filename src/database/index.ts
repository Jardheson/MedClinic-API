import { AppDataSource } from './data-source';

export async function connectDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('[MedClinic-API] Conexão com PostgreSQL estabelecida com sucesso via TypeORM.');
  } catch (error) {
    console.error('[MedClinic-API] Falha ao conectar ao PostgreSQL:', error);
    process.exit(1);
  }
}
