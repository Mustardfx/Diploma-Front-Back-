import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordResetToUsers1781448700000 implements MigrationInterface {
    name = 'AddPasswordResetToUsers1781448700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_token_hash" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_token_expires" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" ADD "must_change_password" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "must_change_password"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_token_expires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_token_hash"`);
    }
}
