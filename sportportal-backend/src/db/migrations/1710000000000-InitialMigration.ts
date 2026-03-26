import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1710000000000 implements MigrationInterface {
  name = 'InitialMigration1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Расширение для UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Enum типы
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('admin', 'coach', 'athlete', 'judge')
    `);
    await queryRunner.query(`
      CREATE TYPE "enrollment_status_enum" AS ENUM ('active', 'completed', 'cancelled')
    `);
    await queryRunner.query(`
      CREATE TYPE "competition_status_enum" AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled')
    `);
    await queryRunner.query(`
      CREATE TYPE "registration_status_enum" AS ENUM ('pending', 'approved', 'rejected', 'withdrawn')
    `);

    // Таблица users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email"        VARCHAR NOT NULL UNIQUE,
        "password"     VARCHAR NOT NULL,
        "role"         "user_role_enum" NOT NULL DEFAULT 'athlete',
        "first_name"   VARCHAR NOT NULL,
        "last_name"    VARCHAR NOT NULL,
        "patronymic"   VARCHAR,
        "phone"        VARCHAR,
        "city"         VARCHAR,
        "sport"        VARCHAR,
        "birth_date"   DATE,
        "bio"          TEXT,
        "avatar"       VARCHAR,
        "created_at"   TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Таблица sections
    await queryRunner.query(`
      CREATE TABLE "sections" (
        "id"               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name"             VARCHAR NOT NULL,
        "sport"            VARCHAR NOT NULL,
        "coach_id"         UUID NOT NULL REFERENCES "users"("id") ON DELETE SET NULL,
        "description"      TEXT,
        "location"         VARCHAR NOT NULL,
        "schedule"         JSONB NOT NULL DEFAULT '[]',
        "max_participants" INTEGER NOT NULL,
        "age_min"          INTEGER,
        "age_max"          INTEGER,
        "price"            NUMERIC,
        "is_active"        BOOLEAN NOT NULL DEFAULT true,
        "created_at"       TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Таблица enrollments
    await queryRunner.query(`
      CREATE TABLE "enrollments" (
        "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "section_id"  UUID NOT NULL REFERENCES "sections"("id") ON DELETE CASCADE,
        "user_id"     UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "status"      "enrollment_status_enum" NOT NULL DEFAULT 'active',
        "enrolled_at" TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE("section_id", "user_id")
      )
    `);

    // Таблица attendance
    await queryRunner.query(`
      CREATE TABLE "attendance" (
        "id"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "enrollment_id" UUID NOT NULL REFERENCES "enrollments"("id") ON DELETE CASCADE,
        "section_id"    UUID NOT NULL REFERENCES "sections"("id") ON DELETE CASCADE,
        "user_id"       UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "date"          DATE NOT NULL,
        "present"       BOOLEAN NOT NULL DEFAULT true,
        "note"          VARCHAR,
        "created_at"    TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE("user_id", "section_id", "date")
      )
    `);

    // Таблица competitions
    await queryRunner.query(`
      CREATE TABLE "competitions" (
        "id"                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name"                    VARCHAR NOT NULL,
        "sport"                   VARCHAR NOT NULL,
        "organizer_id"            UUID NOT NULL REFERENCES "users"("id") ON DELETE SET NULL,
        "description"             TEXT,
        "location"                VARCHAR NOT NULL,
        "start_date"              DATE NOT NULL,
        "end_date"                DATE NOT NULL,
        "registration_deadline"   DATE NOT NULL,
        "max_participants"        INTEGER NOT NULL,
        "status"                  "competition_status_enum" NOT NULL DEFAULT 'upcoming',
        "categories"              JSONB NOT NULL DEFAULT '[]',
        "created_at"              TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Таблица competition_registrations
    await queryRunner.query(`
      CREATE TABLE "competition_registrations" (
        "id"              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "competition_id"  UUID NOT NULL REFERENCES "competitions"("id") ON DELETE CASCADE,
        "user_id"         UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "category_id"     VARCHAR NOT NULL,
        "status"          "registration_status_enum" NOT NULL DEFAULT 'pending',
        "judge_id"        UUID REFERENCES "users"("id") ON DELETE SET NULL,
        "registered_at"   TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Таблица competition_results
    await queryRunner.query(`
      CREATE TABLE "competition_results" (
        "id"               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "competition_id"   UUID NOT NULL REFERENCES "competitions"("id") ON DELETE CASCADE,
        "registration_id"  UUID NOT NULL REFERENCES "competition_registrations"("id") ON DELETE CASCADE,
        "user_id"          UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "category_id"      VARCHAR NOT NULL,
        "place"            INTEGER,
        "score"            NUMERIC,
        "notes"            TEXT,
        "judge_id"         UUID NOT NULL REFERENCES "users"("id") ON DELETE SET NULL,
        "recorded_at"      TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE("registration_id")
      )
    `);

    // Индексы для производительности
    await queryRunner.query(`CREATE INDEX "idx_sections_coach" ON "sections"("coach_id")`);
    await queryRunner.query(`CREATE INDEX "idx_enrollments_user" ON "enrollments"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_enrollments_section" ON "enrollments"("section_id")`);
    await queryRunner.query(`CREATE INDEX "idx_attendance_user_section" ON "attendance"("user_id", "section_id")`);
    await queryRunner.query(`CREATE INDEX "idx_comp_regs_competition" ON "competition_registrations"("competition_id")`);
    await queryRunner.query(`CREATE INDEX "idx_comp_regs_user" ON "competition_registrations"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_results_competition" ON "competition_results"("competition_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "competition_results"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "competition_registrations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "competitions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attendance"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "enrollments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sections"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "registration_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "competition_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "enrollment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
