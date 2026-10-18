import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MedClinicInit1720000000001 implements MigrationInterface {
  name = 'MedClinicInit1720000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'secretary'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nome" character varying(150) NOT NULL,
        "email" character varying(150) NOT NULL,
        "senha" character varying(255) NOT NULL,
        "role" user_role NOT NULL DEFAULT 'secretary',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_users_email_unique" ON "users" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_role" ON "users" ("role")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_users_role"`);
    await queryRunner.query(`DROP INDEX "idx_users_email_unique"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
