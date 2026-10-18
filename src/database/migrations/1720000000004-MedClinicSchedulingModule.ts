import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MedClinicSchedulingModule1720000000004 implements MigrationInterface {
  name = 'MedClinicSchedulingModule1720000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE work_schedule_weekday AS ENUM ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    );

    await queryRunner.query(
      `CREATE TABLE "work_schedules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "doctor_id" uuid NOT NULL,
        "weekday" work_schedule_weekday NOT NULL,
        "start_time" TIME NOT NULL,
        "end_time" TIME NOT NULL,
        "slot_duration_minutes" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_work_schedules_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_work_schedules_doctor" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_work_schedules_doctor_weekday" ON "work_schedules" ("doctor_id", "weekday")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_work_schedules_doctor_weekday"`);
    await queryRunner.query(`DROP TABLE "work_schedules"`);
    await queryRunner.query(`DROP TYPE "work_schedule_weekday"`);
  }
}
