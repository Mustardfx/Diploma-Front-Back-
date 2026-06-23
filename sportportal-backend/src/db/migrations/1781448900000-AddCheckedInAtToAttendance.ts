import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCheckedInAtToAttendance1781448900000 implements MigrationInterface {
    name = 'AddCheckedInAtToAttendance1781448900000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" ADD "checked_in_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP COLUMN "checked_in_at"`);
    }
}
