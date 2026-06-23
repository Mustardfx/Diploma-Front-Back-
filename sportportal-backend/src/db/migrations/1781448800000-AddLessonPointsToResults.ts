import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLessonPointsToResults1781448800000 implements MigrationInterface {
    name = 'AddLessonPointsToResults1781448800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Тип результата: соревнование или урок
        await queryRunner.query(`CREATE TYPE "public"."competition_results_type_enum" AS ENUM('competition', 'lesson')`);
        await queryRunner.query(`ALTER TABLE "competition_results" ADD "type" "public"."competition_results_type_enum" NOT NULL DEFAULT 'competition'`);

        // Поля соревнований становятся опциональными (для строк-уроков)
        await queryRunner.query(`ALTER TABLE "competition_results" ALTER COLUMN "competition_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "competition_results" ALTER COLUMN "registration_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "competition_results" ALTER COLUMN "category_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "competition_results" ALTER COLUMN "judge_id" DROP NOT NULL`);

        // Поля урока
        await queryRunner.query(`ALTER TABLE "competition_results" ADD "section_id" uuid`);
        await queryRunner.query(`ALTER TABLE "competition_results" ADD "lesson_date" date`);
        await queryRunner.query(`ALTER TABLE "competition_results" ADD "awarded_by" uuid`);
        await queryRunner.query(`ALTER TABLE "competition_results" ADD CONSTRAINT "FK_cr_section" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "competition_results" ADD CONSTRAINT "FK_cr_awarded_by" FOREIGN KEY ("awarded_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "competition_results" DROP CONSTRAINT "FK_cr_awarded_by"`);
        await queryRunner.query(`ALTER TABLE "competition_results" DROP CONSTRAINT "FK_cr_section"`);
        await queryRunner.query(`ALTER TABLE "competition_results" DROP COLUMN "awarded_by"`);
        await queryRunner.query(`ALTER TABLE "competition_results" DROP COLUMN "lesson_date"`);
        await queryRunner.query(`ALTER TABLE "competition_results" DROP COLUMN "section_id"`);

        await queryRunner.query(`ALTER TABLE "competition_results" ALTER COLUMN "judge_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "competition_results" ALTER COLUMN "category_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "competition_results" ALTER COLUMN "registration_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "competition_results" ALTER COLUMN "competition_id" SET NOT NULL`);

        await queryRunner.query(`ALTER TABLE "competition_results" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."competition_results_type_enum"`);
    }
}
