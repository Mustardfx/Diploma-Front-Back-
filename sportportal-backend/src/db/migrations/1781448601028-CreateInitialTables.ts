import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1781448601028 implements MigrationInterface {
    name = 'CreateInitialTables1781448601028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'coach', 'athlete', 'judge')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'athlete', "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "patronymic" character varying, "phone" character varying, "city" character varying, "sport" character varying, "birth_date" date, "bio" text, "avatar" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "sport" character varying NOT NULL, "coach_id" uuid, "description" text, "location" character varying NOT NULL, "schedule" jsonb NOT NULL DEFAULT '[]', "max_participants" integer NOT NULL, "age_min" integer, "age_max" integer, "price" numeric, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f9749dd3bffd880a497d007e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."competitions_status_enum" AS ENUM('upcoming', 'ongoing', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "competitions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "sport" character varying NOT NULL, "organizer_id" uuid NOT NULL, "description" text, "location" character varying NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "registration_deadline" date NOT NULL, "max_participants" integer NOT NULL, "status" "public"."competitions_status_enum" NOT NULL DEFAULT 'upcoming', "categories" jsonb NOT NULL DEFAULT '[]', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ef273910798c3a542b475e75c7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."competition_registrations_status_enum" AS ENUM('pending', 'approved', 'rejected', 'withdrawn')`);
        await queryRunner.query(`CREATE TABLE "competition_registrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "competition_id" uuid NOT NULL, "user_id" uuid NOT NULL, "category_id" character varying NOT NULL, "status" "public"."competition_registrations_status_enum" NOT NULL DEFAULT 'pending', "judge_id" character varying, "registered_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1cb0ec5c3f6296000f254d42baa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "competition_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "competition_id" uuid NOT NULL, "registration_id" uuid NOT NULL, "user_id" uuid NOT NULL, "category_id" character varying NOT NULL, "place" integer, "score" numeric, "notes" text, "judge_id" uuid NOT NULL, "recorded_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f062f33ae3fb33f0d1cbae35c44" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."enrollments_status_enum" AS ENUM('active', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "enrollments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "section_id" uuid NOT NULL, "user_id" uuid NOT NULL, "status" "public"."enrollments_status_enum" NOT NULL DEFAULT 'active', "enrolled_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7c0f752f9fb68bf6ed7367ab00f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attendance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "enrollment_id" uuid NOT NULL, "section_id" uuid NOT NULL, "user_id" uuid NOT NULL, "date" date NOT NULL, "present" boolean NOT NULL DEFAULT true, "note" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ee0ffe42c1f1a01e72b725c0cb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sections" ADD CONSTRAINT "FK_ab38c6afcbb75a836fcfd196b6e" FOREIGN KEY ("coach_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "competitions" ADD CONSTRAINT "FK_44e04509827273880822fb4eb78" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "competition_registrations" ADD CONSTRAINT "FK_be6b6ee51209a66b81c39b267a0" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "competition_registrations" ADD CONSTRAINT "FK_27f39b0f1c0c614a7b47b7e6611" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "competition_results" ADD CONSTRAINT "FK_ad99acdb668877a36b7e8436405" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "competition_results" ADD CONSTRAINT "FK_d42fc14c21718ecd46f13e41840" FOREIGN KEY ("registration_id") REFERENCES "competition_registrations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "competition_results" ADD CONSTRAINT "FK_cc457c60ac5775202aae6c5996a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "competition_results" ADD CONSTRAINT "FK_f02a4f40edb2ed3123f3fc493a8" FOREIGN KEY ("judge_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_ebbb1eaa243b6fd10a61fe38c78" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_ff997f5a39cd24a491b9aca45c9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_005fdbba9ac200693005f5ab21f" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_24ca79eed4c4ef0bc8cfb634b5b" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_0bedbcc8d5f9b9ec4979f519597" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_0bedbcc8d5f9b9ec4979f519597"`);
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_24ca79eed4c4ef0bc8cfb634b5b"`);
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_005fdbba9ac200693005f5ab21f"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_ff997f5a39cd24a491b9aca45c9"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_ebbb1eaa243b6fd10a61fe38c78"`);
        await queryRunner.query(`ALTER TABLE "competition_results" DROP CONSTRAINT "FK_f02a4f40edb2ed3123f3fc493a8"`);
        await queryRunner.query(`ALTER TABLE "competition_results" DROP CONSTRAINT "FK_cc457c60ac5775202aae6c5996a"`);
        await queryRunner.query(`ALTER TABLE "competition_results" DROP CONSTRAINT "FK_d42fc14c21718ecd46f13e41840"`);
        await queryRunner.query(`ALTER TABLE "competition_results" DROP CONSTRAINT "FK_ad99acdb668877a36b7e8436405"`);
        await queryRunner.query(`ALTER TABLE "competition_registrations" DROP CONSTRAINT "FK_27f39b0f1c0c614a7b47b7e6611"`);
        await queryRunner.query(`ALTER TABLE "competition_registrations" DROP CONSTRAINT "FK_be6b6ee51209a66b81c39b267a0"`);
        await queryRunner.query(`ALTER TABLE "competitions" DROP CONSTRAINT "FK_44e04509827273880822fb4eb78"`);
        await queryRunner.query(`ALTER TABLE "sections" DROP CONSTRAINT "FK_ab38c6afcbb75a836fcfd196b6e"`);
        await queryRunner.query(`DROP TABLE "attendance"`);
        await queryRunner.query(`DROP TABLE "enrollments"`);
        await queryRunner.query(`DROP TYPE "public"."enrollments_status_enum"`);
        await queryRunner.query(`DROP TABLE "competition_results"`);
        await queryRunner.query(`DROP TABLE "competition_registrations"`);
        await queryRunner.query(`DROP TYPE "public"."competition_registrations_status_enum"`);
        await queryRunner.query(`DROP TABLE "competitions"`);
        await queryRunner.query(`DROP TYPE "public"."competitions_status_enum"`);
        await queryRunner.query(`DROP TABLE "sections"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
