import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuth1701893820589 implements MigrationInterface {
    name = 'AddAuth1701893820589'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "password" character varying(70)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
    }

}
