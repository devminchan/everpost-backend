import { MigrationInterface, QueryRunner } from 'typeorm';

export class ContentColumnName1583991188113 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`RENAME TABLE image_resource TO file_resource`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`RENAME TABLE file_resource TO image_resource`);
  }
}
