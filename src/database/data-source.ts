import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { Appointment } from '../entities/Appointment.entity';
import { Doctor } from '../entities/Doctor.entity';
import { MedicalRecord } from '../entities/MedicalRecord.entity';
import { Patient } from '../entities/Patient.entity';
import { User } from '../entities/User.entity';
import { WorkSchedule } from '../entities/WorkSchedule.entity';

export const appEntities = [User, Doctor, WorkSchedule, Patient, Appointment, MedicalRecord];
export const appMigrations = [`${__dirname}/migrations/**/*.ts`, `${__dirname}/migrations/**/*.js`];

export function buildAppDataSourceOptions(
  overrides: Partial<PostgresConnectionOptions> = {},
): PostgresConnectionOptions {
  const sslEnabled = process.env.DB_SSL_ENABLED === 'true';

  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: appEntities,
    migrations: appMigrations,
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    ...overrides,
  };
}

export function createAppDataSource(
  overrides: Partial<PostgresConnectionOptions> = {},
): DataSource {
  return new DataSource(buildAppDataSourceOptions(overrides));
}

export const AppDataSource = createAppDataSource();
