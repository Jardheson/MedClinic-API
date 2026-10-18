import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MedClinicDoctorsModule1720000000003 implements MigrationInterface {
  name = 'MedClinicDoctorsModule1720000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "doctors" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "crm" character varying(20) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_doctors_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_doctors_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_doctors_crm_unique" ON "doctors" ("crm")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_doctors_user_id_unique" ON "doctors" ("user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_doctors_user_id_unique"`);
    await queryRunner.query(`DROP INDEX "idx_doctors_crm_unique"`);
    await queryRunner.query(`DROP TABLE "doctors"`);
  }
}
