import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUserPasswordNull1700000000000 implements MigrationInterface {
    name = 'FixUserPasswordNull1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`
            UPDATE "user" 
            SET "password" = '$2b$10$defaulttemporarypasswordhash' 
            WHERE "password" IS NULL
        `);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
    }
}