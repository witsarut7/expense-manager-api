import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { TableName } from '../table-name.enum';
import { defaultTableOptions } from '../default-table-options';

export class categoryTable1685439087429 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: TableName.CATEGORY,
        columns: [
          ...defaultTableOptions,
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(TableName.CATEGORY);
  }
}
