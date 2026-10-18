import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MedClinicClinicalModule1720000000002 implements MigrationInterface {
  name = 'MedClinicClinicalModule1720000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_enum
          WHERE enumlabel = 'doctor'
            AND enumtypid = 'user_role'::regtype
        ) THEN
          ALTER TYPE user_role ADD VALUE 'doctor';
        END IF;
      END $$`,
    );

    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE appointment_status AS ENUM ('scheduled', 'in_progress', 'done', 'canceled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    );

    await queryRunner.query(
      `CREATE TABLE "patients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(150) NOT NULL,
        "cpf" character varying(11) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_patients_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_patients_cpf_unique" ON "patients" ("cpf")`,
    );

    await queryRunner.query(
      `CREATE TABLE "appointments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "doctor_id" uuid NOT NULL,
        "patient_id" uuid NOT NULL,
        "status" appointment_status NOT NULL DEFAULT 'scheduled',
        "starts_at" TIMESTAMP NOT NULL,
        "ends_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_appointments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_appointments_doctor" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_appointments_patient" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_appointments_patient_status" ON "appointments" ("patient_id", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_appointments_doctor_status" ON "appointments" ("doctor_id", "status")`,
    );

    await queryRunner.query(
      `CREATE TABLE "medical_records" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "doctor_id" uuid NOT NULL,
        "patient_id" uuid NOT NULL,
        "descricao" text NOT NULL,
        "prescricao" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_medical_records_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_medical_records_doctor" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_medical_records_patient" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_medical_records_patient_created_at" ON "medical_records" ("patient_id", "created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_medical_records_patient_created_at"`);
    await queryRunner.query(`DROP TABLE "medical_records"`);
    await queryRunner.query(`DROP INDEX "idx_appointments_doctor_status"`);
    await queryRunner.query(`DROP INDEX "idx_appointments_patient_status"`);
    await queryRunner.query(`DROP TABLE "appointments"`);
    await queryRunner.query(`DROP INDEX "idx_patients_cpf_unique"`);
    await queryRunner.query(`DROP TABLE "patients"`);
    await queryRunner.query(`DROP TYPE "appointment_status"`);
  }
}
