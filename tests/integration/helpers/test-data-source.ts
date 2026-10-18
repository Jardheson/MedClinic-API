import { DataSource } from 'typeorm';
import { createAppDataSource } from '../../../src/database/data-source';
import { MedClinicInit1720000000001 } from '../../../src/database/migrations/1720000000001-MedClinicInit';
import { MedClinicClinicalModule1720000000002 } from '../../../src/database/migrations/1720000000002-MedClinicClinicalModule';
import { MedClinicDoctorsModule1720000000003 } from '../../../src/database/migrations/1720000000003-MedClinicDoctorsModule';
import { MedClinicSchedulingModule1720000000004 } from '../../../src/database/migrations/1720000000004-MedClinicSchedulingModule';

const integrationMigrations = [
  MedClinicInit1720000000001,
  MedClinicClinicalModule1720000000002,
  MedClinicDoctorsModule1720000000003,
  MedClinicSchedulingModule1720000000004,
];

const integrationEnv = {
  host: process.env.TEST_DB_HOST,
  port: process.env.TEST_DB_PORT,
  username: process.env.TEST_DB_USER,
  password: process.env.TEST_DB_PASSWORD,
  database: process.env.TEST_DB_NAME,
};

export function isIntegrationDatabaseConfigured(): boolean {
  return Object.values(integrationEnv).every((value) => Boolean(value));
}

export function createIntegrationDataSource(): DataSource {
  return createAppDataSource({
    host: integrationEnv.host,
    port: Number(integrationEnv.port ?? 5432),
    username: integrationEnv.username,
    password: integrationEnv.password,
    database: integrationEnv.database,
    synchronize: false,
    migrationsRun: false,
    logging: false,
    ssl: false,
    migrations: integrationMigrations,
  });
}

export async function resetIntegrationDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    'TRUNCATE TABLE "medical_records", "appointments", "work_schedules", "doctors", "patients", "users" RESTART IDENTITY CASCADE',
  );
}
